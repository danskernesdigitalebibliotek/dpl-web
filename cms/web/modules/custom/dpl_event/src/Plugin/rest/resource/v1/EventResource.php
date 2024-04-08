<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

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
final class EventResource extends ResourceBase {
// phpcs:enable Drupal.Files.LineLength.TooLong

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    /** @var mixed[] $serializer_formats */
    $serializer_formats = $container->getParameter('serializer.formats');
    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $serializer_formats,
      $container->get('logger.factory')->get('rest'),
    );
  }

  /**
   * Responds to PATCH requests.
   *
   * @param string $id
   *   The id of the event to update.
   * @param mixed[] $data
   *   The data posted by clients as a part of the request.
   */
  public function patch(string $id, array $data): ModifiedResourceResponse {
    // @todo Implement me
    return new ModifiedResourceResponse($data, 200);
  }

}
