<?php

namespace Drupal\dpl_redia_legacy;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\dpl_event\EventWrapper;
use Drupal\node\NodeInterface;
use Drupal\recurring_events\Entity\EventInstance;

/**
 * An event object, containing the properties the RSS feed needs.
 */
class RediaEvent extends ControllerBase {
  // We'll disable the documentation rules for the member properties, as
  // they are pretty self-explanatory.
  // phpcs:disable
  public ?string $title;
  public ?string $description;
  public ?string $author;
  public string|int|null $id;
  public ?string $date;
  public ?string $subtitle;
  public ?string $startTime;
  public ?string $endTime;
  public ?NodeInterface $branch;
  public ?RediaEventMedia $media;
  public ?RediaEventMedia $mediaThumbnail;
  // phpcs:enable

  /**
   * Promoted value.
   *
   * @var "Falsk"|"Sandt"
   *  The promoted value, that Redia understands
   */
  public string $promoted;

  public function __construct(EventInstance $event_instance) {
    $event_wrapper = new EventWrapper($event_instance);

    $branch = $event_wrapper->getBranches()[0] ?? NULL;
    $start_date = $event_wrapper->getStartDate();
    $end_date = $event_wrapper->getEndDate();

    $changed_date = DrupalDateTime::createFromFormat('U', strval($event_instance->getChangedTime()));

    $media = NULL;
    $media_field = $event_instance->get('event_image');

    if (($media_field instanceof FieldItemListInterface)) {
      $media = $media_field->referencedEntities()[0] ?? NULL;
    }

    $this->title = $event_instance->label();
    // The description for an event may contain HTML tags which are not allowed
    // in an RSS/XML feed. Encode them.
    $this->description = htmlspecialchars($event_wrapper->getDescription() ?? "");
    $this->author = $event_instance->getOwner()->get('field_author_name')->getString();
    $this->id = $event_instance->id();
    $this->date = $changed_date->format('r');
    $this->subtitle = $event_wrapper->getField('event_description')?->getString();
    $this->startTime = $start_date->format('U');
    $this->endTime = $end_date->format('U');
    $this->media = NULL;
    $this->mediaThumbnail = NULL;

    if ($media) {
      $this->media = new RediaEventMedia($media, 'redia_feed_large');
      $this->mediaThumbnail = new RediaEventMedia($media, 'redia_feed_small');
    }

    $this->branch = $branch;

    // In the old system, there was a way for editors to mark content a
    // promoted. However, this does not exist in the new CMS, so we wil
    // just hardcode it.
    $this->promoted = 'Falsk';
  }

}
