<?php

declare(strict_types = 1);

namespace Drupal\dpl_opening_hours\Plugin\rest\resource\v1;

use Drupal\Component\Utility\NestedArray;
use Drupal\drupal_typed\RequestTyped;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Delete individual opening hours.
 *
 * @RestResource (
 *   id = "dpl_opening_hours_delete",
 *   label = @Translation("Delete individual opening hours"),
 *   uri_paths = {
 *     "canonical" = "/api/v1/opening_hours/{id}",
 *   },
 * )
 */
final class OpeningHoursDeleteResource extends OpeningHoursResourceBase {

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'route_parameters' => [
          Request::METHOD_DELETE => [
            'repetition_id' => [
              'name' => 'repetition_id',
              'type' => 'integer',
              'description' => $this->formatMultilineDescription(
                "The id of the repetition to delete. \n" .
                "If this is provided then all opening hours from the provided instance " .
                "to the final instance in the provided repetition will be deleted."
              ),
              'in' => 'query',
              'required' => FALSE,
            ],
          ],
        ],
      ],
      [
        'responses' => [
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
   * Delete an opening hours instance.
   */
  public function delete(int $id, Request $request): Response {
    $typedRequest = new RequestTyped($request);
    $deleted = $this->repository->delete($id, $typedRequest->getInt('repetition_id'));
    if (!$deleted) {
      throw new BadRequestHttpException("No instance for id '{$id}'");
    }

    return new Response("", Response::HTTP_NO_CONTENT);
  }

}
