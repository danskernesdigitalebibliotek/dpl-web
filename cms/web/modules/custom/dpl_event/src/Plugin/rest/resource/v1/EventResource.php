<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventPATCHRequest;
use DanskernesDigitaleBibliotek\CMS\Api\Model\EventPATCHRequestExternalData;
use Drupal\Component\Utility\NestedArray;
use Drupal\recurring_events\Entity\EventInstance;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * REST resource for working with single events.
 *
 * @RestResource (
 *   id = "event",
 *   label = @Translation("Update single events"),
 *   uri_paths = {
 *     "canonical" = "/api/v1/events/{uuid}",
 *   }
 * )
 */
final class EventResource extends EventResourceBase {

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'route_parameters' => [
          'GET' => [
            'uuid' => [
              'name' => 'uuid',
              'description' => 'The unique identifier of the event to update. Use the same value as provided for the event in the event list.',
              'type' => 'string',
              'in' => 'query',
              'required' => TRUE,
            ],
          ],
        ],
        'payload' => [
          'name' => 'event',
          'description' => 'Data to update the event with.',
          'in' => 'body',
          'required' => TRUE,
          'schema' => [
            'type' => 'object',
            'properties' => [
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
              'external_data' => [
                'type' => 'object',
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
            ],
          ],
        ],
        'responses' => [
          200 => [
            'description' => 'OK',
          ],
          400 => [
            'description' => 'Invalid input format',
          ],
          403 => [
            'description' => 'Access denied',
          ],
          404 => [
            'description' => 'Event not found',
          ],
          500 => [
            'description' => 'Internal server error',
          ],
        ],
      ]);
  }

  /**
   * PATCH requests - Load the relevant eventinstance, and update values.
   */
  public function patch(string $uuid, Request $request): Response {
    $request_data = $this->deserialize(EventPATCHRequest::class, $request);

    $storage = $this->entityTypeManager->getStorage('eventinstance');

    $event_instances = $storage->loadByProperties([
      'uuid' => $uuid,
    ]);

    $event_instance = reset($event_instances);

    if (!($event_instance instanceof EventInstance)) {
      throw new NotFoundHttpException("Event not found");
    }

    $state = $request_data->getState();
    $external_data = $request_data->getExternalData();

    // Only override external data, if external data is set.
    if ($external_data instanceof EventPATCHRequestExternalData) {
      $event_instance->set('field_event_link', $external_data->getUrl());
      $event_instance->set('field_external_admin_link', $external_data->getAdminUrl());
    }

    $event_instance->set('field_event_state', $state);
    $event_instance->save();

    $event_response = $this->mapper->getResponse($event_instance);

    $serialized_event = $this->serializer->serialize($event_response, $this->serializerFormat($request));

    return new Response($serialized_event);
  }

}
