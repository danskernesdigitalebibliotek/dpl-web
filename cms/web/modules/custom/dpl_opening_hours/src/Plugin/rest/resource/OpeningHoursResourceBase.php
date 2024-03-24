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
        "branch_id" => [
          "type" => "integer",
          "description" => "The id for the branch the instance belongs to",
        ],
      ],
      "required" =>
      ($require_id ? ["id"] : []) +
        [
          "category",
          "date",
          "start_time",
          "end_time",
          "branch_id",
        ],
    ];
  }

}
