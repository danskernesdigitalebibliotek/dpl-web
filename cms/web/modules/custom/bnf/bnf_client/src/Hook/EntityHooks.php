<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Hook;

use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;

/**
 * Subsciptpion entity hooks.
 */
class EntityHooks {

  use StringTranslationTrait;

  public function __construct(TranslationInterface $stringTranslation) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add subscription field to nodes.
   *
   * @return \Drupal\Core\Field\FieldDefinitionInterface[]
   *   The field definitions.
   */
  #[Hook('entity_base_field_info')]
  public function baseFieldInfo(EntityTypeInterface $entity_type): array {
    $fields = [];

    // Create new fields for node bundle.
    if ($entity_type->id() === 'node') {
      $fields = $this->fieldDefinitions();
    }

    return $fields;
  }

  /**
   * Field definitions for node. We need this as part of install.
   *
   * @return \Drupal\Core\Field\BaseFieldDefinition[]
   *   The field definitions.
   */
  public function fieldDefinitions(): array {
    $fields = [];

    $fields['bnf_source_subscriptions'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel($this->t('BNF source subscriptions', [], ['context' => 'BNF']))
      ->setDescription($this->t('The subscriptions that this content originates from.', [], ['context' => 'BNF']))
      ->setSetting('target_type', 'bnf_subscription')
      ->setSetting('handler', 'default')
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED);

    return $fields;
  }

}
