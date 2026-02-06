<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoCategory;
use Drupal\bnf\Plugin\Traits\SoundTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps GO category nodes.
 */
#[BnfMapper(
    id: NodeGoCategory::class,
)]
class NodeGoCategoryMapper extends BnfMapperNodePluginBase {
  use SoundTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof NodeGoCategory) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $node = $this->getNode($object, 'go_category');

    $node->set('field_go_color', $object->goColor);
    $node->set('field_category_menu_image', $this->getImageValue($object->categoryMenuImage));
    $node->set('field_category_menu_sound', $this->getSoundValue($object->categoryMenuSound));
    $node->set('field_category_menu_title', $object->categoryMenuTitle);

    return $node;
  }

}
