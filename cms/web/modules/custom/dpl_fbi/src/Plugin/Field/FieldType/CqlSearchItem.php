<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi\Plugin\Field\FieldType;

use Drupal\dpl_fbi\FirstAccessionDateOperator;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * CQL search field with columns for advanced filters and search link reference.
 *
 * @FieldType(
 *   id = "dpl_fbi_cql_search",
 *   label = @Translation("CQL Search"),
 *   category = @Translation("FBI"),
 *   default_widget = "dpl_fbi_cql_search",
 *   default_formatter = "string",
 * )
 */
final class CqlSearchItem extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public function isEmpty(): bool {
    $value = $this->get('value')->getValue();
    return $value === NULL || $value === '';
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition): array {

    $properties['value'] = DataDefinition::create('string')
      ->setLabel(t('CQL search string'))
      ->setRequired(TRUE);

    $properties['location'] = DataDefinition::create('string')
      ->setLabel(t('Location', [], ['context' => 'dpl_fbi']))
      ->setRequired(FALSE);

    $properties['sublocation'] = DataDefinition::create('string')
      ->setLabel(t('Sub-location', [], ['context' => 'dpl_fbi']))
      ->setRequired(FALSE);

    $properties['branch'] = DataDefinition::create('string')
      ->setLabel(t('Branch', [], ['context' => 'dpl_fbi']))
      ->setRequired(FALSE);

    $properties['department'] = DataDefinition::create('string')
      ->setLabel(t('Department', [], ['context' => 'dpl_fbi']))
      ->setRequired(FALSE);

    $properties['onshelf'] = DataDefinition::create('boolean')
      ->setLabel(t('On-shelf', [], ['context' => 'dpl_fbi']))
      ->setRequired(FALSE);

    $properties['sort'] = DataDefinition::create('string')
      ->setLabel(t('Sorting', [], ['context' => 'dpl_fbi']))
      ->setRequired(FALSE);

    // Use a string instead of a proper datetime_iso8601 to support relative
    // dates supported by CQL e.g. "NOW - 90 DAYS".
    $properties['first_accession_date_value'] = DataDefinition::create('string')
      ->setLabel(t('First accession date: Value', [], ['context' => 'dpl_fbi']))
      ->setDescription(t(
        'The format should be YYYY-MM-DD e.g. 2024-11-24. Terms ”NOW”, ”DAYS” and ”MONTHS” can also be used. For example ”NOW - 90 DAYS”. Remember to add a space on both sides of the plus and minus symbols.',
        [],
        ['context' => 'dpl_fbi']
      ))
      ->setRequired(FALSE);

    // Type matches values from \Drupal\dpl_fbi\FirstAccessionDateOperator.
    $properties['first_accession_date_operator'] = DataDefinition::create('string')
      ->setLabel(t('First accession date: Operator', [], ['context' => 'dpl_fbi']))
      ->setRequired(FALSE);

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
      'location' => [
        'type' => 'text',
        'length' => 1024,
        'not null' => FALSE,
        'description' => '"Location" search filter',
      ],
      'sublocation' => [
        'type' => 'text',
        'length' => 1024,
        'not null' => FALSE,
        'description' => '"Sub-location" search filter',
      ],
      'branch' => [
        'type' => 'text',
        'length' => 1024,
        'not null' => FALSE,
        'description' => '"Branch" search filter',
      ],
      'department' => [
        'type' => 'text',
        'length' => 1024,
        'not null' => FALSE,
        'description' => '"Department" search filter',
      ],
      'sort' => [
        'type' => 'varchar',
        'length' => 128,
        'not null' => FALSE,
        'description' => 'The chosen search sort',
      ],
      'onshelf' => [
        'type' => 'int',
        'length' => 1,
        'not null' => FALSE,
        'description' => '"On shelf" search filter',
      ],
      'first_accession_date_value' => [
        // Use a varchar instead of a proper datetime to support relative dates
        // supported by CQL e.g. "NOW - 90 DAYS".
        'type' => 'varchar',
        'length' => 20,
        'not null' => FALSE,
        'description' => '"First accession date" search filter: Value',
      ],
      'first_accession_date_operator' => [
        // Type matches values from \Drupal\dpl_fbi\FirstAccessionDateOperator.
        'type' => 'varchar',
        'length' => 1,
        'not null' => FALSE,
        'description' => '"First accession date" search filter: Operator',
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
   *   Array containing a sample value for the fields.
   */
  public static function generateSampleValue(FieldDefinitionInterface $field_definition): array {
    $values['value'] = " term.title='Harry Potter' AND term.creator= 'J.K. Rowling' AND ( term.generalmaterialtype='bøger' OR term.generalmaterialtype='e-bøger') AND term.fictionnonfiction='fiction'";
    $values['location'] = '';
    $values['sublocation'] = 'fantasy';
    $values['onshelf'] = 1;
    $values['sort'] = 'sort.latestpublicationdate.asc';
    $values['first_accession_date_value'] = '2025-01-01';
    $values['first_accession_date_operator'] = FirstAccessionDateOperator::LaterThan;
    $values['link'] = "/advanced-search?sort=sort.creator.asc&onshelf=true&sublocation=fantasy&advancedSearchCql=+term.title%3D'Harry+Potter'+AND+term.creator%3D+'J.K.+Rowling'+AND+(+term.generalmaterialtype%3D'bøger'+OR+term.generalmaterialtype%3D'e-bøger')+AND+term.fictionnonfiction%3D'fiction'";
    return $values;
  }

}
