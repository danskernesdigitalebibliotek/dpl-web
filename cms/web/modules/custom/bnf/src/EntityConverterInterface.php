<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Drupal\Core\Entity\FieldableEntityInterface;

/**
 * Interface for entity converter plugins.
 */
interface EntityConverterInterface {

  /**
   * The field and field types of this entity.
   *
   * This is used to automatically map fields of entities to/from the wire
   * format.
   *
   * The 'uuid' field is implied, there's no need to specifiy it.
   *
   * The name (key) is the field name, as basefields are also fields, these can
   * be specified to. Basically, anything that can be read by
   * `FieldableEntityInterface::get()`.
   *
   * The type (value) is the name of a `bnf_field_converter` plugin responsible
   * for the conversion.
   *
   * @return array<string, string>
   *   Field type mapping.
   */
  public function fields(): array;

  /**
   * Normalizes an entity to a network array.
   *
   * Subclasses can override this if they need to add extra data in addition to
   * the fields handled.
   *
   * @return array<string, mixed>
   *   Normalized data.
   */
  public function normalize(FieldableEntityInterface $entity): array;

  /**
   * Deserializes a network array to an entity.
   *
   * Subclasses can override this if they need to add extra data in addition to
   * the fields handled.
   *
   * @param array<string, mixed> $data
   *   The normalized data.
   */
  public function denormalize(array $data): FieldableEntityInterface;

  /**
   * Gets dependees for an entity.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   *
   * @return string[]
   *   An array of dependees in the format "entity_type:uuid".
   */
  public function getDependees(FieldableEntityInterface $entity): array;

}
