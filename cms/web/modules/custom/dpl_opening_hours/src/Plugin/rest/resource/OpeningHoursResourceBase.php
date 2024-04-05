<?php

namespace Drupal\dpl_opening_hours\Plugin\rest\resource;

use DanskernesDigitaleBibliotek\CMS\Api\Service\SerializerInterface;
use Drupal\dpl_opening_hours\Mapping\OpeningHoursMapper;
use Drupal\dpl_opening_hours\Model\OpeningHoursRepository;
use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Base class for REST resources exposing opening hours.
 */
abstract class OpeningHoursResourceBase extends ResourceBase {

  /**
   * Constructor.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    protected OpeningHoursRepository $repository,
    protected OpeningHoursMapper $mapper,
    protected SerializerInterface $serializer
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest'),
      $container->get('dpl_opening_hours.repository'),
      $container->get('dpl_opening_hours.mapper'),
      $container->get('dpl_opening_hours.serializer'),
    );
  }

  /**
   * Generate a schema for an opening hours instance.
   *
   * This allows for reuse across implementing classes.
   *
   * @param bool $require_id
   *   Whether the schema should specify the id as required. This is useful for
   *   situations where the id is not known or provided through other means.
   *
   * @return mixed[]
   *   OpenAPI schema for a single opening hours instance.
   */
  public function openingHoursInstanceSchema(bool $require_id = TRUE): array {
    return [
      "type" => "object",
      "properties" => [
        "id" => [
          "type" => "integer",
          "description" => "An serial unique id of the opening hours instance.",
        ],
        "category" => [
          "type" => "object",
          "properties" => [
            "title" => [
              "type" => "string",
            ],
            "color" => [
              "type" => "string",
              "description" => "A CSS compatible color code which can be used to represent the category",
              "example" => "#ff0099",
            ],
          ],
          "required" => [
            "title",
            "color",
          ],
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
        "branch_id" => [
          "type" => "integer",
          "description" => "The id for the branch the instance belongs to",
        ],
      ],
      "required" => array_merge(
        ($require_id ? ["id"] : []),
        [
          "category",
          "date",
          "start_time",
          "end_time",
          "branch_id",
        ]
      ),
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

  /**
   * Deserialize an HTTP request to an OpenAPI request.
   *
   * @param class-string<T> $className
   *   The required class name to deserialize to.
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming HTTP request to deserialize.
   *
   * @template T of object
   *
   * @return T
   *   The specified response.
   */
  protected function deserialize(string $className, Request $request): object {
    $requestData = $this->serializer->deserialize($request->getContent(), $className, $this->serializerFormat($request));
    if (!is_object($requestData) || !($requestData instanceof $className)) {
      throw new \InvalidArgumentException("Unable to deserialize request");
    }
    return $requestData;
  }

}
