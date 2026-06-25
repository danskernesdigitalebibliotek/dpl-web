<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Drupal\Core\Field\FieldItemListInterface;

/**
 * Interface for field converter plugins.
 */
interface FieldConverterInterface {

  /**
   * Normalizes field data to a network array.
   *
   * This returns an array of array field values, regardless of the fields
   * configured cardinality.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface<\Drupal\Core\Field\FieldItemInterface> $field_items
   *   Field items to normalize.
   */
  public function normalize(FieldItemListInterface $field_items): mixed;

  /**
   * Denormalizes network data to field data.
   *
   * @param array<int, mixed> $data
   *   Normalized data.
   */
  public function denormalize(array $data): mixed;

  /**
   * Gets dependees for a field.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface<\Drupal\Core\Field\FieldItemInterface> $field_items
   *   Field items to process.
   *
   * @return string[]
   *   An array of dependees in the format "entity_type:uuid".
   */
  public function getDependees(FieldItemListInterface $field_items): array;

}
