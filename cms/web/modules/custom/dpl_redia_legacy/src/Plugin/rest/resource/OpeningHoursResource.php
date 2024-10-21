<?php

declare(strict_types=1);

namespace Drupal\dpl_redia_legacy\Plugin\rest\resource;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursLegacyListGET200ResponseInner as OpeningHoursLegacyResponse;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\dpl_opening_hours\Model\OpeningHoursInstance;
use Drupal\dpl_opening_hours\Plugin\rest\resource\v1\OpeningHoursResourceBase;
use Drupal\drupal_typed\RequestTyped;
use JMS\Serializer\ContextFactory\DefaultSerializationContextFactory;
use Safe\DateTime;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Retrieve opening hours.
 *
 * This resource provides a list of opening hours for the legacy API.
 * The legacy API is used for compatibility with older systems, particularly
 * providing opening hours to the app in the format that it uses.
 * For this legacy API, we divert from the default URL pattern of our endpoints
 * to maintain the old URL pattern. This ensures that the existing app, which
 * relies on this specific endpoint structure, continues to function seamlessly
 * without requiring any changes.
 *
 * @RestResource (
 *   id = "dpl_opening_hours_legacy_list",
 *   label = @Translation("List all opening hours for legacy API"),
 *   uri_paths = {
 *     "canonical" = "/opening_hours/instances",
 *   },
 * )
 */
final class OpeningHoursResource extends OpeningHoursResourceBase {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {

    $serializer_formats = (array) $container->getParameter('serializer.formats');
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $serializer_formats,
      $container->get('logger.factory')->get('rest'),
      $container->get('dpl_opening_hours.custom_serializer'),
      $container->get('dpl_opening_hours.repository'),
      $container->get('dpl_opening_hours.mapper'),
      $container->get('cache_tags.invalidator')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'route_parameters' => [
          Request::METHOD_GET => [
            'from_date' => [
              'name' => 'from_date',
              'type' => 'string',
              'format' => 'date',
              'description' => 'Retrieve opening hours which occur after and including the provided date. In ISO 8601 format.',
              'in' => 'query',
              'required' => TRUE,
            ],
            'to_date' => [
              'name' => 'to_date',
              'type' => 'string',
              'format' => 'date',
              'description' => 'Retrieve opening hours which occur before and including the provided date. In ISO 8601 format.',
              'in' => 'query',
              'required' => TRUE,
            ],
            'nid' => [
              'name' => 'nid',
              'type' => 'array',
              'items' => [
                'type' => 'integer',
              ],
              'collectionFormat' => 'csv',
              'description' => 'The id(s) of the branch(es) for which to retrieve opening hours. Can be a single id or a comma-separated list of ids.',
              'in' => 'query',
              'required' => TRUE,
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
              "items" => $this->openingHoursLegacyInstanceSchema(),
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

    $nid = $typedRequest->getInts('nid');
    if (empty($nid)) {
      throw new BadRequestHttpException("The 'nid' parameter is required.");
    }
    $fromDate = $typedRequest->getDateTime('from_date');
    if ($fromDate === NULL) {
      throw new BadRequestHttpException("The 'from_date' parameter is required.");
    }
    $toDate = $typedRequest->getDateTime('to_date');
    if ($toDate === NULL) {
      throw new BadRequestHttpException("The 'to_date' parameter is required.");
    }

    try {
      $openingHoursInstances = $this->repository->loadMultiple(
        $nid,
        $fromDate,
        $toDate
      );

      $responseData = array_map(function (OpeningHoursInstance $instance) :
      OpeningHoursLegacyResponse {
        return $this->toLegacyResponse($instance);
      }, $openingHoursInstances);

      $context = (new DefaultSerializationContextFactory())
        ->createSerializationContext();
      $context->setSerializeNull(TRUE);

      // Cast the serializer to the custom serializer type, to access the custom
      // method and satisfy phpstan.
      $serializer = $this->serializer;
      /** @var \Drupal\dpl_opening_hours\Plugin\rest\resource\v1\CustomContextSerializer $serializer */

      return (new CacheableResponse($serializer->serializeWithCustomContext($responseData,
        $this->serializerFormat($request), $context)))
        ->addCacheableDependency($this->cachableMetadata());
    }
    catch (\TypeError $e) {
      throw new BadRequestHttpException("Invalid input: {$e->getMessage()}",);
    }

  }

  /**
   * Map a value object to an OpenAPI response.
   *
   * @throws \Exception
   */
  public function toLegacyResponse(OpeningHoursInstance $instance) : OpeningHoursLegacyResponse {
    return (new OpeningHoursLegacyResponse())
      ->setNid(intval($instance->branch->id()))
      ->setCategoryTid(intval($instance->categoryTerm->id()))
      ->setDate(new DateTime($instance->startTime->format('Y-m-d')))
      ->setStartTime($instance->startTime->format("H:i"))
      ->setEndTime($instance->endTime->format('H:i'))
      ->setNotice(NULL);
  }

  /**
   * Generate a schema for an opening hours legacy instance.
   *
   * This allows for reuse across implementing classes.
   *
   * @return mixed[]
   *   OpenAPI schema for a single opening hours legacy instance.
   */
  protected function openingHoursLegacyInstanceSchema(): array {
    return [
      "type" => "object",
      "properties" => [
        "nid" => [
          "type" => "integer",
          "description" => "The node Id of the branch the opening hours instance belongs to.",
        ],
        "category_tid" => [
          "type" => "integer",
          "description" => "The (t)id of the opening hours category.",
        ],
        "date" => [
          "type" => "string",
          "format" => "date",
          "description" => "The date which the opening hours applies to. In ISO 8601 format.",
        ],
        "start_time" => [
          "type" => "string",
          "example" => "09:00",
          "description" => "When the opening hours start. In format HH:MM",
        ],
        "end_time" => [
          "type" => "string",
          "example" => "17:00",
          "description" => "When the opening hours end. In format HH:MM",
        ],
        "notice" => [
          "type" => "string",
          "description" => "Additional notice regarding the opening hours.",
          "nullable" => TRUE,
        ],
      ],
      "required" => [
        "nid",
        "category_tid",
        "date",
        "start_time",
        "end_time",
        "notice",
      ],
    ];
  }

  /**
   * Generate the format to use by the serializer from the request.
   */
  protected function serializerFormat(Request $request): string {
    $contentTypeFormat = $request->getContentTypeFormat();
    if (!$contentTypeFormat) {
      // Default to JSON format. Some code generators will not provide a default
      // value even though it is provided in the spec.
      $contentTypeFormat = $request->get('_format', 'json');
    }
    $mimeType = $request->getMimeType($contentTypeFormat);
    if (!$mimeType) {
      throw new \InvalidArgumentException("Unable to identify serializer format from content type form: $contentTypeFormat");
    }
    return $mimeType;
  }

}
