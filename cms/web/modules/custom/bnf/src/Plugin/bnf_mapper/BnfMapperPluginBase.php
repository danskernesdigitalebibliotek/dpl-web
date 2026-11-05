<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\BnfMapperInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Plugin\PluginBase;

/**
 * Base class for BNF mapper plugins.
 */
abstract class BnfMapperPluginBase extends PluginBase implements BnfMapperInterface, ContainerFactoryPluginInterface {

}
