<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\drupal_typed\RequestTyped;
use Drupal\rest\Attribute\RestResource;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * REST resource for listing events.
 */
#[RestResource(
  id: "events",
  label: new TranslatableMarkup("Retrieve all events"),
  uri_paths: [
    "canonical" => "/api/v1/events",
  ],
)]
final class EventsResource extends EventResourceBase {

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'route_parameters' => [
          Request::METHOD_GET => [
            'from_date' => [
              'name' => 'from_date',
              'type' => 'string',
              'format' => 'date',
              'description' => 'Retrieve events which occur after and including the provided date. In ISO 8601 format.',
              'in' => 'query',
              'required' => FALSE,
            ],
          ],
        ],
        'responses' => [
          200 => [
            'description' => 'List of all publicly available events.',
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
   * GET request: Get all eventinstances, hopefully cached.
   */
  public function get(Request $request): Response {

    // Entity query, pulling all eventinstances.
    $storage = $this->entityTypeManager->getStorage('eventinstance');
    $query = $storage->getQuery()
      ->accessCheck(TRUE)
      ->condition('status', TRUE)
      ->sort('date.value');

    // Getting a possible from_date URL parameter, and use it in the look-up,
    // to only find events that start from and after this date.
    $typed_request = new RequestTyped($request);

    try {
      $from_date = $typed_request->getDateTime('from_date');

      if ($from_date) {
        $formatted_from_date = $from_date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);
        $query->condition('date.value', $formatted_from_date, '>=');
      }
    }
    catch (\TypeError $e) {
      throw new BadRequestHttpException("Invalid input: {$e->getMessage()}",);
    }

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
