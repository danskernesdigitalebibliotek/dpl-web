<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_metrics\Unit;

use Drupal\dpl_metrics\Collector\MetricCollectorInterface;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\Tests\UnitTestCase;
use Prometheus\Exception\StorageException;
use Prometheus\Storage\Adapter;
use Prometheus\Storage\InMemory;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for the metrics registry.
 */
class MetricsRegistryTest extends UnitTestCase {

  /**
   * Counters accumulate and render with the namespace prefix applied.
   */
  public function testCounterAccumulates(): void {
    $registry = new MetricsRegistry($this->prophesize(LoggerInterface::class)->reveal(), new InMemory());

    $registry->incrementCounter('logins_total', 'Logins.', ['result' => 'success']);
    $registry->incrementCounter('logins_total', 'Logins.', ['result' => 'success']);
    $registry->incrementCounter('logins_total', 'Logins.', ['result' => 'failure']);

    $output = $registry->render();

    $this->assertStringContainsString('dpl_cms_logins_total{result="success"} 2', $output);
    $this->assertStringContainsString('dpl_cms_logins_total{result="failure"} 1', $output);
  }

  /**
   * Gauges report the last value written rather than a sum.
   */
  public function testGaugeReportsLastValue(): void {
    $registry = new MetricsRegistry($this->prophesize(LoggerInterface::class)->reveal(), new InMemory());

    $registry->setGauge('queue_depth', 'Items awaiting processing.', 12.0);
    $registry->setGauge('queue_depth', 'Items awaiting processing.', 7.0);

    $this->assertStringContainsString('dpl_cms_queue_depth 7', $registry->render());
  }

  /**
   * Callers may pass the same labels in any order and hit the same series.
   *
   * Without normalisation the second call would register the metric against a
   * different label ordering and land in a series of its own.
   */
  public function testLabelOrderDoesNotSplitSeries(): void {
    $registry = new MetricsRegistry($this->prophesize(LoggerInterface::class)->reveal(), new InMemory());

    $registry->incrementCounter('events_total', 'Events.', ['source' => 'fbs', 'result' => 'ok']);
    $registry->incrementCounter('events_total', 'Events.', ['result' => 'ok', 'source' => 'fbs']);

    $output = $registry->render();

    $this->assertStringContainsString('dpl_cms_events_total{result="ok",source="fbs"} 2', $output);
    $this->assertSame(1, substr_count($output, 'dpl_cms_events_total{'));
  }

  /**
   * Default labels land on every metric, counters and gauges alike.
   *
   * Without this, metrics from 100+ sites would be indistinguishable once
   * they share a Prometheus.
   */
  public function testDefaultLabelsApplyToEveryMetric(): void {
    $registry = $this->registryWithDefaults(['project' => 'dpl-cms-core', 'environment' => 'main']);

    $registry->incrementCounter('logins_total', 'Logins.');
    $registry->setGauge('queue_depth', 'Queue.', 3.0);

    $output = $registry->render();

    $this->assertStringContainsString('dpl_cms_logins_total{environment="main",project="dpl-cms-core"} 1', $output);
    $this->assertStringContainsString('dpl_cms_queue_depth{environment="main",project="dpl-cms-core"} 3', $output);
  }

  /**
   * Default labels combine with the caller's rather than displacing them.
   */
  public function testDefaultLabelsCombineWithCallerLabels(): void {
    $registry = $this->registryWithDefaults(['project' => 'dpl-cms-core', 'environment' => 'main']);

    $registry->incrementCounter('logins_total', 'Logins.', ['result' => 'success']);

    $this->assertStringContainsString(
      'dpl_cms_logins_total{environment="main",project="dpl-cms-core",result="success"} 1',
      $registry->render(),
    );
  }

  /**
   * An explicit label wins over a default of the same name.
   *
   * Silently overwriting what a caller passed would be the more surprising
   * behaviour, and would discard data rather than a placeholder.
   */
  public function testCallerLabelOverridesDefault(): void {
    $registry = $this->registryWithDefaults(['project' => 'dpl-cms-core', 'environment' => 'main']);

    $registry->incrementCounter('logins_total', 'Logins.', ['project' => 'other']);

    $this->assertStringContainsString('project="other"', $registry->render());
  }

