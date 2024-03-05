<?php

declare(strict_types = 1);

namespace Drupal\dpl_fbi\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Defines the 'dpl_fbi_work_id' field type for inputs of work-Ids.
 *
 * This field will be used when input of work-id's .
 *
 * from the Drupal interface, in order to facilitate validation and
 *
 * functionality related to the FBI module concerning work-ids.
 *
 * @FieldType(
 *   id = "dpl_fbi_work_id",
 *   label = @Translation("Work ID"),
 *   category = @Translation("FBI"),
 *   default_widget = "string_textfield",
 *   default_formatter = "string",
 * )
 */
final class WorkIdItem extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public function isEmpty(): bool {
    return match ($this->get('value')->getValue()) {
      NULL, '' => TRUE,
      default => FALSE,
    };
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition): array {

    $properties['value'] = DataDefinition::create('string')
      ->setLabel(t('Text value'))
      ->setRequired(TRUE);

    return $properties;
  }

  /**
   * {@inheritdoc}
   *
   * @return \Symfony\Component\Validator\Constraint[]
   *   Array of constraints.
   */
  public function getConstraints(): array {
    $constraints = parent::getConstraints();

    $constraint_manager = $this->getTypedDataManager()->getValidationConstraintManager();

    $options['value']['Length']['max'] = 255;

    $constraints[] = $constraint_manager->create('ComplexData', $options);
    return $constraints;
  }

  /**
   * {@inheritdoc}
   *
   * @return mixed[]
   *   An associative array with the schema definition.
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition): array {

    $columns = [
      'value' => [
        'type' => 'varchar',
        'not null' => FALSE,
        'description' => 'Work id.',
        'length' => 255,
      ],
    ];

    $schema = [
      'columns' => $columns,
      // @todo Add indexes here if necessary.
    ];

    return $schema;
  }

  /**
   * {@inheritdoc}
   *
   * @return mixed[]
   *   An associative array of values.
   */
  public static function generateSampleValue(FieldDefinitionInterface $field_definition): array {

    $values['value'] = 'work-of:870970-basis:25660722';
    return $values;
  }

}
