<?php

namespace Drupal\dpl_event\Services;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventPATCHRequestExternalData;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInner;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerAddress;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerDateTime;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerImage;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInnerOriginalImage;
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
 * Translate EventInstances into REST responses.
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
   * Get the RestResource definition of response.
   */
  public function getRestDataDefinition(): mixed {
    return [
      'type' => 'object',
      // Explicitly name the type to match the previously auto-generated name,
      // so the classes generated with `task dev:codegen:dpl-cms` are still
      // named the same. As we're the only consumer of the classes, one might
      // consider refactoring to more natural naming.
      'title' => 'EventsGET200ResponseInner',
      'properties' => [
        'uuid' => [
          'type' => 'string',
          'format' => 'uuid',
          'description' => 'A unique identifier for the event.',
        ],
        'title' => [
          'type' => 'string',
          'description' => 'The event title.',
        ],
        'description' => [
          'type' => 'string',
          'description' => 'The short event description.',
        ],
        'url' => [
          'type' => 'string',
          'format' => 'uri',
          'description' => 'An absolute URL end users should use to view the event at the website.',
        ],
        'created_at' => [
          'type' => 'string',
          'format' => 'date-time',
          'description' => 'When the event was created. In ISO 8601 format.',
        ],
        'updated_at' => [
          'type' => 'string',
          'format' => 'date-time',
          'description' => 'When the event was last updated. In ISO 8601 format.',
        ],
        'ticket_manager_relevance' => [
          'type' => 'boolean',
          'description' => 'Whether the event is marked as relevant for ticket management systems',
        ],
        'image' => [
          'type' => 'object',
          'description' => 'The main image for the event. (Scaled)',
          'properties' => [
            'url' => [
              'type' => 'string',
              'format' => 'uri',
              'description' => 'An absolute URL for the image. This is a link to a scaled version of the original image - the width will always be 1920px, but height/aspect ratio will vary.',
            ],
          ],
          'required' => ['url'],
        ],
        'originalImage' => [
          'type' => 'object',
          'description' => 'The main image for the event. (Original source)',
          'properties' => [
            'url' => [
              'type' => 'string',
              'format' => 'uri',
              'description' => 'An absolute URL for the image. This is a link to the original, unaltered file, so the size, aspect ratio, and file format will be different from event to event.',
            ],
          ],
          'required' => ['url'],
        ],
        'teaserImage' => [
          'type' => 'object',
          'description' => 'The uniform teaser image for the event.',
          'properties' => [
            'url' => [
              'type' => 'string',
              'format' => 'uri',
              'description' => 'An absolute URL for the image. Unlike the main image, this is scaled and cropped to be identical in all instances - matching the teaser images of the website lists.',
            ],
          ],
          'required' => ['url'],
        ],
        'state' => [
          'type' => 'string',
          'description' => 'The state of the event.',
          'enum' => [
            'TicketSaleNotOpen',
            'Active',
            'SoldOut',
            'Cancelled',
            'Occurred',
          ],
        ],
        'all_day' => [
          'type' => 'boolean',
          'description' => 'Whether the event is marked as an all-day event, without time relevance.',
        ],
        'date_time' => [
          'type' => 'object',
          'description' => 'When the event occurs.',
          'properties' => [
            'start' => [
              'type' => 'string',
              'format' => 'date-time',
              'description' => 'Start time in ISO 8601 format.',
            ],
            'end' => [
              'type' => 'string',
              'format' => 'date-time',
              'description' => 'End time in ISO 8601 format.',
            ],
          ],
          'required' => ['start', 'end'],
        ],
        'branches' => [
          'type' => 'array',
          'description' => 'The associated library branches.',
          'items' => [
            'type' => 'string',
            'description' => 'The name of a branch.',
          ],
        ],
        'branch_isil_ids' => [
          'type' => 'array',
          'description' => 'External branch ids (ISIL) for the associated library branches. Aligned by index with the branches property, and always the same length. An entry is an empty string when no ISIL has been configured for that branch in the CMS.',
          'items' => [
            'type' => 'string',
            'description' => 'External branch id (ISIL)',
            'example' => 'DK-710100',
          ],
        ],
        'address' => [
          'type' => 'object',
          'description' => 'Where the event occurs.',
          'properties' => [
            'locationType' => [
              'type' => 'string',
              'description' => 'If an event is physical or not.',
              'enum' => [
                'physical',
                'online',
              ],
            ],
            'location' => [
              'type' => 'string',
              'description' => 'Name of the location where the event occurs. This could be the name of a library branch.',
            ],
            'locationAdditional' => [
              'type' => 'string',
              'description' => 'Expanded description of location.',
            ],
            'street' => [
              'type' => 'string',
              'description' => 'Street name and number.',
            ],
            'zip_code' => [
              'type' => 'integer',
              'description' => 'Zip code.',
            ],
            'city' => [
              'type' => 'string',
              'description' => 'City.',
            ],
            'country' => [
              'type' => 'string',
              'description' => 'Country code in ISO 3166-1 alpha-2 format. E.g. DK for Denmark.',
            ],
          ],
          'required' => ['street', 'zip_code', 'city', 'country'],
        ],
        'categories' => [
          'type' => 'array',
          'description' => 'The categories associated with the event.',
          'items' => [
            'type' => 'string',
            'description' => 'The name of a category.',
          ],
        ],
        'audiences' => [
          'type' => 'array',
          'description' => 'The audiences associated with the event.',
          'items' => [
            'type' => 'string',
            'description' => 'The name of an audience.',
          ],
        ],
        'tags' => [
          'type' => 'array',
          'description' => 'The tags associated with the event.',
          'items' => [
            'type' => 'string',
            'description' => 'The name of a tag.',
          ],
        ],
        'partners' => [
          'type' => 'array',
          'description' => 'The partners associated with the event.',
          'items' => [
            'type' => 'string',
            'description' => 'The name of a partner.',
          ],
        ],
        'ticket_categories' => [
          'type' => 'array',
          'description' => 'Ticket categories used for the event. Not present for events without ticketing.',
          'items' => [
            'type' => 'object',
            'properties' => [
              'uuid' => [
                'type' => 'string',
                'format' => 'uuid',
                'description' => 'A unique identifier for the ticket category.',
              ],
              'title' => [
                'type' => 'string',
                'description' => 'The name of the ticket category.',
              ],
              'price' => [
                'type' => 'object',
                'description' => 'The price of a ticket in the category',
                'properties' => [
                  'currency' => [
                    'type' => 'string',
                    'description' => 'The currency of the price in ISO 4217 format. E.g. DKK for Danish krone.',
                  ],
                  'value' => [
                    'type' => 'number',
                    'description' => 'The price of a ticket in the minor unit of the currency. E.g. 750 for 7,50 EUR. Use 0 for free tickets.',
                  ],
                ],
                'required' => ['currency', 'value'],
              ],
            ],
            'required' => ['title', 'price'],
          ],
        ],
        'ticket_capacity' => [
          'type' => 'integer',
          'description' => 'Total number of tickets which can be sold for the event.',
        ],
        'series' => [
          'type' => 'object',
          'description' => 'An event may be part of a series. One example of this is recurring events.',
          'properties' => [
            'uuid' => [
              'type' => 'string',
              'format' => 'uuid',
              'description' => 'The unique identifier for the series. All events belonging to the same series will have the same value.',
            ],
          ],
          'required' => ['uuid'],
        ],
        'body' => [
          'type' => 'string',
          'description' => 'An editorial WYSIWYG/HTML description of the event.',
        ],
        'external_data' => [
          'type' => 'object',
          'title' => 'EventPATCHRequestExternalData',
          'description' => 'Data for the event provided by a third party.',
          'properties' => [
            'url' => [
              'type' => 'string',
              'format' => 'uri',
              'description' => 'An absolute URL provided by the third party where end users can access the event.',
            ],
            'admin_url' => [
              'type' => 'string',
              'format' => 'uri',
              'description' => 'An absolute URL provided by the third party where editorial users can administer the event. Accessing this URL should require authentication.',
            ],
          ],
        ],
        'screen_names' => [
          'type' => 'array',
          'description' => 'The screens this event should be shown on.',
          'items' => [
            'type' => 'string',
            'description' => 'A screen name.',
          ],
        ],
      ],
      'required' => ['uuid', 'title', 'created_at', 'updated_at', 'url', 'state', 'date_time'],
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function getResponse(EventInstance $event_instance): EventsGET200ResponseInner {
    $this->event = $event_instance;

    $branch_data = $this->getBranchData();

    $response = new EventsGET200ResponseInner([
      'title' => $this->getValue('title'),
      'uuid' => $this->event->uuid(),
      'url' => $this->event->toUrl()->setAbsolute(TRUE)->toString(TRUE)->getGeneratedUrl(),
      'ticketManagerRelevance' => !empty($this->getSeriesValue('field_relevant_ticket_manager')),
      'description' => $this->getValue('event_description'),
      'body' => $this->event->getDescription(),
      'state' => $this->event->getState()?->value,
      'image' => $this->getImage(),
      'originalImage' => $this->getOriginalImage(),
      'teaserImage' => $this->getTeaserImage(),
      'branches' => $branch_data['names'],
      'branchIsilIds' => $branch_data['isil_ids'],
      'address' => $this->getAddress(),
      'audiences' => $this->getAudiences(),
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
   * Getting associated branches, as labels and as ISIL ids.
   *
   * Both lists are built in the same pass and skipped on the same condition, so
   * they are always the same length and can be read by index against each
   * other.
   *
   * A branch without an ISIL gets an empty string rather than NULL: the REST
   * responses are serialized by JMS, which omits NULL values, and a NULL would
   * silently drop out of the array and break the alignment with the labels.
   *
   * @return array{names: string[], isil_ids: string[]}
   *   The translated branch labels, and the ISIL id of each.
   */
  private function getBranchData(): array {
    $names = [];
    $isil_ids = [];

    $branches = $this->event->getBranches() ?? [];

    foreach ($branches as $branch) {
      $label = $branch->getTitle();

      if (empty($label)) {
        continue;
      }

      $names[] = $label;

      $isil_id = '';
      if ($branch->hasField('field_agency_branch_id') && !$branch->get('field_agency_branch_id')->isEmpty()) {
        $isil_id = (string) $branch->get('field_agency_branch_id')->value;
      }
      $isil_ids[] = $isil_id;
    }

    return ['names' => $names, 'isil_ids' => $isil_ids];
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
   * Getting associated audiences.
   *
   * @return string[]
   *   The translated audience labels.
   */
  private function getAudiences(): array {
    return $this->getTaxonomyNames('event_audiences');
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
    $address->setLocationType($this->getValue('event_location_type'));
    $address->setLocationAdditional($this->getValue('event_location'));

    // Loading the field, and rendering it, to let the BranchAddressFormatter
    // do the work of looking up a possible branch.
    $rendered = $this->event->get('event_address')->view('full');
    $street = NULL;

    if (isset($rendered['#field_type']) && $rendered['#field_type'] === 'address_gsearch') {
      $zip = $rendered[0]['#content']['postal_code'] ?? NULL;
      $city = $rendered[0]['#content']['postal_name'] ?? NULL;
      $street = $rendered[0]['#content']['address'] ?? NULL;
      $country = $rendered[0]['#content']['country'] ?? 'DK';
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

    $value = $field->getString();

    if (trim($value) == '') {
      return NULL;
    }

    return $value;
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

    return $series->get($field_name)->getString();
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
   * Getting the main image (scaled).
   */
  private function getImage(): ?EventsGET200ResponseInnerImage {
    $url = $this->getImageUrl('event_image', 'event_api_scaled');

    if (empty($url)) {
      return NULL;
    }

    return new EventsGET200ResponseInnerImage(['url' => $url]);
  }

  /**
   * Getting the main image (original).
   */
  private function getOriginalImage(): ?EventsGET200ResponseInnerOriginalImage {
    $url = $this->getImageUrl('event_image');

    if (empty($url)) {
      return NULL;
    }

    return new EventsGET200ResponseInnerOriginalImage(['url' => $url]);
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
