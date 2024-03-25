<?php

declare(strict_types = 1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource;

use Drupal\Component\Utility\NestedArray;
use Drupal\rest\ResourceResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Retrieve opening hours.
 *
 * @RestResource (
 *   id = "dpl_opening_hours_list",
 *   label = @Translation("List all opening hours"),
 *   uri_paths = {
 *     "canonical" = "/dpl_opening_hours",
 *   },
 * )
 */
final class OpeningHoursResource extends OpeningHoursResourceBase {

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'route_parameters' => [
          Request::METHOD_GET => [
            'branch_id' => [
              'name' => 'branch_id',
              'type' => 'integer',
              'description' => 'The id of the branch for which to retrieve opening hours.',
              'in' => 'query',
              'required' => FALSE,
            ],
            'from_date' => [
              'name' => 'from_date',
              'type' => 'string',
              'format' => 'date',
              'description' => 'Retrieve opening hours which occur after and including the provided date. In ISO 8601 format.',
              'in' => 'query',
              'required' => FALSE,
            ],
            'to_date' => [
              'name' => 'to_date',
              'type' => 'string',
              'format' => 'date',
              'description' => 'Retrieve opening hours which occur before and including the provided date. In ISO 8601 format.',
              'in' => 'query',
              'required' => FALSE,
            ],
          ],
        ],
      ],
      [
        'responses' => [
          Response::HTTP_OK => [
            'description' => Response::$statusTexts[Response::HTTP_OK],
            'schema' => [
              "type" => "array",
              "items" => $this->openingHoursInstanceSchema(),
            ],
          ],
          Response::HTTP_INTERNAL_SERVER_ERROR => [
            'description' => Response::$statusTexts[Response::HTTP_INTERNAL_SERVER_ERROR],
          ],
        ],
      ]
    );
  }

  /**
   * Responds to GET requests.
   */
  public function get(): ResourceResponse {
    return new ResourceResponse([]);
  }

}
