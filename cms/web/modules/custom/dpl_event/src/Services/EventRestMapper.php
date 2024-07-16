<?php

namespace Drupal\dpl_event\Services;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventPATCHRequestExternalData;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerAddress;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerDateTime;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerImage;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerSeries;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInnerPrice;
use Drupal\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\dpl_event\EventWrapper;
use Drupal\file\FileInterface;
use Drupal\media\MediaInterface;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Safe\DateTime;

/**
 * Translator understand the link between EventInstances and resource objects.
 */
class EventRestMapper {

  /**
   * File URL generator, used for creating image URLs.
   */
  private FileUrlGeneratorInterface $fileUrlGenerator;

  /**
   * EventWrapper, a suite of eventinstance helper methods.
   */
  private EventWrapper $eventWrapper;

  /**
   * The eventinstance.
   */
  private EventInstance $event;

  /**
   * {@inheritDoc}
   */
  public function __construct(FileUrlGeneratorInterface $file_url_generator) {
    $this->fileUrlGenerator = $file_url_generator;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static($container->get('file_url_generator'));
  }

  /**
   * {@inheritDoc}
   */
  public function getResponse(EventInstance $event_instance): EventsGET200ResponseInner {
    $this->event = $event_instance;
    $this->eventWrapper = new EventWrapper($this->event);

    return new EventsGET200ResponseInner([
      'title' => $this->event->label(),
      'uuid' => $this->event->uuid(),
      'url' => $this->event->toUrl()->setAbsolute(TRUE)->toString(TRUE)->getGeneratedUrl(),
      'ticketManagerRelevance' => !empty($this->getValue('event_relevant_ticket_manager')),
      'description' => $this->getValue('event_description'),
      'body' => $this->getDescription(),
      'state' => $this->eventWrapper->getState()?->value,
      'image' => $this->getImage(),
      'branches' => $this->getBranches(),
      'address' => $this->getAddress(),
      'tags' => $this->getTags(),
      'ticketCapacity' => $this->getValue('event_ticket_capacity'),
      'ticketCategories' => $this->getTicketCategories(),
      'createdAt' => $this->getDateField('created'),
      'updatedAt' => $this->getDateField('changed'),
      'dateTime' => $this->getDate(),
      'externalData' => $this->getExternalData(),
      'series' => new EventsGET200ResponseInnerSeries([
        'uuid' => $this->event->getEventSeries()->uuid(),
      ]),
    ]);
  }

  /**
   * Getting associated branches.
   *
   * @return string[]
   *   The translated branch labels.
   */
  private function getBranches(): array {
    $names = [];

    /** @var \Drupal\node\NodeInterface[] $branches */
    $branches = $this->event->get('branch')->referencedEntities();

    foreach ($branches as $branch) {
      $label = $branch->getTitle();

      if (!empty($label)) {
        $names[] = $label;
      }
    }

    return $names;
  }

  /**
   * Getting associated tags.
   *
   * @return string[]
   *   The translated tag labels.
   */
  private function getTags(): array {
    $names = [];

    /** @var \Drupal\taxonomy\TermInterface[] $tags */
    $tags = $this->event->get('event_tags')->referencedEntities();

    foreach ($tags as $tag) {
      $names[] = $tag->getName();
    }

    return $names;
  }

  /**
   * Getting the description, from the first available text paragraph.
   */
  private function getDescription(): ?string {
    /** @var \Drupal\paragraphs\ParagraphInterface[] $paragraphs */
    $paragraphs = $this->event->get('event_paragraphs')->referencedEntities();

    foreach ($paragraphs as $paragraph) {
      if ($paragraph->bundle() === 'text_body') {
        return $paragraph->get('field_body')->getValue()[0]['value'] ?? NULL;
      }
    }

    return NULL;
  }

  /**
   * Getting the external data, supplied by third party PATCH.
   */
  private function getExternalData(): EventPATCHRequestExternalData {
    return new EventPATCHRequestExternalData([
      'adminUrl' => $this->getValue('field_external_admin_link'),
      'url' => $this->getValue('event_link'),
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

    $site_timezone = new \DateTimeZone(date_default_timezone_get());

    $date_start = new DateTime($start, new \DateTimeZone('UTC'));
    $date_start->setTimezone($site_timezone);
    $date_end = new DateTime($end, new \DateTimeZone('UTC'));
    $date_end->setTimezone($site_timezone);

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

    $field = $this->eventWrapper->getField('event_ticket_categories');

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

    $address = new EventsGET200ResponseInnerAddress();
    $address->setLocation($this->getValue('event_place'));
    $address->setStreet("$address_1 $address_2");
    $address->setZipCode(!empty($zip) ? intval($zip) : NULL);
    $address->setCity($value[0]['locality'] ?? NULL);
    $address->setCountry($value[0]['country_code'] ?? NULL);

    return $address;
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
  private function getValue(string $field_name): ?string {

    $field = $this->eventWrapper->getField($field_name);

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    return $field->getString();
  }

  /**
   * Get the event image, loading the file and generating the original URL.
   */
  private function getImage(): ?EventsGET200ResponseInnerImage {
    $media_field = $this->eventWrapper->getField('event_image');

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
