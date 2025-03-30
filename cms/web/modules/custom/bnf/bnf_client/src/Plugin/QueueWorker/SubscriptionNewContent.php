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
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueInterface;
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
   * Node update queue.
   */
  protected QueueInterface $nodeQueue;

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
   * @param \Drupal\Core\Queue\QueueFactory $queueFactory
   *   Queue factory.
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    ConfigFactoryInterface $configFactory,
    protected BnfImporter $importer,
    QueueFactory $queueFactory,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->storage = $entityTypeManager->getStorage('bnf_subscription');
    $this->baseUrl = $configFactory->get(SettingsForm::CONFIG_NAME)->get('base_url');

    $this->nodeQueue = $queueFactory->get('bnf_client_node_update');
  }

  /**
   * {@inheritdoc}
   */
  #[\Override]
  public function processItem($data): void {
    /** @var ?\Drupal\bnf_client\Entity\Subscription $subscription */
    $subscription = $this->storage->load($data['id']);

    if (!$subscription) {
      // Subscription deleted. Carry on.
      return;
    }

    $newContent = $this->importer->newContent(
      $subscription->getSubscriptionUuid(),
      $subscription->getLast(),
      $this->baseUrl . 'graphql'
    );

    foreach ($newContent['uuids'] as $uuid) {
      $this->nodeQueue->createItem([
        'uuid' => $uuid,
        'categories' => $subscription->getCategories(),
        'tags' => $subscription->getTags(),
      ]);
    }

    if ($subscription->getLast() !== $newContent['youngest']) {
      $subscription->noCheck = TRUE;
      $subscription->setLast($newContent['youngest']);
      $subscription->save();
    }
  }

}
