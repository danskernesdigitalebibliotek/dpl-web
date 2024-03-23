<?php

namespace Drupal\dpl_opening_hours\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Base class for REST resources exposing opening hours.
 */
abstract class OpeningHoursResourceBase extends ResourceBase {

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
    );
  }

  /**
   * Generate a schema for an opening hours instance.
   *
   * This allows for reuse across implementing classes.
   *
   * @return mixed[]
   *   OpenAPI schema for a single opening hours instance.
   */
  public function openingHoursInstanceSchema(): array {
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
          ],
        ],
        "date" => [
          "type" => "string",
          "format" => "date",
          "description" => "When the event was created. In ISO 8601 format.",
        ],
        "start_time" => [
          "type" => "string",
          "example" => "9:00",
          "description" => "When the opening hours start. In format HH:MM",
        ],
        "end_time" => [
          "type" => "string",
          "example" => "17:00",
          "description" => "When the opening hours end. In format HH:MM",
        ],
      ],
      "required" => [
        "id",
        "category",
        "date",
        "start_time",
        "end_time",
      ],
    ];
  }

}
