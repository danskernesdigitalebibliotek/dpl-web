<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Resolves paragraphs to app elements.
 *
 * @DataProducer(
 *   id = "app_elements_producer",
 *   name = "App elements Producer",
 *   description = "Provides elements for the app.",
 *   produces = @ContextDefinition("any",
 *     label = "Array of elements"
 *   ),
 *   consumes = {
 *     "entity" = @ContextDefinition("any",
 *       label = "Entity to get icon for"
 *     )
 *   }
 * )
 */
class ElementsProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * Resolves the elements.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The node to elements from.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return array<mixed>
   *   App elements.
   */
  public function resolve(
    ContentEntityInterface $entity,
    FieldContext $field_context,
  ): array {
    $result = [];
    if (!$entity->hasField('field_paragraphs')) {
      return $result;
    }

    $paragraphs = $entity->get('field_paragraphs');

    if (!$paragraphs instanceof EntityReferenceFieldItemList) {
      return $result;
    }

    $field_context->addCacheableDependency($entity);

    /** @var \Drupal\Core\Entity\ContentEntityInterface $paragraph */
    foreach ($paragraphs->referencedEntities() as $paragraph) {
      // This is very naive implementation that'll become unwieldy when we've
      // added a few more paragraph types, but it'll do for the first take.
      // It would be nice to decouple the knowledge about the individual
      // paragraphs from this class, but how the paragraph maps to the app
      // element is coupled to the type we define in
      // dpl_app_categories.base.graphqls, and it would be nice if they where
      // near each other.
      if ($paragraph->bundle() == 'text_body') {
        $field_context->addCacheableDependency($paragraph);

        $result[] = [
          '__type' => 'AppContentElementText',
          'id' => $paragraph->uuid(),
          'body' => $paragraph->get('field_body')->value,
        ];
      }
    }

    return $result;
  }

}
