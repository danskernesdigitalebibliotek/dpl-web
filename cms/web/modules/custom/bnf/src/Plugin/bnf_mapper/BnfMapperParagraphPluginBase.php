<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Base class for BNF mapper plugins.
 */
abstract class BnfMapperParagraphPluginBase extends BnfMapperPluginBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

}
