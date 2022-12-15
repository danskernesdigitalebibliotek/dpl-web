<?php

namespace Drupal\dpl_login\Adgangsplatformen;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;

/**
 * Factory for creating Adgangsplatformen OpenID Connect client instances.
 *
 * This class is not intended for direct usage. It allows us to create a client
 * as a service.
 */
class Factory {

  /**
   * Constructor.
   */
  public function __construct(
    private PluginManagerInterface $manager,
    private Config $config
  ) {}

  /**
   * Create an Adgangsplatformen OpenID Connect client instance.
   */
  public function createInstance(): OpenIDConnectClientInterface {
    /** @var \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $plugin */
    $plugin = $this->manager->createInstance('adgangsplatformen', $this->config->pluginConfig());
    return $plugin;
  }

}
