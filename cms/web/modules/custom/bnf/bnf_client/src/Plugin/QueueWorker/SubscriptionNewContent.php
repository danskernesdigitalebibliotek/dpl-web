<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Plugin\QueueWorker;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Form\SettingsForm;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\dpl_metrics\MetricsRegistry;

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
   * @param \Drupal\dpl_metrics\MetricsRegistry $metrics
   *   Records whether we managed to reach delingstjenesten.dk.
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
    ConfigFactoryInterface $configFactory,
    protected BnfImporter $importer,
    QueueFactory $queueFactory,
    protected MetricsRegistry $metrics,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->baseUrl = $configFactory->get(SettingsForm::CONFIG_NAME)->get('base_url');

    $this->nodeQueue = $queueFactory->get('bnf_client_node_update');
  }

  /**
   * {@inheritdoc}
   */
  #[\Override]
  public function processItem($data): void {
    /** @var ?\Drupal\bnf_client\Entity\Subscription $subscription */
    $subscription = $this->entityTypeManager->getStorage('bnf_subscription')->load($data['id']);

    if (!$subscription) {
      // Subscription deleted. Carry on.
      //
      // Deliberately not counted: nothing was asked of delingstjenesten.dk,
      // so counting this either way would move a metric that is there to say
      // whether we can reach them.
      return;
    }

    $newContent = $this->importer->newContent(
      $subscription->getSubscriptionUuid(),
      $subscription->getLast(),
      $this->baseUrl . 'graphql'
    );

    // A failed check is otherwise invisible from the outside: the importer
    // answers "nothing new" either way, so a site cut off from
    // delingstjenesten.dk goes on looking exactly like one whose streams have
    // been quiet. Only this tells the two apart, and until content is
    // conspicuously missing it is the only thing that will.
    $this->metrics->incrementCounter(
      'bnf_sync_subscription_checks_total',
      'Checks for new subscription content on delingstjenesten.dk, by outcome.',
      ['result' => $newContent['success'] ? 'success' : 'failure'],
    );

    foreach ($newContent['uuids'] as $uuid) {
      $this->nodeQueue->createItem([
        'uuid' => $uuid,
        'subscription_id' => $subscription->id(),
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
