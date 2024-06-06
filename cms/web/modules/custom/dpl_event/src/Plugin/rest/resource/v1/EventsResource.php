<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\recurring_events\Entity\EventInstance;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

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
 *             "subtitle" = {
 *                "type" = "string",
 *                "description" = "The event subtitle.",
 *              },
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
 *                   "description" = "An absolute url for the image. This is a link to the original, unaltered file, so the size, aspect ratio, and file format will be different from event to event.",
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
 *             "branches" = {
 *               "type" = "array",
 *               "description" = "The associated library branches.",
 *                "items" = {
 *                   "type" = "string",
 *                   "description" = "The translated label of a branch.",
 *                 },
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
 *             "tags" = {
 *                "type" = "array",
 *                "description" = "The tags associated with the event.",
 *                "items" = {
 *                  "type" = "string",
 *                  "description" = "The translated label of a tag.",
 *                },
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
 *             "ticket_capacity" = {
 *                "type" = "integer",
 *                "description" = "Total number of tickets which can be sold for the event.",
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
 *               "description" = "An editorial WYSIWYG/HTML description of the event.",
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
final class EventsResource extends EventResourceBase {
// phpcs:enable Drupal.Files.LineLength.TooLong

  /**
   * GET request: Get all eventinstances, hopefully cached.
   */
  public function get(Request $request): Response {
    // Entity query, pulling all eventinstances.
    $storage = $this->entityTypeManager->getStorage('eventinstance');
    $ids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('status', TRUE)
      ->execute();

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
    $cache_metadata->setCacheTags(['eventinstance_list', 'eventseries_list']);

    // Add cache metadata to the response.
    $response->addCacheableDependency($cache_metadata);

    return $response;
  }

}
