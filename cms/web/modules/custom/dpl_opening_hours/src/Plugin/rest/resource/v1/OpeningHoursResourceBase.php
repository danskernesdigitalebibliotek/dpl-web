<?php

namespace Drupal\dpl_opening_hours\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Service\SerializerInterface;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\dpl_opening_hours\Mapping\OpeningHoursMapper;
use Drupal\dpl_opening_hours\Mapping\OpeningHoursRepetitionType;
use Drupal\dpl_opening_hours\Model\OpeningHoursRepository;
use Drupal\dpl_rest_base\Plugin\RestResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Base class for REST resources exposing opening hours.
 */
abstract class OpeningHoursResourceBase extends RestResourceBase {

  /**
   * The cache tag to use for list operations.
   */
  const CACHE_TAG_LIST = 'dpl_opening_hours:list';

  /**
   * Constructor.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    protected SerializerInterface $serializer,
    protected OpeningHoursRepository $repository,
    protected OpeningHoursMapper $mapper,
    protected CacheTagsInvalidatorInterface $cacheTagsInvalidator,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger, $serializer);
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
      $container->get('dpl_rest_base.serializer'),
      $container->get('dpl_opening_hours.repository'),
      $container->get('dpl_opening_hours.mapper'),
      $container->get('cache_tags.invalidator')
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
  protected function openingHoursInstanceSchema(bool $require_id = TRUE): array {
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
        "repetition" => [
          "type" => "object",
          "properties" => [
            "id" => [
              "type" => "integer",
              "description" => $this->formatMultilineDescription(
                "A serial unique id of the repetition. All instances with the same id belongs to the " .
                "same repetition.",
              ),
            ],
            "type" => [
              "type" => "string",
              "description" => $this->formatMultilineDescription(
                "If/how the instance should be repeated in the future: \n" .
                "  - single: The instance should not be repeated \n" .
                "  - weekly: The instance should be repeated weekly from the first day of the repetition until the " .
                "            provided end date. The week day of the first instance defines which weekday should be " .
                "            used for the repeated instances."
              ),
              "enum" => OpeningHoursRepetitionType::cases(),
              "default" => OpeningHoursRepetitionType::None,
            ],
            // If a repetition type requires additional data then a
            // corresponding property with the name "[repetition_type]_data"
            // and the type "object" must be added. The properties of this
            // object must contain all this data.
            "weekly_data" => [
              "type" => "object",
              "properties" => [
                "end_date" => [
                  "type" => "string",
                  "format" => "date",
                  "description" => $this->formatMultilineDescription(
                    "The end date of the repetition. If the end date is not on the same week day as the first " .
                    "instance then the preceding occurrence of the weekday will be the last instance. \n\n" .
                    "This field must be provided if type is 'weekly'",
                  ),
                ],
              ],
            ],
          ],
          "required" => [
            ... ($require_id ? ["id"] : []),
            "type",
          ],
        ],
      ],
      "required" => [
        ... ($require_id ? ["id"] : []),
        "category",
        "date",
        "start_time",
        "end_time",
        "branch_id",
        "repetition",
      ],
    ];
  }

  /**
   * Get metadata for cacheable responses.
   */
  protected function cachableMetadata() : CacheableMetadata {
    return (new CacheableMetadata())
      // Provide a single cache tag for all responses. This provides a single,
      // simple way to clear the entire response cache when any opening hour
      // is updated.
      ->setCacheTags([self::CACHE_TAG_LIST])
      // Vary all responses based on url. Path and query arguments are used
      // to filter opening hours so this provides individual cache entries
      // per argument combination.
      ->setCacheContexts(['url']);
  }

  /**
   * Invalidate the response cache.
   */
  protected function invalidateCache(): void {
    // Cache can only be invalidated by tags - not contexts.
    $this->cacheTagsInvalidator->invalidateTags($this->cachableMetadata()->getCacheTags());
  }

}
