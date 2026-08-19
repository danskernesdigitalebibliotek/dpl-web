<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Plugin\QueueWorker;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Form\SettingsForm;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\node\NodeInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Update (or create) node content.
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
   * @param \Drupal\dpl_metrics\MetricsRegistry $metrics
   *   Records how the synchronisation of each node turned out.
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    ConfigFactoryInterface $configFactory,
    protected BnfImporter $importer,
    #[Autowire(service: 'logger.channel.bnf')]
    protected LoggerInterface $logger,
    protected MetricsRegistry $metrics,
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
      $node = $this->importer->importNode($data['uuid'], $this->baseUrl . 'graphql');

      if (!($node instanceof NodeInterface)) {
        $this->countOutcome('skipped');

        return;
      }

      // Link the subscription to the node, for when we handle deleting of the
      // subscription in the future.
      if ($node->hasField('bnf_source_subscriptions')) {
        $subscriptionIds = $node->get('bnf_source_subscriptions')->getValue();
        $subscriptionIds = array_column($subscriptionIds, 'target_id');

        if (!empty($data['subscription_id'])) {
          $subscriptionIds[] = $data['subscription_id'];
        }

        // If for whatever reason a node is updated, we don't want to add
        // the same subscription ID several times.
        $subscriptionIds = array_unique($subscriptionIds);

        $node->set('bnf_source_subscriptions', $subscriptionIds);
      }

      if ($node->hasField('field_categories') && !empty($data['categories'])) {
        $category_values = array_map(function ($term) {
          return ['target_id' => $term->id()];
        }, $data['categories']);

        $node->set('field_categories', $category_values);
      }

      if ($node->hasField('field_tags') && !empty($data['tags'])) {
        $tag_values = array_map(function ($term) {
          return ['target_id' => $term->id()];
        }, $data['tags']);

        $node->set('field_tags', $tag_values);
      }

      $node->save();

      $this->countOutcome('imported');
    }
    catch (\Throwable $e) {
      $this->countOutcome('failed');

      $this->logger->error('Could not import node from BNF. @message', ['@message' => $e->getMessage()]);
    }
  }

  /**
   * Records how synchronising one node turned out.
   *
   * Every node we still keep updated is re-queued once an hour, so most
   * items legitimately end up doing nothing. Hence one counter with an
   * outcome label rather than three metrics: 'imported' on its own is the
   * number of nodes actually synchronised, and held against the sum of all
   * three it is the share of the work that was worth doing.
   *
   * @param 'imported'|'skipped'|'failed' $outcome
   *   What the importer did with the node:
   *   - 'imported': it was created or updated.
   *   - 'skipped': the importer returned no node, either because there was
   *     nothing to do (the source is unchanged since last time, the editor
   *     has claimed the node locally, or it is unpublished upstream and
   *     unknown here) or because it links to content we cannot import. The
   *     importer logs which.
   *   - 'failed': the import threw, which the log line beside this call
   *     describes.
   */
  private function countOutcome(string $outcome): void {
    $this->metrics->incrementCounter(
      'bnf_sync_nodes_total',
      'Nodes handled by the BNF synchronisation queue, by outcome.',
      ['result' => $outcome],
    );
  }

}
