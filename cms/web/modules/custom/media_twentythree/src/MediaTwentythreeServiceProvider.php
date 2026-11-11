<?php

declare(strict_types=1);

namespace Drupal\media_twentythree;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Swaps in our url resolver for the core oEmbed url resolver.
 *
 * A decorator would not do, as core calls discoverResourceUrl() on itself.
 */
class MediaTwentythreeServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container): void {
    $container->getDefinition('media.oembed.url_resolver')
      ->setClass(DiscoveryUrlResolver::class)
      ->addMethodCall('setConfigFactory', [new Reference('config.factory')]);
  }

}
