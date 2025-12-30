<?php

namespace Drupal\dpl_event\Services;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventPATCHRequestExternalData;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerAddress;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerDateTime;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerImage;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerSeries;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTeaserImage;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerTicketCategoriesInnerPrice;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\dpl_event\Form\SettingsForm;
use Drupal\file\FileInterface;
use Drupal\image\Entity\ImageStyle;
use Drupal\media\MediaInterface;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\recurring_events\Entity\EventSeries;
use Safe\DateTime;

/**
 * Translator understand the link between EventInstances and resource objects.
 */
class EventRestMapper {

  /**
   * The eventinstance.
   */
  private EventInstance $event;

  /**
   * Constructor.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileUrlGeneratorInterface $fileUrlGenerator,
    protected ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * {@inheritDoc}
   */
  public function getResponse(EventInstance $event_instance): EventsGET200ResponseInner {
    $this->event = $event_instance;

    $response = new EventsGET200ResponseInner([
      'title' => $this->getValue('title'),
      'uuid' => $this->event->uuid(),
      'url' => $this->event->toUrl()->setAbsolute(TRUE)->toString(TRUE)->getGeneratedUrl(),
      'ticketManagerRelevance' => !empty($this->getSeriesValue('field_relevant_ticket_manager')),
      'description' => $this->getValue('event_description'),
      'body' => $this->event->getDescription(),
      'state' => $this->event->getState()?->value,
      'image' => $this->getImage(),
      'teaserImage' => $this->getTeaserImage(),
      'branches' => $this->getBranches(),
      'address' => $this->getAddress(),
      'tags' => $this->getTags(),
      'categories' => $this->getCategories(),
      'partners' => $this->getMultiValue('event_partners'),
      'ticketCapacity' => $this->getValue('event_ticket_capacity'),
      'ticketCategories' => $this->getTicketCategories(),
      'createdAt' => $this->getDateField('created'),
      'updatedAt' => $this->event->getUpdatedDate(),
      'allDay' => !empty($this->getValue('event_all_day')),
      'dateTime' => $this->getDate(),
      'externalData' => $this->getExternalData(),
      'screenNames' => $this->event->getScreenNames(),
    ]);

    $series = $this->event->getEventSeries();

    if ($series instanceof EventSeries) {
      $response->setSeries(new EventsGET200ResponseInnerSeries([
        'uuid' => $series->uuid(),
      ]));
    }

    return $response;
  }

  /**
   * Getting associated branches.
   *
   * @return string[]
   *   The translated branch labels.
   */
  private function getBranches(): array {
    $names = [];

    $branches = $this->event->getBranches() ?? [];

    foreach ($branches as $branch) {
      $label = $branch->getTitle();

      if (!empty($label)) {
        $names[] = $label;
      }
    }

    return $names;
  }

