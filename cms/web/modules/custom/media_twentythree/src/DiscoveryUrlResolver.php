<?php

namespace Drupal\media_twentythree;

use Drupal\media\OEmbed\UrlResolver;

/**
 * Url resolver with support for public discovery of resource urls.
 */
class DiscoveryUrlResolver extends UrlResolver {

  /**
   * {@inheritDoc}
   *
   * phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found
   */
  public function discoverResourceUrl($url) {
    // For whatever reason this method is protected in the parent class.
    return parent::discoverResourceUrl($url);
  }

}
