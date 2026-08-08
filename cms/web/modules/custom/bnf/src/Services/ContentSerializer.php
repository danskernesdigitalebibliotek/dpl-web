<?php

declare(strict_types=1);

namespace Drupal\bnf\Services;

use Drupal\bnf\EntityConverterInterface;
use Drupal\bnf\EntityConverterManager;
use Drupal\Core\Entity\EntityTypeManagerInterface;
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
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
  }

  /**
   * Serializes an entity to a network array.
   */
  public function serialize(FieldableEntityInterface $entity): mixed {
    $data['__content_map'] = $this->getDependees($entity);

    foreach (array_keys($data['__content_map']) as $entityId) {
      [$type, $uuid] = explode(':', $entityId);

      $entities = $this->entityTypeManager->getStorage($type)
        ->loadByProperties(['uuid' => $uuid]);

      if (!$entities) {
        throw new \RuntimeException(sprintf('Could not load %s with UUID %s', $type, $uudi));
      }

      $entity = reset($entities);

      $entityData = $this->getConverter($entity)->normalize($entity);

      if ($entity->getEntityTypeId() === $entity->bundle()) {
        $entityData['__type'] = $entity->getEntityTypeId();
      }
      else {
        $entityData['__type'] = $entity->getEntityTypeId() . ':' . $entity->bundle();
      }

      $data[$entityId] = $entityData;
    }

    return $data;
  }

  /**
   * Deserializes a network array to an entity.
   */
  public function deserialize(mixed $data): array {
    // Dependees comes after dependents in the data, so work in reverse.
    $data = array_reverse($data);

    $entities = [];
    foreach ($data as $id => $entityData) {
      if ($id == '__content_map') {
        continue;
      }

      if (!isset($entityData['__type']) || !is_string($entityData['__type'])) {
        throw new \RuntimeException('No entity type given');
      }

      $type = $entityData['__type'];
      $typeParts = explode(':', $type, 2);
      $entityType = $typeParts[0];
      $bundle = $typeParts[1] ?? $entityType;

      unset($entityData['__type']);

      $entities[$id] = $this->getConverterByTypeString($type)->denormalize($entityData);
    }

    return $entities;
  }

  /**
   * Gets dependees for an entity, building a map and checking for cyclic references.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   *
   * @return array<string, array<int, string>>
   *   An array mapping "entity_type:uuid" to an array of its dependees ("entity_type:uuid").
   *
   * @throws \RuntimeException
   *   If a cyclic reference is detected.
   */
  public function getDependees(FieldableEntityInterface $entity): array {
    $contentMap = [];
    $stack = [];
    $this->buildContentMap($entity, $contentMap, $stack);
    return $contentMap;
  }

  /**
   * Recursive helper to build a content map.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity.
   * @param array<string, array<int, string>> $contentMap
   *   The content mop being built.
   * @param array<string, bool> $visited
   *   Visited nodes.
   * @param array<string, bool> $stack
   *   Current recursion stack to detect cycles.
   *
   * @throws \RuntimeException
   *   If a cyclic reference is detected.
   */
  protected function buildContentMap(FieldableEntityInterface $entity, array &$contentMap, array &$stack): void {
    $id = $entity->getEntityTypeId() . ':' . $entity->uuid();

    if (isset($stack[$id])) {
      $path = array_keys($stack);
      $path[] = $id;
      throw new \RuntimeException(sprintf('Cyclic reference detected: %s', implode(' -> ', $path)));
    }

    if (isset($contentMap[$id])) {
      return;
    }

    $stack[$id] = TRUE;

    $dependees = $this->getConverter($entity)->getDependees($entity);

    $contentMap[$id] = $dependees;

    foreach ($dependees as $dependee) {
      [$entityType, $uuid] = explode(':', $dependee, 2);
      $entities = $this->entityTypeManager->getStorage($entityType)
        ->loadByProperties(['uuid' => $uuid]);
      if ($entities) {
        $dependeeEntity = reset($entities);
        if ($dependeeEntity instanceof FieldableEntityInterface) {
          $this->buildContentMap($dependeeEntity, $contentMap, $stack);
        }
      }
    }

    unset($stack[$id]);
  }

  /**
   * Get an entity converter instance.
   */
  protected function getConverter(FieldableEntityInterface $entity): EntityConverterInterface {
    $converters = $this->entityConverterManager->getDefinitions();

    foreach ($converters as $definition) {
      if ($definition['entity_type'] === $entity->getEntityTypeId()) {
        if (empty($definition['bundle']) || $definition['bundle'] === $entity->bundle()) {
          /** @var \Drupal\bnf\EntityConverterInterface $converter */
          return $this->entityConverterManager->createInstance($definition['id']);
        }
      }
    }

    throw new \RuntimeException(sprintf('No converter found for entity type "%s" and bundle "%s"', $entity->getEntityTypeId(), $entity->bundle()));
  }

  /**
   * Get an entity converter instance by "<entity>:<type>" string.
   */
  public function getConverterByTypeString(string $type): EntityConverterInterface {
    $typeParts = explode(':', $type, 2);
    $entityType = $typeParts[0];
    $bundle = $typeParts[1] ?? $entityType;

    $converters = $this->entityConverterManager->getDefinitions();
    $converterId = NULL;
    foreach ($converters as $definition) {
      if ($definition['entity_type'] === $entityType) {
        if (empty($definition['bundle']) || $definition['bundle'] === $bundle) {
          return $this->entityConverterManager->createInstance($definition['id']);
        }
      }
    }

    throw new \RuntimeException(sprintf('No converter found for entity type "%s" and bundle "%s"', $entityType, $bundle));
  }

}
