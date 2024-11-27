<?php

namespace Drupal\dpl_react_apps\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block for the Reader React app.
 *
 * @Block(
 *   id = "reader_app_block",
 *   admin_label = "Reader App"
 * )
 */
class ReaderAppBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * A unique identifier for the Reader resource.
   *
   * @var string
   */
  protected string $identifier;
  /**
   * A unique orderid for the Reader resource.
   *
   * @var string
   */
  protected string $orderid;

  /**
   * ReaderAppBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(array $configuration, string $plugin_id, array $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    // Assign the identifier from the configuration if available.
    if (isset($configuration['identifier'])) {
      $this->identifier = $configuration['identifier'];
    }
    else {
      // Default to an empty string if not provided.
      $this->identifier = '';
    }

    // Assign the order ID from the configuration if available.
    if (isset($configuration['orderid'])) {
      $this->orderid = $configuration['orderid'];
    }
    else {
      // Default to an empty string if not provided.
      $this->orderid = '';
    }
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   Render array for the Reader app.
   */
  public function build(): array {
    $data = [
      'identifier' => $this->identifier ?? NULL,
      'orderid' => $this->orderid ?? NULL,
    ];

    return [
      '#theme' => 'dpl_react_app',
      '#name' => 'reader',
      '#data' => $data,
    ];
  }

}
