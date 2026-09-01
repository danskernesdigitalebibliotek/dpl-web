<?php

declare(strict_types=1);

namespace Drupal\bnf\Hook;

use Drupal\bnf\BnfStateEnum;
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
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add fields for tracking BNF status to nodes.
   *
   * @return \Drupal\Core\Field\FieldDefinitionInterface[]
   *   The field definitions.
   */
  #[Hook('entity_base_field_info')]
  public function baseFields(EntityTypeInterface $entity_type): array {
    $fields = [];

    // Create new fields for node bundle.
    if ($entity_type->id() === 'node') {
      $fields[BnfStateEnum::FIELD_NAME] = BaseFieldDefinition::create('enum_integer')
        ->setName(BnfStateEnum::FIELD_NAME)
        ->setLabel($this->t('BNF State', [], ['context' => 'BNF']))
        ->setDescription($this->t('The BNF state of the entity, defining if it was imported, exported, or neither.', [], ['context' => 'BNF']))
        ->setSetting('enum_class', BnfStateEnum::class)
        ->setDefaultValue(BnfStateEnum::None);

      $fields['bnf_source_changed'] = BaseFieldDefinition::create('string')
        ->setName('bnf_source_changed')
        ->setLabel($this->t('BNF source updated', [], ['context' => 'BNF']))
        ->setDescription($this->t('The datetime of when this content was last updated at the source.', [], ['context' => 'BNF']));

      $fields['bnf_source_name'] = BaseFieldDefinition::create('string')
        ->setName('bnf_source_name')
        ->setLabel($this->t('BNF Source', [], ['context' => 'BNF']))
        ->setDescription($this->t('The site name of the source of this content', [], ['context' => 'BNF']));
    }

    return $fields;
  }

}
