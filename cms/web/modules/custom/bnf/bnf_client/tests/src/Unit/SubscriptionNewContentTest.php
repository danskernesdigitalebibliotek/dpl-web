<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf_client\Unit;

use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Entity\Subscription;
use Drupal\bnf_client\Form\SettingsForm;
use Drupal\bnf_client\Plugin\QueueWorker\SubscriptionNewContent;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueInterface;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\Tests\UnitTestCase;
use Prometheus\Storage\InMemory;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for the metrics the subscription check queue worker reports.
 */
class SubscriptionNewContentTest extends UnitTestCase {

  /**
   * The BNF site the worker is configured against.
   */
  private const BASE_URL = 'https://bnf.example/';

  /**
   * The stream the subscription follows.
   */
  private const STREAM = 'e9b1ac7d-3f1c-4a2b-9d0e-11d0b0b3a001';

  /**
   * When the subscription last saw something new.
   */
  private const LAST = 1700000000;

  /**
   * The metrics registry the worker writes to.
   */
  private MetricsRegistry $registry;

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
  }

  /**
   * A check that reached delingstjenesten.dk counts as a success.
   */
  public function testSuccessfulCheckIsCounted(): void {
    $this->process(['uuids' => [], 'youngest' => self::LAST, 'success' => TRUE]);

    $this->assertStringContainsString(
      'dpl_cms_bnf_sync_subscription_checks_total{environment="main",project="dpl-cms-core",result="success"} 1',
      $this->registry->render(),
    );
  }

  /**
   * A check that did not counts as a failure.
   *
   * The importer answers "nothing new" whether the stream was quiet or the
   * request failed, so without this the two are the same from the outside.
   */
  public function testFailedCheckIsCounted(): void {
    $this->process(['uuids' => [], 'youngest' => self::LAST, 'success' => FALSE]);

    $this->assertStringContainsString('result="failure"} 1', $this->registry->render());
    $this->assertStringNotContainsString('result="success"', $this->registry->render());
  }

  /**
   * A subscription deleted before its check ran is not counted either way.
   *
   * Nothing was asked of delingstjenesten.dk, so counting it would move a
   * metric that only means whether we can reach them.
   */
  public function testDeletedSubscriptionIsNotCounted(): void {
    $this->process(NULL, NULL);

    $this->assertStringNotContainsString('dpl_cms_bnf_sync_subscription_checks_total', $this->registry->render());
  }

  /**
   * Runs the worker over a queue item naming the test subscription.
   *
   * @param array{'uuids': string[], 'youngest': int, 'success': bool}|null $newContent
   *   What the importer answers, or NULL when it is never asked.
   * @param \Drupal\bnf_client\Entity\Subscription|false|null $subscription
   *   The subscription the storage holds. Defaults to a live one; pass NULL
   *   for a subscription deleted since it was queued.
   */
  private function process(?array $newContent, Subscription|false|null $subscription = FALSE): void {
    $subscription = $subscription === FALSE ? $this->subscription() : $subscription;

    $storage = $this->prophesize(EntityStorageInterface::class);
    $storage->load('1')->willReturn($subscription);

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('bnf_subscription')->willReturn($storage->reveal());

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('base_url')->willReturn(self::BASE_URL);

    $configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $configFactory->get(SettingsForm::CONFIG_NAME)->willReturn($config->reveal());

    $importer = $this->prophesize(BnfImporter::class);
    $importer->newContent(self::STREAM, self::LAST, self::BASE_URL . 'graphql')->willReturn($newContent);

    $queueFactory = $this->prophesize(QueueFactory::class);
    $queueFactory->get('bnf_client_node_update')
      ->willReturn($this->prophesize(QueueInterface::class)->reveal());

    $worker = new SubscriptionNewContent(
      [],
      'bnf_client_new_content',
      [],
      $entityTypeManager->reveal(),
      $configFactory->reveal(),
      $importer->reveal(),
      $queueFactory->reveal(),
      $this->registry,
    );

    $worker->processItem(['id' => '1']);
  }

  /**
   * Builds a subscription that has seen content before.
   *
   * @return \Drupal\bnf_client\Entity\Subscription
   *   The double.
   */
  private function subscription(): Subscription {
    $subscription = $this->prophesize(Subscription::class);
    $subscription->id()->willReturn('1');
    $subscription->getSubscriptionUuid()->willReturn(self::STREAM);
    // Answering with the timestamp the check comes back with, so that the
    // worker has no reason to save - saving is not what these tests are about.
    $subscription->getLast()->willReturn(self::LAST);

    return $subscription->reveal();
  }

}
