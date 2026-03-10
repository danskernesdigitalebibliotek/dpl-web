<?php

declare(strict_types=1);

namespace Drupal\bnf\Drush\Commands;

use Drupal\bnf\Services\ContentSerializer;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drush\Attributes\Argument;
use Drush\Attributes\Command;
use Drush\Attributes\Help;
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

}
