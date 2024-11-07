<?php

declare(strict_types=1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner as OpeningHoursResponse;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\dpl_opening_hours\Model\OpeningHoursInstance;
use Drupal\drupal_typed\RequestTyped;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Retrieve opening hours.
 *
 * @RestResource (
 *   id = "dpl_opening_hours_list",
 *   label = @Translation("List all opening hours"),
 *   uri_paths = {
 *     "canonical" = "/api/v1/opening_hours",
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
   * Responds to GET requests.
   */
  public function get(Request $request): Response {
    $typedRequest = new RequestTyped($request);

    try {
      $openingHoursInstances = $this->repository->loadMultiple(
        $typedRequest->getInt('branch_id') ? [$typedRequest->getInt('branch_id')] : [],
        $typedRequest->getDateTime('from_date'),
        $typedRequest->getDateTime('to_date')
      );

      $responseData = array_map(function (OpeningHoursInstance $instance) : OpeningHoursResponse {
        return $this->mapper->toResponse($instance);
      }, $openingHoursInstances);

      return (new CacheableResponse($this->serializer->serialize($responseData, $this->serializerFormat($request))))
        ->addCacheableDependency($this->cachableMetadata());
    }
    catch (\TypeError $e) {
      throw new BadRequestHttpException("Invalid input: {$e->getMessage()}",);
    }
  }

}