  /**
   * Site labels fall back to a placeholder outside Lagoon.
   */
  public function testSiteLabelsFallBackWhenUnset(): void {
    putenv('LAGOON_PROJECT');
    putenv('LAGOON_ENVIRONMENT');

    $this->assertSame(
      ['project' => 'unknown', 'environment' => 'unknown'],
      MetricsRegistry::siteLabels(),
    );
  }

  /**
   * Site labels are read from the environment Lagoon injects.
   */
  public function testSiteLabelsComeFromTheEnvironment(): void {
    putenv('LAGOON_PROJECT=dpl-cms-core');
    putenv('LAGOON_ENVIRONMENT=main');

    try {
      $this->assertSame(
        ['project' => 'dpl-cms-core', 'environment' => 'main'],
        MetricsRegistry::siteLabels(),
      );
    }
    finally {
      putenv('LAGOON_PROJECT');
      putenv('LAGOON_ENVIRONMENT');
    }
  }

  /**
   * Builds a registry carrying the given default labels.
   *
   * @param array<string, string> $defaults
   *   The default labels.
   *
   * @return \Drupal\dpl_metrics\MetricsRegistry
   *   The registry.
   */
  private function registryWithDefaults(array $defaults): MetricsRegistry {
    return new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      new InMemory(),
      [],
      $defaults,
    );
  }

  /**
   * A write against an unreachable store must not surface to the caller.
   *
   * This is the property that matters most on a platform serving 100+ public
   * sites: monitoring being down cannot be allowed to break a patron's page.
   */
  public function testWriteFailureIsSwallowed(): void {
    $storage = $this->prophesize(Adapter::class);
    $storage->updateCounter(Argument::cetera())
      ->willThrow(new StorageException('Connection refused.'));

    $logger = $this->prophesize(LoggerInterface::class);
    $logger->warning(Argument::cetera())->shouldBeCalledTimes(1);

    $registry = new MetricsRegistry($logger->reveal(), $storage->reveal());

    $registry->incrementCounter('logins_total', 'Logins.');
    $registry->incrementCounter('logins_total', 'Logins.');
  }

  /**
   * Collected values are recomputed per scrape rather than persisted.
   *
   * This is what stops a deploy from leaving the previous version behind as a
   * second, equally current-looking series in the shared store.
   */
  public function testCollectedValuesDoNotPersist(): void {
    $storage = new InMemory();
    $version = 'first';

    $collector = new class($version) implements MetricCollectorInterface {

      /**
       * Constructs the collector.
       *
       * @param string $version
       *   Version to report, by reference so the test can change it.
       */
      public function __construct(public string &$version) {}

      /**
       * {@inheritdoc}
       */
      public function collect(MetricsRegistry $registry): void {
        $registry->setGauge('deployment_info', 'Build.', 1, ['version' => $this->version]);
      }

    };

    $registry = new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      $storage,
      [$collector],
    );

    $registry->render();
    $version = 'second';
    $output = $registry->render();

    $this->assertStringContainsString('version="second"', $output);
    $this->assertStringNotContainsString('version="first"', $output);
  }

  /**
   * A failing collector degrades the scrape instead of failing it.
   */
  public function testFailingCollectorDoesNotBreakTheScrape(): void {
    $collector = new class implements MetricCollectorInterface {

      /**
       * {@inheritdoc}
       */
      public function collect(MetricsRegistry $registry): void {
        throw new \RuntimeException('Nope.');
      }

    };

    $logger = $this->prophesize(LoggerInterface::class);
    $logger->warning(Argument::cetera())->shouldBeCalledTimes(1);

    $registry = new MetricsRegistry($logger->reveal(), new InMemory(), [$collector]);
    $registry->incrementCounter('logins_total', 'Logins.');

    $this->assertStringContainsString('dpl_cms_logins_total 1', $registry->render());
  }

  /**
   * A read failure propagates, so that the scrape fails instead of lying.
   *
   * Returning an empty body would make Prometheus record a site with no
   * traffic, which is indistinguishable from a genuine drop to zero.
   */
  public function testReadFailurePropagates(): void {
    $storage = $this->prophesize(Adapter::class);
    $storage->collect(Argument::cetera())
      ->willThrow(new StorageException('Connection refused.'));

    $registry = new MetricsRegistry($this->prophesize(LoggerInterface::class)->reveal(), $storage->reveal());

    $this->expectException(StorageException::class);
    $registry->render();
  }

}
