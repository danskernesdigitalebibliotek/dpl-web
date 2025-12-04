<?php

declare(strict_types=1);

namespace Drupal\dpl_classes\Hook;

use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;

/**
 * Entity hooks.
 */
class EntityHooks {

  use StringTranslationTrait;

  public function __construct(TranslationInterface $stringTranslation) {
    $this->stringTranslation = $stringTranslation;
  }

  /**
   * Add field to store node/paragraph CSS classes.
   *
   * @return \Drupal\Core\Field\FieldDefinitionInterface[]
   *   The field definitions.
   */
  #[Hook('entity_base_field_info')]
  public function baseFieldInfo(EntityTypeInterface $entity_type): array {
    $fields = [];

    if (in_array($entity_type->id(), ['node', 'paragraph'])) {
      $fields['dpl_classes'] = BaseFieldDefinition::create('string')
        ->setName('dpl_classes')
        ->setLabel($this->t('Custom CSS classes', [], ['context' => 'dpl_classes']))
        ->setDisplayOptions('viev', ['region' => 'hidden'])
        ->setDisplayOptions('form', ['weight' => 100]);
    }

    return $fields;
  }

}
