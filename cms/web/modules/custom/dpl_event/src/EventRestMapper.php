<?php

namespace Drupal\dpl_event;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerAddress;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerDateTime;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerImage;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerSeries;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInnerPrice;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\file\FileInterface;
use Drupal\media\MediaInterface;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Safe\DateTime;
use function Safe\strtotime;

/**
 * Translator understand the link between EventInstances and resource objects.
 */
class EventRestMapper {

  /**
   * Xxx.
   */
  private FileUrlGeneratorInterface $fileUrlGenerator;

  /**
   * Xxx.
   */
  private EventWrapper $eventWrapper;

  /**
   * Xxx.
   */
  private EventInstance $event;

  /**
   * {@inheritDoc}
   */
  public function __construct(
    EventInstance $event) {
    $this->event = $event;
    $this->eventWrapper = new EventWrapper($this->event);

    // @todo Replace this with dependency injection
    $this->fileUrlGenerator = DrupalTyped::service(FileUrlGeneratorInterface::class, 'file_url_generator');

  }

  /**
   * {@inheritDoc}
   */
  public function getResponse(): EventsGET200ResponseInner {
    return new EventsGET200ResponseInner([
      'title' => $this->event->label(),
      'uuid' => $this->event->uuid(),
      'url' => $this->event->toUrl()->setAbsolute(TRUE)->toString(TRUE)->getGeneratedUrl(),
      'description' => $this->getValue('field_event_description', 'event_description'),
      'state' => $this->eventWrapper->getState()?->value,
      'image' => $this->getImage(),
      'address' => $this->getAddress(),
      'ticketCategories' => $this->getTicketCategories(),
      'createdAt' => $this->getDateField('created'),
      'updatedAt' => $this->getDateField('changed'),
      'dateTime' => $this->getDate(),
      'series' => new EventsGET200ResponseInnerSeries([
        'uuid' => $this->event->getEventSeries()->uuid(),
      ]),
    ]);
  }

  /**
   * Helper, getting the event instance date in correct format.
   */
  private function getDate(): ?EventsGET200ResponseInnerDateTime {
    $field = $this->eventWrapper->getField('date');

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    $value = $field->getValue();

    $start = $value[0]['value'] ?? NULL;
    $end = $value[0]['end_value'] ?? NULL;

    if (empty($start) || empty($end)) {
      return NULL;
    }

    $date_start = new DateTime();
    $date_start->setTimestamp(strtotime($start));

    $date_end = new DateTime();
    $date_end->setTimestamp(strtotime($end));

    return new EventsGET200ResponseInnerDateTime([
      'start' => $date_start,
      'end' => $date_end,
    ]);
  }

  /**
   * Helper, getting the event instance ticket categories (paragraphs).
   *
   * @return \DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInner[]
   *   The built categories objects, for use in response.
   */
  private function getTicketCategories(): array {

    $categories = [];

    $field = $this->eventWrapper->getField('field_ticket_categories', 'event_ticket_categories');

    if (!($field instanceof FieldItemListInterface)) {
      return $categories;
    }

    $paragraphs = $field->referencedEntities();
    foreach ($paragraphs as $paragraph) {
      if (!($paragraph instanceof ParagraphInterface)) {
        continue;
      }

      $title = $paragraph->hasField('field_ticket_category_name') ? $paragraph->get('field_ticket_category_name')->getString() : NULL;
      $price_value = $paragraph->hasField('field_ticket_category_price') ? $paragraph->get('field_ticket_category_price')->getString() : 0;

      if (empty($title)) {
        continue;
      }

      $price = new EventsGET200ResponseInnerTicketCategoriesInnerPrice([
        'value' => intval($price_value),
        'currency' => 'DKK',
      ]);

      $categories[] = new EventsGET200ResponseInnerTicketCategoriesInner([
        'title' => $title,
        'price' => $price,
      ]);
    }

    return $categories;
  }

  /**
   * Helper, getting the event address and place as a response format.
   *
   * Notice that this may be the address of the related branch.
   *
   * @see eventWrapper->getAddressField()
   */
  private function getAddress(): ?EventsGET200ResponseInnerAddress {
    $field = $this->eventWrapper->getAddressField();

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    $value = $field->getValue();

    $zip = $value[0]['postal_code'] ?? NULL;
    $address_1 = $value[0]['address_line1'] ?? NULL;
    $address_2 = $value[0]['address_line2'] ?? NULL;

    return new EventsGET200ResponseInnerAddress([
      'location' => $this->getValue('field_event_place', 'event_place'),
      'street' => "$address_1 $address_2",
      'zip_code' => !empty($zip) ? intval($zip) : NULL,
      'city' => $value[0]['locality'] ?? NULL,
      'country' => $value[0]['country_code'] ?? NULL,
    ]);
  }

  /**
   * Interpret a date field as a datetime object.
   */
  private function getDateField(string $field_name): ?DateTime {
    $timestamp = $this->getValue($field_name);

    if (empty($timestamp)) {
      return NULL;
    }

    $date = new DateTime();
    $date->setTimestamp(intval($timestamp));

    return $date;
  }

  /**
   * Get string value of a possible field (or fallback field).
   */
  private function getValue(string $field_name, ?string $fallback_field_name = NULL): ?string {

    $field = $this->eventWrapper->getField($field_name, $fallback_field_name);

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    return $field->getString();
  }

  /**
   * Get the event image, loading the file and generating the original URL.
   */
  private function getImage(): ?EventsGET200ResponseInnerImage {
    $media_field = $this->eventWrapper->getField('field_event_image', 'event_image');

    if (!($media_field instanceof FieldItemListInterface)) {
      return NULL;
    }

    $media = $media_field->referencedEntities()[0] ?? NULL;
    $file_field_name = 'field_media_image';

    if (!($media instanceof MediaInterface) || !$media->hasField($file_field_name)) {
      return NULL;
    }

    $file_field = $media->get($file_field_name);
    $file = $file_field->referencedEntities()[0] ?? NULL;

    if (!($file instanceof FileInterface)) {
      return NULL;
    }

    $file_uri = $file->getFileUri();

    $url = !empty($file_uri) ? $this->fileUrlGenerator->generateAbsoluteString($file_uri) : NULL;

    return new EventsGET200ResponseInnerImage(['url' => $url]);
  }

}
