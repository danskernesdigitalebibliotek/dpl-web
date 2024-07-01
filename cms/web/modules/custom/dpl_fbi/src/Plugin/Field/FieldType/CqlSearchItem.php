<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Defines a field type for CQL(Contextual Query Language) searches within the.
 *
 * FBI category. This custom field will be used for input of CQL queries,
 *
 * from the Drupal interface, in order to facilitate validation and
 *
 * functionality related to the FBI module.
 *
 * @FieldType(
 *   id = "dpl_fbi_cql_search",
 *   label = @Translation("CQL Search"),
 *   category = @Translation("FBI"),
 *   default_widget = "string_textfield",
 *   default_formatter = "string",
 * )
 */
final class CqlSearchItem extends FieldItemBase {

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
      ->setLabel(t('CQL search string'))
      ->setRequired(TRUE);

    return $properties;
  }

  /**
   * Getting the constraints for the field.
   *
   * @return array<mixed>
   *   Array of Constraint objects.
   */
  public function getConstraints() : array {
    $constraints = parent::getConstraints();

    $constraint_manager = $this->getTypedDataManager()->getValidationConstraintManager();

    $options['value']['Length']['max'] = 16000;

    $constraints[] = $constraint_manager->create('ComplexData', $options);
    return $constraints;
  }

  /**
   * {@inheritdoc}
   *
   * @return array{columns: array<string, mixed>}
   *   Array representing the schema of the field in the database.
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition): array {

    $columns = [
      'value' => [
        'type' => 'varchar',
        'not null' => FALSE,
        'description' => 'CQL search string.',
        'length' => 16000,
      ],
    ];

    $schema = [
      'columns' => $columns,
    ];

    return $schema;
  }

  /**
   * {@inheritdoc}
   *
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The field definition for which to generate the sample value.
   *
   * @return array{value: string}
   *   Array containing a sample 'value' for the field.
   */
  public static function generateSampleValue(FieldDefinitionInterface $field_definition): array {

    $values['value'] = "'Harry potter'";
    return $values;
  }

}
