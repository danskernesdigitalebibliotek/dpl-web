<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventPATCHRequest;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_event\Services\EventRestMapper;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\rest\ModifiedResourceResponse;
use Symfony\Component\HttpFoundation\Request;

// Descriptions quickly become long and Doctrine annotations have no good way
// of handling multiline strings.
// phpcs:disable Drupal.Files.LineLength.TooLong
/**
 * REST resource for working with single events.
 *
 * @RestResource (
 *   id = "event",
 *   label = @Translation("Update single events"),
 *   uri_paths = {
 *     "canonical" = "/api/v1/events/{uuid}",
 *   },
 *
 *   route_parameters = {
 *     "GET" = {
 *       "uuid" = {
 *         "name" = "uuid",
 *         "description" = "The unique identifier of the event to update. Use the same value as provided for the event in the event list.",
 *         "type" = "string",
 *         "in" = "query",
 *         "required" = TRUE,
 *       },
 *     },
 *   },
 *
 *   payload = {
 *     "name" = "event",
 *     "description" = "Data to update the event with.",
 *     "in" = "body",
 *     "required" = TRUE,
 *     "schema" = {
 *       "type" = "object",
 *       "properties" = {
 *         "state" = {
 *           "type" = "string",
 *           "description" = "The state of the event.",
 *           "enum" = {
 *             "TicketSaleNotOpen",
 *             "Active",
 *             "SoldOut",
 *             "Cancelled",
 *             "Occurred",
 *           },
 *         },
 *         "external_data" = {
 *           "type" = "object",
 *           "description" = "Data for the event provided by a third party.",
 *           "properties" = {
 *             "url" = {
 *               "type" = "string",
 *               "format" = "uri",
 *               "description" = "An absolute url provided by the third party where end users can access the event.",
 *             },
 *             "admin_url" = {
 *               "type" = "string",
 *               "format" = "uri",
 *               "description" = "An absolute url provided by the third party where editorial users can administer the event. Accessing this url should require authentication.",
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 *
 *   responses = {
 *     200 = {
 *       "description" = "OK",
 *     },
 *     400 = {
 *      "description" = "Invalid input format"
 *     },
 *     403 = {
 *      "description" = "Access denied"
 *     },
 *     404 = {
 *       "description" = "Event not found"
 *     },
 *     500 = {
 *       "description" = "Internal server error"
 *     },
 *   }
 * )
 */
final class EventResource extends EventResourceBase {
// phpcs:enable Drupal.Files.LineLength.TooLong

  /**
   * PATCH requests - Load the relevant eventinstance, and update values.
   */
  public function patch(string $uuid, Request $request): ModifiedResourceResponse {
    $request_data = $this->deserialize(EventPATCHRequest::class, $request);

    $entity_type_manager = DrupalTyped::service(EntityTypeManagerInterface::class, 'entity_type.manager');
    $storage = $entity_type_manager->getStorage('eventinstance');

    $event_instances = $storage->loadByProperties([
      'uuid' => $uuid,
    ]);

    $event_instance = reset($event_instances);

    if (!($event_instance instanceof EventInstance)) {
      return new ModifiedResourceResponse('Even not found', 404);
    }

    $state = $request_data->getState();
    $event_instance->set('field_event_state', $state);
    $event_instance->save();

    $mapper = DrupalTyped::service(EventRestMapper::class, 'dpl_event.event_rest_mapper');
    $event_response = $mapper->getResponse($event_instance);

    $serialized_event = $this->serializer->serialize($event_response, $this->serializerFormat($request));

    return new ModifiedResourceResponse($serialized_event);
  }

}
