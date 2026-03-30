<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_field_converter;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\FieldConverterInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Plugin\PluginBase;

/**
 * Base class for BNF field converters.
 */
abstract class FieldConverterBase extends PluginBase implements FieldConverterInterface, ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * {@inheritdoc}
   */
  public function getDependees(FieldItemListInterface $field_items): array {
    return [];
  }

}
