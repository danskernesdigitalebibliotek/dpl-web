<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Plugin\QueueWorker;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Form\SettingsForm;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Update node content.
 *
 * @QueueWorker(
 *   id = "bnf_client_node_update",
 *   title = @Translation("Update node content."),
 *   cron = {"time" = 60}
 * )
 */
class NodeUpdate extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * The BNF site base URL.
   */
  protected string $baseUrl;

  /**
   * Constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $pluginId
   *   The plugin ID for the plugin instance.
   * @param mixed $pluginDefinition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Config factory.
   * @param \Drupal\bnf\Services\BnfImporter $importer
   *   BNF importer.
   * @param \Psr\Log\LoggerInterface $logger
   *   Logger.
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    ConfigFactoryInterface $configFactory,
    protected BnfImporter $importer,
    #[Autowire(service: 'logger.channel.bnf')]
    protected LoggerInterface $logger,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->baseUrl = $configFactory->get(SettingsForm::CONFIG_NAME)->get('base_url');
  }

  /**
   * {@inheritdoc}
   */
  #[\Override]
  public function processItem($data): void {
    try {
      $this->importer->importNode($data['uuid'], $this->baseUrl . 'graphql');
    }
    catch (\Throwable $e) {
      $this->logger->error('Could not import node from BNF. @message', ['@message' => $e->getMessage()]);
    }
  }

}
