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

          $data = $converter->normalize($entity);

          if ($entity->getEntityTypeId() === $entity->bundle()) {
            $data['__type'] = $entity->getEntityTypeId();
          }
          else {
            $data['__type'] = $entity->getEntityTypeId() . ':' . $entity->bundle();
          }

          return $data;
        }
      }
    }

    throw new \RuntimeException(sprintf('No converter found for entity type "%s" and bundle "%s"', $entity->getEntityTypeId(), $entity->bundle()));
  }

  /**
   * Deserializes a network array to an entity.
   */
  public function deserialize(mixed $data): FieldableEntityInterface {
    if (!isset($data['__type']) || !is_string($data['__type'])) {
      throw new \RuntimeException('No entity type given');
    }

    $typeParts = explode(':', $data['__type'], 2);
    $entityType = $typeParts[0];
    $bundle = $typeParts[1] ?? $entityType;

    $converters = $this->entityConverterManager->getDefinitions();
    $converterId = NULL;
    foreach ($converters as $definition) {
      if ($definition['entity_type'] === $entityType) {
        if (empty($definition['bundle']) || $definition['bundle'] === $bundle) {
          $converterId = $definition['id'];
          break;
        }
      }
    }

    if (!$converterId) {
      throw new \RuntimeException(sprintf('No converter found for entity type "%s" and bundle "%s"', $entityType, $bundle));
    }

    $payload = $data;
    unset($payload['__type']);

    /** @var \Drupal\bnf\EntityConverterInterface $converter */
    $converter = $this->entityConverterManager->createInstance($converterId);
    return $converter->denormalize($payload);
  }

}
