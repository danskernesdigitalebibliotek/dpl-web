<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Base class for BNF mapper plugins.
 */
abstract class BnfMapperParagraphPluginBase extends BnfMapperPluginBase {

  /**
   * Entity type manager.
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * Entity storage to create paragraph in.
   */
  protected EntityStorageInterface $paragraphStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->entityTypeManager = $entityTypeManager;
    $this->paragraphStorage = $entityTypeManager->getStorage('paragraph');
  }

}
