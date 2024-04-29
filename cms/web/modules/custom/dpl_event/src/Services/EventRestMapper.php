<?php

namespace Drupal\dpl_event\Services;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerAddress;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerDateTime;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerImage;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerSeries;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInnerPrice;
use Drupal\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
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
   * Used for generating URLs to files.
   */
  private FileUrlGeneratorInterface $fileUrlGenerator;

  /**
   * The event helper service, that we use for generic event logic.
   */
  private EventHelper $eventHelper;

  /**
   * {@inheritDoc}
   */
  public function __construct(
    FileUrlGeneratorInterface $file_url_generator,
    EventHelper $event_helper,
  ) {
    $this->fileUrlGenerator = $file_url_generator;
    $this->eventHelper = $event_helper;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('file_url_generator'),
      $container->get('dpl_event.event_helper'),
    );
  }

  /**
   * {@inheritDoc}
   */
  public function getResponse(EventInstance $event_instance): EventsGET200ResponseInner {
    return new EventsGET200ResponseInner([
      'title' => $event_instance->label(),
      'uuid' => $event_instance->uuid(),
      'url' => $event_instance->toUrl()->setAbsolute(TRUE)->toString(TRUE)->getGeneratedUrl(),
      'description' => $this->getValue($event_instance, 'field_event_description', 'event_description'),
      'state' => $this->eventHelper->getState($event_instance)?->value,
      'image' => $this->getImage($event_instance),
      'address' => $this->getAddress($event_instance),
      'ticketCategories' => $this->getTicketCategories($event_instance),
      'createdAt' => $this->getDateField($event_instance, 'created'),
      'updatedAt' => $this->getDateField($event_instance, 'changed'),
      'dateTime' => $this->getDate($event_instance),
      'series' => new EventsGET200ResponseInnerSeries([
        'uuid' => $event_instance->getEventSeries()->uuid(),
      ]),
    ]
    );
  }

  /**
   * Helper, getting the event instance date in correct format.
   */
  private function getDate(EventInstance $event_instance): ?EventsGET200ResponseInnerDateTime {
    $field = $this->eventHelper->getField($event_instance, 'date');

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
  private function getTicketCategories(EventInstance $event_instance): array {

    $categories = [];

    $field = $this->eventHelper->getField($event_instance, 'field_ticket_categories', 'event_ticket_categories');

    if (!($field instanceof FieldItemListInterface)) {
      return $categories;
    }

    $paragraphs = $field->referencedEntities();
    foreach ($paragraphs as $paragraph) {
      if (!($paragraph instanceof ParagraphInterface)) {
        continue;
      }

      $title = $this->getValue($paragraph, 'field_ticket_category_name');
      $price_value = $this->getValue($paragraph, 'field_ticket_category_price') ?? 0;

      if (empty($title)) {
        continue;
      }

      $price = new EventsGET200ResponseInnerTicketCategoriesInnerPrice([
        'value' => $price_value,
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
   * @see eventHelper->getAddressField()
   */
  private function getAddress(EventInstance $event_instance): ?EventsGET200ResponseInnerAddress {
    $field = $this->eventHelper->getAddressField($event_instance);

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    $value = $field->getValue();

    $zip = $value[0]['postal_code'] ?? NULL;
    $address_1 = $value[0]['address_line1'] ?? NULL;
    $address_2 = $value[0]['address_line2'] ?? NULL;

    return new EventsGET200ResponseInnerAddress([
      'location' => $this->getValue($event_instance, 'field_event_place', 'event_place'),
      'street' => "$address_1 $address_2",
      'zip_code' => !empty($zip) ? intval($zip) : NULL,
      'city' => $value[0]['locality'] ?? NULL,
      'country' => $value[0]['country_code'] ?? NULL,
    ]);
  }

  /**
   * Interpret a date field as a datetime object.
   */
  private function getDateField(FieldableEntityInterface $entity, string $field_name): ?DateTime {
    $timestamp = $this->getValue($entity, $field_name);

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
  private function getValue(FieldableEntityInterface $entity, string $field_name, ?string $fallback_field_name = NULL): ?string {

    $field = $this->eventHelper->getField($entity, $field_name, $fallback_field_name);

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    return $field->getString();
  }

  /**
   * Get the event image, loading the file and generating the original URL.
   */
  private function getImage(EventInstance $event_instance): ?EventsGET200ResponseInnerImage {
    $media_field = $this->eventHelper->getField($event_instance, 'field_event_image', 'event_image');

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
