<?php

declare(strict_types = 1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequest as OpeningHoursRequest;
use Drupal\Component\Utility\NestedArray;
use Drupal\dpl_opening_hours\Model\OpeningHoursInstance;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Create individual opening hours.
 *
 * @RestResource (
 *   id = "dpl_opening_hours_create",
 *   label = @Translation("Create individual opening hours"),
 *   uri_paths = {
 *     "create" = "/api/v1/opening_hours",
 *   },
 * )
 */
final class OpeningHoursCreateResource extends OpeningHoursResourceBase {

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'payload' => [
          'name' => 'opening_hours_instance',
          'description' => 'The opening hours instance to manage',
          'in' => 'body',
          'required' => TRUE,
          'schema' => $this->openingHoursInstanceSchema(require_id: FALSE),
        ],
        'responses' => [
          Response::HTTP_OK => [
            'description' => Response::$statusTexts[Response::HTTP_OK],
            'schema' => [
              "type" => "array",
              "items" => $this->openingHoursInstanceSchema(require_id: TRUE),
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
   * Create new opening hours instances.
   */
  public function post(Request $request): Response {
    try {
      $requestData = $this->deserialize(OpeningHoursRequest::class, $request);
      $instance = $this->mapper->fromRequest($requestData);
      $createdInstances = $this->repository->insert($instance);
      $responseData = array_map(function (OpeningHoursInstance $instance) {
        return $this->mapper->toResponse($instance);
      }, $createdInstances);
      return new Response($this->serializer->serialize($responseData, $this->serializerFormat($request)));
    }
    catch (\InvalidArgumentException $e) {
      throw new BadRequestHttpException("Invalid input: {$e->getMessage()}");
    }
  }

}
