<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\BnfMapperInterface;
use Drupal\Component\Plugin\PluginBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;

/**
 * Base class for BNF mapper plugins.
 */
abstract class BnfMapperParagraphPluginBase extends PluginBase implements BnfMapperInterface, ContainerFactoryPluginInterface {
  use AutowirePluginTrait;

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
