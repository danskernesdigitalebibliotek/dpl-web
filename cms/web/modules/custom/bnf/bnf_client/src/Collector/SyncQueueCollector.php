<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Collector;

use Drupal\Core\Queue\QueueFactory;
use Drupal\dpl_metrics\Collector\MetricCollectorInterface;
use Drupal\dpl_metrics\MetricsRegistry;

/**
 * Reports how much work the BNF synchronisation has waiting.
 *
 * Synchronisation is queue driven: an hourly job fills the queues, and cron
 * drains them a minute at a time. Nothing in that arrangement notices if the
 * refilling outpaces the draining - the queues simply grow, and content keeps
 * arriving, only ever later than it should. A depth that climbs across scrapes
 * is what that looks like from the outside, and it is the earliest sign that
 * the site needs more cron time rather than less content.
 *
 * Reported per queue rather than as one total, because the two fail for
 * different reasons and the split says which end is stuck: work piling up in
 * bnf_client_new_content means we are not getting around to asking
 * delingstjenesten.dk what is new, while a pile in bnf_client_node_update
 * means we have asked, and cannot keep up with importing the answers.
 *
 * Derivable from current state and therefore a collector: the depth is
 * whatever the queue says it is at scrape time, so there is nothing to count
 * as it happens.
 *
 * @see \Drupal\bnf_client\Plugin\QueueWorker\SubscriptionNewContent
 * @see \Drupal\bnf_client\Plugin\QueueWorker\NodeUpdate
 */
class SyncQueueCollector implements MetricCollectorInterface {

  /**
   * The synchronisation queues, in the order work flows through them.
   *
   * Labelled by their machine name rather than something friendlier, so that
   * a depth seen in Grafana names the queue to pass to `drush queue:run`.
   */
  private const QUEUES = [
    'bnf_client_new_content',
    'bnf_client_node_update',
  ];

  /**
   * Constructs a sync queue collector.
   *
   * @param \Drupal\Core\Queue\QueueFactory $queueFactory
   *   Used to read the depth of the synchronisation queues.
   */
  public function __construct(
    private readonly QueueFactory $queueFactory,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public function collect(MetricsRegistry $registry): void {
    foreach (self::QUEUES as $queue) {
      // Reported even when empty. An idle queue and a queue nobody is
      // reporting on look identical if the series only appears once there is
      // something in it, and idle is the state we expect to see most of the
      // time - so it has to be the one that is visibly there.
      $registry->setGauge(
        'bnf_sync_queue_depth',
        'Items waiting in a BNF synchronisation queue.',
        $this->queueFactory->get($queue)->numberOfItems(),
        ['queue' => $queue],
      );
    }
  }

}
