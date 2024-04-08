<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;

// Descriptions quickly become long and Doctrine annotations have no good way
// of handling multiline strings.
// phpcs:disable Drupal.Files.LineLength.TooLong
/**
 * REST resource for listing events.
 *
 * @RestResource (
 *   id = "events",
 *   label = @Translation("Retrieve all events"),
 *   uri_paths = {
 *     "canonical" = "/api/v1/events",
 *   },
 *
 *   responses = {
 *     200 = {
 *       "description" = "List of all publicly available events.",
 *       "schema" = {
 *         "type" = "array",
 *         "items" = {
 *           "type" = "object",
 *           "properties" = {
 *             "uuid" = {
 *               "type" = "string",
 *               "format" = "uuid",
 *               "description" = "A unique identifer for the event.",
 *             },
 *             "title" = {
 *               "type" = "string",
 *               "description" = "The event title.",
 *             },
 *             "url" = {
 *               "type" = "string",
 *               "format" = "uri",
 *               "description" = "An absolute url end users should use to view the event at the website.",
 *             },
 *             "created_at" = {
 *               "type" = "string",
 *               "format" = "date-time",
 *               "description" = "When the event was created. In ISO 8601 format.",
 *             },
 *             "updated_at" = {
 *               "type" = "string",
 *               "format" = "date-time",
 *               "description" = "When the event was last updated. In ISO 8601 format.",
 *             },
 *             "image" = {
 *               "type" = "object",
 *               "description" = "The main image for the event.",
 *               "properties" = {
 *                 "url" = {
 *                   "type" = "string",
 *                   "format" = "uri",
 *                   "description" = "An absolute url for the image.",
 *                 },
 *               },
 *               "required" = {
 *                 "url",
 *               }
 *             },
 *             "state" = {
 *               "type" = "string",
 *               "description" = "The state of the event.",
 *               "enum" = {
 *                 "TicketSaleNotOpen",
 *                 "Active",
 *                 "SoldOut",
 *                 "Cancelled",
 *                 "Occurred",
 *               },
 *             },
 *             "date_time" = {
 *               "type" = "object",
 *               "description" = "When the event occurs.",
 *               "required" = TRUE,
 *               "properties" = {
 *                 "start" = {
 *                   "type" = "string",
 *                   "format" = "date-time",
 *                   "description" = "Start time in ISO 8601 format.",
 *                 },
 *                 "end" = {
 *                   "type" = "string",
 *                   "format" = "date-time",
 *                   "description" = "End time in ISO 8601 format.",
 *                 },
 *               },
 *               "required" = {
 *                 "start",
 *                 "end",
 *               }
 *             },
 *             "address" = {
 *               "type" = "object",
 *               "description" = "Where the event occurs.",
 *               "properties" = {
 *                 "location" = {
 *                   "type" = "string",
 *                   "description" = "Name of the location where the event occurs. This could be the name of a library branch.",
 *                 },
 *                 "street" = {
 *                   "type" = "string",
 *                   "description" = "Street name and number.",
 *                 },
 *                 "zip_code" = {
 *                   "type" = "integer",
 *                   "description" = "Zip code.",
 *                 },
 *                 "city" = {
 *                   "type" = "string",
 *                   "description" = "City.",
 *                 },
 *                 "country" = {
 *                   "type" = "string",
 *                   "description" = "Country code in ISO 3166-1 alpha-2 format. E.g. DK for Denmark.",
 *                 },
 *               },
 *               "required" = {
 *                 "street",
 *                 "zip_code",
 *                 "city",
 *                 "country",
 *               }
 *             },
 *             "ticket_categories" = {
 *               "type" = "array",
 *               "description" = "Ticket categories used for the event. Not present for events without ticketing.",
 *               "items" = {
 *                 "type" = "object",
 *                 "properties" = {
 *                   "title" = {
 *                     "type" = "string",
 *                     "description" = "The name of the ticket category.",
 *                   },
 *                   "count" = {
 *                     "type" = "object",
 *                     "description" = "Number of tickets for the event.",
 *                     "properties" = {
 *                       "total" = {
 *                         "type" = "number",
 *                         "description" = "Total number of tickets for the event.",
 *                       },
 *                     },
 *                   },
 *                   "price" = {
 *                     "type" = "object",
 *                     "description" = "The price of a ticket in the category",
 *                     "properties" = {
 *                       "currency" = {
 *                         "type" = "string",
 *                         "description" = "The currency of the price in ISO 4217 format. E.g. DKK for Danish krone.",
 *                       },
 *                       "value" = {
 *                         "type" = "number",
 *                         "description" = "The price of a ticket in the minor unit of the currency. E.g. 750 for 7,50 EUR. Use 0 for free tickets.",
 *                       },
 *                     },
 *                     "required" = {
 *                       "currency",
 *                       "value",
 *                     }
 *                   },
 *                 },
 *                 "required" = {
 *                   "title",
 *                   "price",
 *                 }
 *               },
 *             },
 *             "series" = {
 *               "type" = "object",
 *               "description" = "An event may be part of a series. One example of this is recurring events.",
 *               "properties" = {
 *                 "uuid" = {
 *                   "type" = "string",
 *                   "format" = "uuid",
 *                   "description" = "The unique identifier for the series. All events belonging to the same series will have the same value.",
 *                 },
 *               },
 *               "required" = {
 *                 "uuid",
 *               }
 *             },
 *             "description" = {
 *               "type" = "string",
 *               "description" = "An editorial description of the event.",
 *             },
 *             "external_data" = {
 *               "type" = "object",
 *               "description" = "Data for the event provided by a third party.",
 *               "properties" = {
 *                 "url" = {
 *                   "type" = "string",
 *                   "format" = "uri",
 *                   "description" = "An absolute url provided by the third party where end users can access the event.",
 *                 },
 *                 "admin_url" = {
 *                   "type" = "string",
 *                   "format" = "uri",
 *                   "description" = "An absolute url provided by the third party where editorial users can administer the event. Accessing this url should require authentication.",
 *                 },
 *               },
 *             },
 *           },
 *           "required" = {
 *             "uuid",
 *             "title",
 *             "created_at",
 *             "updated_at",
 *             "url",
 *             "state",
 *             "date_time",
 *           }
 *         },
 *       },
 *     },
 *     500 = {
 *       "description" = "Internal server error",
 *     },
 *   }
 * )
 */
final class EventsResource extends ResourceBase {
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
   * Responds to GET requests.
   */
  public function get(): ResourceResponse {
    // @todo Implement me
    return new ResourceResponse([]);
  }

}
