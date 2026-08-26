<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf_client\Unit;

use Drupal\bnf_client\Collector\SubscriptionCollector;
use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\Tests\UnitTestCase;
use Prometheus\Storage\InMemory;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for the BNF subscription collector.
 */
class SubscriptionCollectorTest extends UnitTestCase {

  /**
   * A stream UUID, of the shape delingstjenesten.dk hands out.
   */
  private const STREAM = 'e9b1ac7d-3f1c-4a2b-9d0e-11d0b0b3a001';

  /**
   * A second, unrelated stream.
   */
  private const OTHER_STREAM = 'e9b1ac7d-3f1c-4a2b-9d0e-11d0b0b3a002';

  /**
   * Every subscribed stream gets a series, named and labelled with the site.
   */
  public function testReportsEachStream(): void {
    $output = $this->render([
      $this->subscription(self::STREAM, 'Sommerlæsning'),
      $this->subscription(self::OTHER_STREAM, 'Krimi'),
    ]);

    $this->assertStringContainsString(
      'dpl_cms_bnf_subscription_info{environment="main",name="Sommerlæsning",project="dpl-cms-core",stream="' . self::STREAM . '"} 1',
      $output,
    );
    $this->assertStringContainsString('name="Krimi",project="dpl-cms-core",stream="' . self::OTHER_STREAM . '"} 1', $output);
  }

  /**
   * The number of subscriptions is reported alongside the streams.
   */
  public function testReportsTheNumberOfSubscriptions(): void {
    $output = $this->render([
      $this->subscription(self::STREAM, 'Sommerlæsning'),
      $this->subscription(self::OTHER_STREAM, 'Krimi'),
    ]);

    $this->assertStringContainsString(
      'dpl_cms_bnf_subscriptions{environment="main",project="dpl-cms-core"} 2',
      $output,
    );
  }

  /**
   * A site subscribing to nothing still reports, as a zero.
   *
   * Omitting the metric would make it indistinguishable from a site that has
   * stopped reporting, which is the one thing the total is there to rule out.
   */
  public function testSiteWithoutSubscriptionsReportsZero(): void {
    $output = $this->render([]);

    $this->assertStringContainsString('dpl_cms_bnf_subscriptions{environment="main",project="dpl-cms-core"} 0', $output);
    $this->assertStringNotContainsString('dpl_cms_bnf_subscription_info{', $output);
  }

  /**
   * Two subscriptions to one stream count as one.
   *
   * The UI steers editors towards editing the existing subscription, but
   * nothing enforces it. Counting such a site twice would overstate how many
   * sites take the stream, which is the whole point of the metric.
   */
  public function testDuplicateSubscriptionsCountOnce(): void {
    $output = $this->render([
      $this->subscription(self::STREAM, 'Sommerlæsning'),
      $this->subscription(self::STREAM, 'Sommer'),
    ]);

    $this->assertSame(1, substr_count($output, 'dpl_cms_bnf_subscription_info{'));
    $this->assertStringContainsString('dpl_cms_bnf_subscriptions{environment="main",project="dpl-cms-core"} 1', $output);
  }

  /**
   * A subscription without a name is still reported.
   */
  public function testUnnamedSubscriptionIsReportedAsUnknown(): void {
    $output = $this->render([$this->subscription(self::STREAM, NULL)]);

    $this->assertStringContainsString('name="unknown"', $output);
  }

  /**
   * A subscription naming no stream is skipped rather than reported empty.
   */
  public function testSubscriptionWithoutStreamIsSkipped(): void {
    $output = $this->render([$this->subscription('', 'Broken')]);

    $this->assertStringNotContainsString('dpl_cms_bnf_subscription_info{', $output);
    $this->assertStringContainsString('dpl_cms_bnf_subscriptions{environment="main",project="dpl-cms-core"} 0', $output);
  }

  /**
   * Renders a registry holding only this collector.
   *
   * @param \Drupal\bnf_client\Entity\Subscription[] $subscriptions
   *   The subscriptions the site has.
   *
   * @return string
   *   The scrape body.
   */
  private function render(array $subscriptions): string {
    $storage = $this->prophesize(EntityStorageInterface::class);
    $storage->loadMultiple()->willReturn($subscriptions);

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('bnf_subscription')->willReturn($storage->reveal());

    $registry = new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      new InMemory(),
      [new SubscriptionCollector($entityTypeManager->reveal())],
      ['project' => 'dpl-cms-core', 'environment' => 'main'],
    );

    return $registry->render();
  }

  /**
   * Builds a subscription reporting the given stream and name.
   *
   * @param string $uuid
   *   The UUID of the stream subscribed to.
   * @param string|null $name
   *   The local name of the subscription.
   *
   * @return \Drupal\bnf_client\Entity\Subscription
   *   The double.
   */
  private function subscription(string $uuid, ?string $name): Subscription {
    $subscription = $this->prophesize(Subscription::class);
    $subscription->getSubscriptionUuid()->willReturn($uuid);
    $subscription->label()->willReturn($name);

    return $subscription->reveal();
  }

}
