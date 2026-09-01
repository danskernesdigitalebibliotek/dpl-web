<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf_client\Unit;

use Drupal\bnf_client\Collector\SyncQueueCollector;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueInterface;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\Tests\UnitTestCase;
use Prometheus\Storage\InMemory;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for the BNF sync queue collector.
 */
class SyncQueueCollectorTest extends UnitTestCase {

  /**
   * Both queues are reported, each under its own machine name.
   */
  public function testReportsTheDepthOfEachQueue(): void {
    $output = $this->render(['bnf_client_new_content' => 3, 'bnf_client_node_update' => 42]);

    $this->assertStringContainsString(
      'dpl_cms_bnf_sync_queue_depth{environment="main",project="dpl-cms-core",queue="bnf_client_new_content"} 3',
      $output,
    );
    $this->assertStringContainsString('queue="bnf_client_node_update"} 42', $output);
  }

  /**
   * An empty queue reports a zero rather than dropping out of the scrape.
   *
   * Empty is the state we expect to see most of the time, so it is the one
   * that must not be confused with a site that has stopped reporting.
   */
  public function testEmptyQueuesAreStillReported(): void {
    $output = $this->render(['bnf_client_new_content' => 0, 'bnf_client_node_update' => 0]);

    $this->assertSame(2, substr_count($output, 'dpl_cms_bnf_sync_queue_depth{'));
    $this->assertStringContainsString('queue="bnf_client_new_content"} 0', $output);
  }

  /**
   * Renders a registry holding only this collector.
   *
   * @param array<string, int> $depths
   *   Queue machine name mapped to the number of items in it.
   *
   * @return string
   *   The scrape body.
   */
  private function render(array $depths): string {
    $queueFactory = $this->prophesize(QueueFactory::class);

    foreach ($depths as $name => $depth) {
      $queue = $this->prophesize(QueueInterface::class);
      $queue->numberOfItems()->willReturn($depth);

      $queueFactory->get($name)->willReturn($queue->reveal());
    }

    $registry = new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      new InMemory(),
      [new SyncQueueCollector($queueFactory->reveal())],
      ['project' => 'dpl-cms-core', 'environment' => 'main'],
    );

    return $registry->render();
  }

}