  /**
   * Getting associated term names.
   *
   * @param string $field_key
   *   The field inheritance key.
   *
   * @return string[]
   *   The translated term labels.
   */
  private function getTaxonomyNames(string $field_key): array {
    $names = [];

    /** @var \Drupal\taxonomy\TermInterface[] $terms */
    $terms = $this->event->get($field_key)->referencedEntities();

    foreach ($terms as $term) {
      $names[] = $term->getName();
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
    return $this->getTaxonomyNames('event_tags');
  }

  /**
   * Getting associated categories.
   *
   * @return string[]
   *   The translated tag labels.
   */
  private function getCategories(): array {
    return $this->getTaxonomyNames('event_categories');
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
    $field = $this->event->getField('date');

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

    $field = $this->event->getField('event_ticket_categories');

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

      $config = $this->configFactory->get(SettingsForm::CONFIG_NAME);

      $price = new EventsGET200ResponseInnerTicketCategoriesInnerPrice([
        'value' => intval($price_value),
        'currency' => $config->get('price_currency') ?? 'DKK',
      ]);

      $categories[] = new EventsGET200ResponseInnerTicketCategoriesInner([
        'uuid' => $paragraph->uuid(),
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
   * @see BranchAddressFormatter
   */
  private function getAddress(): EventsGET200ResponseInnerAddress {
    $address = new EventsGET200ResponseInnerAddress();
    $address->setLocation($this->getValue('event_place'));
    $address->setLocationAdditional($this->getValue('event_location'));

    // Loading the field, and rendering it, to let the BranchAddressFormatter
    // do the work of looking up a possible branch.
    $rendered = $this->event->get('event_address')->view('full');
    $street = NULL;

    if ($rendered['#field_type'] === 'address_dawa') {
      $zip = $rendered[0]['postal_code'] ?? NULL;
      $city = $rendered[0]['city'] ?? NULL;
      $street = $rendered[0]['address'] ?? NULL;
      $country = $rendered[0]['country'] ?? NULL;
    }
    else {
      $country = $rendered[0]['country_code']['#value'] ?? NULL;
      $city = $rendered[0]['locality']['#value'] ?? NULL;
      $zip = $rendered[0]['postal_code']['#value'] ?? NULL;
      $address_1 = $rendered[0]['address_line1']['#value'] ?? NULL;
      $address_2 = $rendered[0]['address_line2']['#value'] ?? NULL;

      if (!empty($address_1) || !empty($address_2)) {
        $street = "$address_1 $address_2";
      }
    }

    $address->setStreet($street);
    $address->setZipCode(!empty($zip) ? intval($zip) : NULL);
    $address->setCity($city);
    $address->setCountry($country);

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
   * Get multiple string values as an array output.
   *
   * @return string[]
   *   An array of string values.
   */
  private function getMultiValue(string $field_name): array {
    $field = $this->event->getField($field_name);

    if (!($field instanceof FieldItemListInterface)) {
      return [];
    }

    $values = $field->getValue();

    // Turning the value keys into a simple, one-level array of strings.
    return array_column($values, 'value');
  }

  /**
   * Get string value of a possible field (or fallback field).
   */
  private function getValue(string $field_name): ?string {

    $field = $this->event->getField($field_name);

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    return $field->getString();
  }

  /**
   * Load value directly from associated event series.
   *
   * Usually, this is not necessary, as we use field inheritance, but some
   * fields only exist on the series, and will never be overriden on instance
   * level.
   */
  private function getSeriesValue(string $field_name): ?string {
    $series = $this->event->getEventSeries();

    if (!($series instanceof EventSeries) || !$series->hasField($field_name)) {
      return NULL;
    }

    $field = $series->get($field_name);

    if (!($field instanceof FieldItemListInterface)) {
      return NULL;
    }

    return $field->getString();
  }

  /**
   * Getting the scaled/cropped teaser image.
   */
  private function getTeaserImage(): ?EventsGET200ResponseInnerTeaserImage {
    $url = $this->getImageUrl('event_teaser_image', 'list_teaser_4_3');

    if (empty($url)) {
      return NULL;
    }

    return new EventsGET200ResponseInnerTeaserImage(['url' => $url]);
  }

  /**
   * Getting the main, original image.
   */
  private function getImage(): ?EventsGET200ResponseInnerImage {
    $url = $this->getImageUrl('event_image', 'paragraph_wide');

    if (empty($url)) {
      return NULL;
    }

    return new EventsGET200ResponseInnerImage(['url' => $url]);
  }

  /**
   * Getting an image, loading the file and generating the absolute URL.
   *
   * @param string $field_name
   *   The field name we want to get the image from.
   * @param string|null $image_style_name
   *   The image style we want to generate the image from. NULL = original size.
   *
   * @return string|null
   *   The image URL.
   */
  private function getImageUrl(string $field_name, string|null $image_style_name = NULL): ?string {
    if (!($this->event->hasField($field_name))) {
      return NULL;
    }

    $image_style = NULL;

    if ($image_style_name) {
      $image_style_storage = $this->entityTypeManager->getStorage('image_style');
      $image_style = $image_style_storage->load($image_style_name);
    }

    $media_field = $this->event->getField($field_name);

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

    if (empty($file_uri)) {
      return NULL;
    }

    if ($image_style instanceof ImageStyle) {
      return $image_style->buildUrl($file_uri);
    }

    // If no image style is passed along, we'll return the original, full
    // size, non-cropped image URL instead.
    return $this->fileUrlGenerator->generateAbsoluteString($file_uri);

  }

}
