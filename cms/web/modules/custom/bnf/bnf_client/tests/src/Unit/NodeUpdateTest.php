<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf_client\Unit;

use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Form\SettingsForm;
use Drupal\bnf_client\Plugin\QueueWorker\NodeUpdate;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\node\NodeInterface;
use Drupal\Tests\UnitTestCase;
use Prometheus\Storage\InMemory;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for the metrics the node update queue worker reports.
 */
class NodeUpdateTest extends UnitTestCase {

  /**
   * The BNF site the worker is configured against.
   */
  private const BASE_URL = 'https://bnf.example/';

  /**
   * The node the queue item asks for.
   */
  private const UUID = 'e9b1ac7d-3f1c-4a2b-9d0e-11d0b0b3a001';

  /**
   * The metrics registry the worker writes to.
   */
  private MetricsRegistry $registry;

  /**
   * The importer standing in for delingstjenesten.dk.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf\Services\BnfImporter>
   */
  private ObjectProphecy $importer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->registry = new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      new InMemory(),
      [],
      ['project' => 'dpl-cms-core', 'environment' => 'main'],
    );

    $this->importer = $this->prophesize(BnfImporter::class);
  }

  /**
   * A node that was created or updated counts as synchronised.
   */
  public function testImportedNodeIsCounted(): void {
    $this->importer->importNode(self::UUID, self::BASE_URL . 'graphql')->willReturn($this->node());

    $this->process();

    $this->assertStringContainsString('dpl_cms_bnf_sync_nodes_total{environment="main",project="dpl-cms-core",result="imported"} 1', $this->render());
  }

  /**
   * A node the importer found nothing to do for counts as skipped.
   *
   * The queue is refilled with every imported node once an hour, so this is
   * the ordinary outcome. Counting it as an import would make the sync look
   * many times busier than it is.
   */
  public function testSkippedNodeIsCounted(): void {
    $this->importer->importNode(self::UUID, self::BASE_URL . 'graphql')->willReturn(NULL);

    $this->process();

    $this->assertStringContainsString('result="skipped"} 1', $this->render());
    $this->assertStringNotContainsString('result="imported"', $this->render());
  }

  /**
   * An import that threw counts as a failure rather than going unnoticed.
   */
  public function testFailedImportIsCounted(): void {
    $this->importer->importNode(self::UUID, self::BASE_URL . 'graphql')
      ->willThrow(new \RuntimeException('delingstjenesten.dk is down'));

    $this->process();

    $this->assertStringContainsString('result="failed"} 1', $this->render());
  }

  /**
   * A failing import is still logged, alongside being counted.
   *
   * The count says how often it happens; the log line is where the reason is.
   */
  public function testFailedImportIsLogged(): void {
    $this->importer->importNode(self::UUID, self::BASE_URL . 'graphql')
      ->willThrow(new \RuntimeException('delingstjenesten.dk is down'));

    $logger = $this->prophesize(LoggerInterface::class);
    $logger->error(Argument::containingString('Could not import node'), Argument::any())->shouldBeCalled();

    $this->process($logger);
  }

  /**
   * Runs the worker over a queue item naming the test node.
   *
   * @param \Prophecy\Prophecy\ObjectProphecy<\Psr\Log\LoggerInterface>|null $logger
   *   The logger to hand the worker, when the test cares what it is told.
   */
  private function process(?ObjectProphecy $logger = NULL): void {
    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('base_url')->willReturn(self::BASE_URL);

    $configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $configFactory->get(SettingsForm::CONFIG_NAME)->willReturn($config->reveal());

    $worker = new NodeUpdate(
      [],
      'bnf_client_node_update',
      [],
      $configFactory->reveal(),
      $this->importer->reveal(),
      ($logger ?? $this->prophesize(LoggerInterface::class))->reveal(),
      $this->registry,
    );

    $worker->processItem(['uuid' => self::UUID]);
  }

  /**
   * Builds a node that accepts being saved and carries none of our fields.
   *
   * @return \Drupal\node\NodeInterface
   *   The double.
   */
  private function node(): NodeInterface {
    $node = $this->prophesize(NodeInterface::class);
    $node->hasField(Argument::any())->willReturn(FALSE);
    // SAVED_UPDATED, spelled out because core defines it in common.inc, which
    // unit tests do not load. The worker ignores the value either way.
    $node->save()->willReturn(2);

    return $node->reveal();
  }

  /**
   * Renders what the worker recorded.
   *
   * @return string
   *   The scrape body.
   */
  private function render(): string {
    return $this->registry->render();
  }

}
