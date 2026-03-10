<?php

declare(strict_types=1);

namespace Drupal\bnf\Services;

use Drupal\bnf\EntityConverterManager;
use Drupal\Core\Entity\FieldableEntityInterface;

/**
 * Serializes and deserializes content for the BNF network.
 */
class ContentSerializer {

  /**
   * Constructor.
   */
  public function __construct(
    protected EntityConverterManager $entityConverterManager,
  ) {
  }

  /**
   * Serializes an entity to a network array.
   */
  public function serialize(FieldableEntityInterface $entity): mixed {
    $converters = $this->entityConverterManager->getDefinitions();
    foreach ($converters as $definition) {
      if ($definition['entity_type'] === $entity->getEntityTypeId()) {
        if (empty($definition['bundle']) || $definition['bundle'] === $entity->bundle()) {
          /** @var \Drupal\bnf\EntityConverterInterface $converter */
          $converter = $this->entityConverterManager->createInstance($definition['id']);
          return [
            $converter::class => $converter->normalize($entity),
          ];
        }
      }
    }

    throw new \RuntimeException(sprintf('No converter found for entity type "%s" and bundle "%s"', $entity->getEntityTypeId(), $entity->bundle()));
  }

  /**
   * Deserializes a network array to an entity.
   */
  public function deserialize(mixed $data): FieldableEntityInterface {
    $class = array_key_first($data);

    if (!is_string($class)) {
      throw new \RuntimeException('No entity type given');
    }

    $payload = $data[$class];

    /** @var \Drupal\bnf\EntityConverterInterface $converter */
    $converter = $this->entityConverterManager->createInstance($class);
    return $converter->denormalize($payload);
  }

}
