<?php

declare(strict_types = 1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequest as OpeningHoursRequest;
use Drupal\Component\Utility\NestedArray;
use Drupal\dpl_opening_hours\Model\OpeningHoursInstance;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Update individual opening hours.
 *
 * @RestResource (
 *   id = "dpl_opening_hours_update",
 *   label = @Translation("Update individual opening hours"),
 *   uri_paths = {
 *     "canonical" = "/dpl_opening_hours/{id}",
 *   },
 * )
 */
final class OpeningHoursUpdateResource extends OpeningHoursResourceBase {

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
          'schema' => $this->openingHoursInstanceSchema(require_id: TRUE),
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
   * Update an opening hours instance.
   */
  public function patch(int $id, Request $request): Response {
    try {
      $requestData = $this->deserialize(OpeningHoursRequest::class, $request);
      if ($id !== $requestData->getId()) {
        throw new \InvalidArgumentException("Instance ids provided in path '{$id}' and body '{$requestData->getId()}' do not match ");
      }
      $instance = $this->repository->load($id);
      if (!$instance) {
        throw new NotFoundHttpException("Invalid instance id: '{$id}'");
      }

      $updateInstance = $this->mapper->fromRequest($requestData);
      $updatedInstances = $this->repository->update($updateInstance);
      $responseData = array_map(function (OpeningHoursInstance $instance) {
        return $this->mapper->toResponse($instance);
      }, $updatedInstances);
      return new Response($this->serializer->serialize($responseData, $this->serializerFormat($request)));
    }
    catch (\InvalidArgumentException $e) {
      throw new BadRequestHttpException('Invalid input: ' . $e->getMessage());
    }
  }

}
