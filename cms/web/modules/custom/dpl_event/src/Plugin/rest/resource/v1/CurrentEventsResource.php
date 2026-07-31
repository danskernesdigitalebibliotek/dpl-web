<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Service\SerializerInterface;
use Drupal\Component\Datetime\TimeInterface;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\dpl_event\Services\EventRestMapper;
use Drupal\rest\Attribute\RestResource;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * REST resource for listing current events.
 */
#[RestResource(
  id: "current_events",
  label: new TranslatableMarkup("Retrieve current events"),
  uri_paths: [
    "canonical" => "/api/v1/events/current",
  ],
  )]
final class CurrentEventsResource extends EventResourceBase {

  /**
   * Constructor.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    SerializerInterface $serializer,
    EventRestMapper $mapper,
    EntityTypeManagerInterface $entityTypeManager,
    protected TimeInterface $dateTime,
  ) {
    parent::__construct(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $serializer_formats,
      $logger,
      $serializer,
      $mapper,
      $entityTypeManager,
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      // @phpstan-ignore argument.type (we know it's an array)
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest'),
      $container->get('dpl_rest_base.serializer'),
      $container->get('dpl_event.event_rest_mapper'),
      $container->get('entity_type.manager'),
      $container->get('datetime.time'),
    );
  }

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'responses' => [
          200 => [
            'description' => 'List of all current available events.',
            'schema' => [
              'type' => 'array',
              'items' => $this->mapper->getRestDataDefinition(),
            ],
          ],
          500 => [
            'description' => 'Internal server error',
          ],
        ],
      ]);
  }

  /**
   * GET request: Get all current eventinstances.
   */
  public function get(Request $request): Response {

    // Entity query, pulling all eventinstances.
    $storage = $this->entityTypeManager->getStorage('eventinstance');
    $query = $storage->getQuery()
      ->accessCheck(TRUE)
      ->condition('status', TRUE)
      ->sort('date.value');

    $date = new \DatetimeImmutable('@' . $this->dateTime->getRequestTime());
    $formattedDate = $date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);
    $query->condition('date.value', $formattedDate, '<=');
    $query->condition('date.end_value', $formattedDate, '>=');

    $ids = $query->execute();

    $event_responses = [];

    foreach ($ids as $id) {
      $event_instance = $storage->load($id);

      if ($event_instance instanceof EventInstance) {
        $event_responses[] = $this->mapper->getResponse($event_instance);
      }
    }

    $event_responses = $this->serializer->serialize($event_responses, $this->serializerFormat($request));
    $response = new CacheableResponse($event_responses);

    // Create cache metadata.
    $cache_metadata = new CacheableMetadata();
    $cache_metadata->setCacheContexts(['url.query_args:from_date']);
    $cache_metadata->setCacheTags(['eventinstance_list', 'eventseries_list']);

    // Add cache metadata to the response.
    $response->addCacheableDependency($cache_metadata);

    return $response;
  }

}
