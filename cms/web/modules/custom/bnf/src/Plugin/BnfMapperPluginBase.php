<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\BnfMapperInterface;
use Drupal\Component\Plugin\PluginBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;

/**
 * Base class for BNF mapper plugins.
 */
abstract class BnfMapperPluginBase extends PluginBase implements BnfMapperInterface, ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

}
