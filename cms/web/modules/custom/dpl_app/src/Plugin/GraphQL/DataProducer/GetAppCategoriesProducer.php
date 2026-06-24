<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\taxonomy\Entity\Term;
use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_app\AppType;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Resolves app categories.
 *
 * @DataProducer(
 *   id = "get_app_categories_producer",
 *   name = "Get App Categories Producer",
 *   description = "Provides categories for the app.",
 *   produces = @ContextDefinition("any",
 *     label = "AppCategories"
 *   ),
 *   consumes = {
 *     "type" = @ContextDefinition("string",
 *       label = "App type categories",
 *       required = true
 *     ),
 *     "uuid" = @ContextDefinition("any",
 *       label = "Get selected category",
 *       required = false
 *     )
 *   }
 * )
 */
class GetAppCategoriesProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected EntityTypeManagerInterface $entititypeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Resolves the categories.
   *
   * @param string $type
   *   The app type to get categories for.
   * @param string|null $uuid
   *   Optional single category UUID to return.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface[]
   *   The categories.
   */
  public function resolve(
    string $type,
    ?string $uuid,
    FieldContext $field_context,
  ): array {
    $type = AppType::tryFrom($type);

    return match ($type) {
      AppType::Biblo => $this->getTermCategories($type, $uuid),
      AppType::MyBiblo => $this->getTermCategories($type, $uuid),
      AppType::BibloGo => $this->getGoCategories($uuid),
      default => [],
    };
  }

  /**
   * Get Go categories.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface[]
   *   The categories.
   */
  protected function getGoCategories(?string $uuid): array {
    $storage = $this->entititypeManager->getStorage('node');
    $query = $storage->getQuery();
    $query->condition('type', 'go_category')
      ->condition('status', TRUE)
      ->sort('changed', 'DESC');

    if ($uuid) {
      $query->condition('uuid', $uuid);
    }

    $nids = $query->accessCheck(TRUE)
      ->execute();

    if (!$nids) {
      return [];
    }

    // Get the values so they're indexed from 0.
    return array_values($storage->loadMultiple($nids));
  }

  /**
   * Get Biblo/MyBiblo categories by term.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface[]
   *   The categories.
   */
  protected function getTermCategories(AppType $type, ?string $uuid): array {
    $term = $this->getTermByAppType($type);

    if (!$term) {
      return [];
    }

    $storage = $this->entititypeManager->getStorage('node');
    $query = $storage->getQuery();
    $query->condition('status', 1)
      ->condition('field_tags', $term->id())
      ->sort('changed', 'DESC');

    if ($uuid) {
      $query->condition('uuid', $uuid);
    }

    $nids = $query->accessCheck(TRUE)
      ->execute();

    if (!$nids) {
      return [];
    }

    // Get the values so they're indexed from 0.
    return array_values($storage->loadMultiple($nids));
  }

  /**
   * Get the category term for the app type.
   */
  protected function getTermByAppType(AppType $type): ?Term {
    $termName = match ($type) {
      AppType::Biblo => 'app-biblo',
      AppType::MyBiblo => 'app-mitbiblo',
      default => '',
    };

    if (!$termName) {
      return NULL;
    }

    $term = $this->entititypeManager->getStorage('taxonomy_term')->loadByProperties([
      'name' => $termName,
    ]);

    if (!$term) {
      return NULL;
    }

    return reset($term);
  }

}
