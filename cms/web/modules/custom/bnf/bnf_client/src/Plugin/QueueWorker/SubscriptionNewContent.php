<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Plugin\QueueWorker;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Form\SettingsForm;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;

/**
 * Check for new content on subscription and queue fetching.
 *
 * @QueueWorker(
 *   id = "bnf_client_new_content",
 *   title = @Translation("Check for new subscription content."),
 *   cron = {"time" = 60}
 * )
 */
class SubscriptionNewContent extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * The BNF site base URL.
   */
  protected string $baseUrl;

  /**
   * Subscription storage.
   */
  protected EntityStorageInterface $storage;

  /**
   * Constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $pluginId
   *   The plugin ID for the plugin instance.
   * @param mixed $pluginDefinition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity manager.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Config factory.
   * @param \Drupal\bnf\Services\BnfImporter $importer
   *   BNF importer.
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    ConfigFactoryInterface $configFactory,
    protected BnfImporter $importer,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->storage = $entityTypeManager->getStorage('bnf_subscription');
    $this->baseUrl = $configFactory->get(SettingsForm::CONFIG_NAME)->get('base_url');
  }

  /**
   * {@inheritdoc}
   */
  #[\Override]
  public function processItem($data): void {
    /** @var ?\Drupal\bnf_client\Entity\Subscription $subscription */
    $subscription = $this->storage->load($data['uuid']);

    if (!$subscription) {
      // Subscription deleted. Carry on.
      return;
    }

    $newContent = $this->importer->newContent($subscription->getSubscriptionUuid(), 0, $this->baseUrl . 'graphql');
    foreach ($newContent['uuids'] as $uuid) {
      // @todo queue job to update node.
    }

    if ($subscription->getLast() !== $newContent['youngest']) {
      $subscription->noCheck = TRUE;
      $subscription->setLast($newContent['youngest']);
      $subscription->save();
    }
  }

}
