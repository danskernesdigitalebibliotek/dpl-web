<?php

declare(strict_types=1);

namespace Drupal\dpl_logging\Hook;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\file\FileInterface;
use Psr\Log\LoggerAwareInterface;
use Psr\Log\LoggerAwareTrait;

/**
 * Entity hooks.
 */
class EntityHooks implements LoggerAwareInterface {

  use AutowirePluginTrait;
  use LoggerAwareTrait;

  /**
   * Log file deletion.
   */
  #[Hook('entity_delete')]
  public function logFileDeletion(EntityInterface $entity): void {
    if ($entity instanceof FileInterface) {
      $this->logger?->info('File entity deleted: @filename (@id)', [
        '@filename' => $entity->getFilename(),
        '@id' => $entity->id(),
      ]);
    }
  }

}
