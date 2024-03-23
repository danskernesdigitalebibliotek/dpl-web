<?php

declare(strict_types = 1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource;

use Drupal\Component\Utility\NestedArray;
use Drupal\rest\ResourceResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Manage individual opening hours.
 *
 * @RestResource (
 *   id = "dpl_opening_hours",
 *   label = @Translation("Manage individual opening hours"),
 *   uri_paths = {
 *     "canonical" = "/dpl_opening_hours/{id}",
 *     "create" = "/dpl_opening_hours",
 *   },
 * )
 */
final class OpeningHoursInstanceResource extends OpeningHoursResourceBase {

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'payload' => [
          'name' => 'office_hours_instance',
          'description' => 'The office hours instance to manage',
          'in' => 'body',
          'required' => FALSE,
          'schema' => $this->openingHoursInstanceSchema(require_id: FALSE),
        ],
        'responses' => [
          Response::HTTP_OK => [
            'description' => Response::$statusTexts[Response::HTTP_OK],
            'schema' => $this->openingHoursInstanceSchema(),
          ],
          Response::HTTP_NO_CONTENT => [
            'description' => Response::$statusTexts[Response::HTTP_NO_CONTENT],
          ],
          Response::HTTP_BAD_REQUEST => [
            'description' => Response::$statusTexts[Response::HTTP_BAD_REQUEST],
          ],
          Response::HTTP_INTERNAL_SERVER_ERROR => [
            'description' => Response::$statusTexts[Response::HTTP_INTERNAL_SERVER_ERROR],
          ],
        ],
      ]
    );
  }

  /**
   * Retrieve individual opening hours.
   */
  public function get(string $id): ResourceResponse {
    return new ResourceResponse([]);
  }

  /**
   * Create new opening hours instances.
   */
  public function post(): ResourceResponse {
    return new ResourceResponse([]);
  }

  /**
   * Update an opening hours instance.
   */
  public function patch(string $id): ResourceResponse {
    return new ResourceResponse([]);
  }

  /**
   * Delete an opening hours instance.
   */
  public function delete(string $id): ResourceResponse {
    return new ResourceResponse([]);
  }

}
