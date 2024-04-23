<?php

declare(strict_types = 1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequest as OpeningHoursRequest;
use Drupal\Component\Utility\NestedArray;
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
 *     "create" = "/dpl_opening_hours",
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
            'schema' => $this->openingHoursInstanceSchema(require_id: TRUE),
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
      $this->repository->upsert($instance);

      $responseData = $this->mapper->toResponse($instance);
      return new Response($this->serializer->serialize($responseData, $this->serializerFormat($request)));
    }
    catch (\InvalidArgumentException $e) {
      throw new BadRequestHttpException("Invalid input: {$e->getMessage()}");
    }
  }

}
