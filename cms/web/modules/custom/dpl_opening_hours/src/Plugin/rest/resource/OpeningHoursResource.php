<?php declare(strict_types = 1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource;

use Drupal\Core\KeyValueStore\KeyValueFactoryInterface;
use Drupal\Core\KeyValueStore\KeyValueStoreInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Route;

/**
 * Retrieve opening hours.
 *
 * @RestResource (
 *   id = "dpl_opening_hours_list",
 *   label = @Translation("List all opening hours"),
 *   uri_paths = {
 *     "canonical" = "/dpl_opening_hours",
 *   },
 *
 *   responses = {
 *      200 = {
 *        "description" = "List all opening hours.",
 *        "schema" = {
 *          "type" = "array",
 *          "items" = {
 *            "type" = "object",
 *            "properties" = {
 *              "id" = {
 *                "type" = "integer",
 *                "description" = "An serial unique id of the opening hours instance.",
 *              },
 *              "category" = {
 *                "type" = "object",
 *                "properties" = {
 *                  "title" = {
 *                    "type" = "string",
 *                  },
 *                },
 *                "required" = {
 *                     "title",
 *                },
 *              },
 *              "date" = {
 *                "type" = "string",
 *                "format" = "date",
 *                "description" = "When the event was created. In ISO 8601 format.",
 *              },
 *              "start_time": {
 *                "type" = "string",
 *                "example" = "9:00",
 *                "description" = "When the opening hours start. In format HH:MM",
 *              },
 *              "end_time": {
 *                "type" = "string",
 *                "example" = "17:00",
 *                "description" = "When the opening hours end. In format HH:MM",
 *              },
 *            },
 *            "required" = {
 *              "id",
 *              "category",
 *              "date",
 *              "start_time",
 *              "end_time",
 *            },
 *          },
 *        },
 *      },
 *      500 = {
 *        "description" = "Internal server error",
 *      },
 *    }
 * )
 *
 */
final class OpeningHoursResource extends ResourceBase {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest'),
    );
  }

  /**
   * Responds to GET requests.
   */
  public function get(): ResourceResponse {
    return new ResourceResponse([]);
  }

}
