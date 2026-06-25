<?php

declare(strict_types=1);

namespace Drupal\bnf\Drush\Commands;

use Drupal\bnf\Services\ContentSerializer;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drush\Attributes\Argument;
use Drush\Attributes\Command;
use Drush\Attributes\Help;
use Drush\Attributes\Usage;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Symfony\Component\Yaml\Yaml;

/**
 * Commands for serialization.
 */
class SerializationCommands extends DrushCommands {
  use AutowireTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected ContentSerializer $serializer,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Get serialization for an entity.
   */
  #[Command(name: 'bnf:serialize')]
  #[Help(description: 'Output serialized node in YAML fromat.')]
  #[Argument(name: 'entity_type', description: 'Entity type')]
  #[Argument(name: 'id', description: 'ID of entity to serialize')]
  #[Usage(
    name: 'drush bnf:serialize node 9',
    description: 'Serialize node with NID 9.'
    )]
  public function serialize(string $entity_type, string $id): void {
    $entity = $this->entityTypeManager->getStorage($entity_type)->load($id);

    $data = $this->serializer->serialize($entity);

    echo Yaml::dump($data, 5, 2);
  }

  /**
   * Unserialize an entity from YAML and save it.
   */
  #[Command(name: 'bnf:unserialize')]
  #[Help(description: 'Unserialize YAML from stdin and save the resulting entity.')]
  #[Usage(
    name: 'cat entity.yml | drush bnf:unserialize',
    description: 'Unserialize and save entity from YAML on stdin.'
  )]
  public function unserialize(): void {
    $yaml = file_get_contents('php://stdin');

    if (!$yaml) {
      $this->logger()->error('No input provided.');
      return;
    }

    $data = Yaml::parse($yaml);
    $entities = $this->serializer->deserialize($data);
    foreach ($entities as $id => $entity) {
      $entity->save();

      $this->logger()->success(sprintf('Successfully saved %s entity %s.', $entity->getEntityTypeId(), $entity->id()));
    }
  }

}
