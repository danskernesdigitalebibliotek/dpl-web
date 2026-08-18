<?php

declare(strict_types=1);

namespace Drupal\dpl_metrics;

use Drupal\Core\Site\Settings;
use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\Adapter;
use Prometheus\Storage\InMemory;
use Prometheus\Storage\Redis;
use Psr\Log\LoggerInterface;

/**
 * Records application metrics and renders them in Prometheus text format.
 *
 * Counters live in a key-value store shared by every PHP worker, because a
 * counter held in process memory would be lost when the worker recycles and
 * would differ between pods. See the redis-metrics service in
 * docker-compose.yml for why that store is deliberately not the cache backend.
 *
 * Prometheus itself is the durable store here. This registry only needs to
 * hold values between scrapes, so losing it costs at most one scrape interval
 * of increments plus a counter reset, which rate() and increase() handle.
 */
class MetricsRegistry {

  /**
   * Prefix applied to every metric name, giving us e.g. dpl_cms_logins_total.
   */
  public const METRIC_NAMESPACE = 'dpl_cms';

  /**
   * The underlying PromPHP registry.
   */
  private CollectorRegistry $registry;

  /**
   * Whether a storage failure has already been logged this request.
   *
   * If the metrics store goes down, every single request would otherwise log,
   * which turns a monitoring outage into a logging outage. One line per
   * request is enough to notice.
   */
  private bool $failureLogged = FALSE;

  /**
   * Constructs a metrics registry.
   *
   * @param \Psr\Log\LoggerInterface $logger
   *   Logger for the dpl_metrics channel.
   * @param \Prometheus\Storage\Adapter $storage
   *   Where metric values are held between scrapes.
   * @param iterable<\Drupal\dpl_metrics\Collector\MetricCollectorInterface> $collectors
   *   Collectors run when the endpoint is scraped.
   * @param array<string, string> $defaultLabels
   *   Labels added to every metric this registry records.
   */
  public function __construct(
    private readonly LoggerInterface $logger,
    Adapter $storage,
    private readonly iterable $collectors = [],
    private readonly array $defaultLabels = [],
  ) {
    // FALSE suppresses PromPHP's built-in php_info metric. We would rather
    // decide explicitly what this endpoint exposes.
    $this->registry = new CollectorRegistry($storage, FALSE);
  }

  /**
   * Labels naming the site a metric came from.
   *
   * Applied to everything, so that metrics from 100+ library sites stay
   * distinguishable once they are in the same Prometheus. Within a single
   * site both values are constant, so this costs bytes in the scrape body
   * rather than extra time series.
   *
   * Prometheus can also attach labels like this by relabelling the scrape
   * target, which is the more conventional place for it. Doing it here
   * instead keeps a scrape self-describing: whoever reads the endpoint
   * directly sees which site answered, and the labels survive being copied
   * out of their scrape context.
   *
   * @return array<string, string>
   *   The project and environment Lagoon injected.
   */
  public static function siteLabels(): array {
    return [
      'project' => self::environment('LAGOON_PROJECT'),
      'environment' => self::environment('LAGOON_ENVIRONMENT'),
    ];
  }

  /**
   * Builds a registry backed by the store named in settings.
   *
   * Used as the service factory, keeping the constructor free of environment
   * lookups so that tests can inject their own storage.
   *
   * @param \Psr\Log\LoggerInterface $logger
   *   Logger for the dpl_metrics channel.
   * @param \Drupal\Core\Site\Settings $settings
   *   Site settings naming the metrics store.
   * @param iterable<\Drupal\dpl_metrics\Collector\MetricCollectorInterface> $collectors
   *   Collectors run when the endpoint is scraped.
   *
   * @return self
   *   The registry.
   */
  public static function fromSettings(LoggerInterface $logger, Settings $settings, iterable $collectors = []): self {
    return new self($logger, self::createStorage($settings), $collectors, self::siteLabels());
  }

  /**
   * Increments a counter.
   *
   * Counters only ever go up. Use one for things that happen: a reservation
   * was created, a login failed. For a value that can also go down, such as a
   * queue depth, use setGauge() instead.
   *
   * @param string $name
   *   Metric name without the namespace prefix. Prometheus convention is a
   *   plural noun ending in _total, e.g. 'reservations_total'.
   * @param string $help
   *   Human readable description, rendered into the scrape output.
   * @param array<string, string> $labels
   *   Label names mapped to their values, e.g. ['result' => 'success'].
   *   Never label by user, session or entity ID: every distinct combination
   *   of values becomes its own time series, and this codebase runs on 100+
   *   sites.
   * @param int $count
   *   How much to add. Defaults to a single occurrence.
   */
  public function incrementCounter(string $name, string $help, array $labels = [], int $count = 1): void {
    $this->record(function () use ($name, $help, $labels, $count): void {
      $labels = $this->resolveLabels($labels);

      $this->registry
        ->getOrRegisterCounter(self::METRIC_NAMESPACE, $name, $help, array_keys($labels))
        ->incBy($count, array_values($labels));
    });
  }

  /**
   * Sets a gauge to an absolute value.
   *
   * @param string $name
   *   Metric name without the namespace prefix.
   * @param string $help
   *   Human readable description, rendered into the scrape output.
   * @param float $value
   *   The current value.
   * @param array<string, string> $labels
   *   Label names mapped to their values. See incrementCounter().
   */
  public function setGauge(string $name, string $help, float $value, array $labels = []): void {
    $this->record(function () use ($name, $help, $value, $labels): void {
      $labels = $this->resolveLabels($labels);

      $this->registry
        ->getOrRegisterGauge(self::METRIC_NAMESPACE, $name, $help, array_keys($labels))
        ->set($value, array_values($labels));
    });
  }

  /**
   * Runs the collectors and renders everything in Prometheus text format.
   *
   * @return string
   *   The scrape body.
   *
   * @throws \Prometheus\Exception\StorageException
   *   When the metrics store cannot be read. Unlike a failed write this is
   *   not swallowed: a scrape that silently returns nothing looks to
   *   Prometheus like a site with no traffic.
   */
  public function render(): string {
    // Collectors write into a throwaway registry rather than the shared
    // store. Persisting a collected value would let it outlive whatever it
    // described: after a deploy the endpoint would report the old and the
    // new version side by side, each claiming to be current.
    $collected = new self($this->logger, new InMemory(), [], $this->defaultLabels);

    foreach ($this->collectors as $collector) {
      $this->record(static fn () => $collector->collect($collected));
    }

    return (new RenderTextFormat())->render(array_merge(
      $this->registry->getMetricFamilySamples(),
      $collected->registry->getMetricFamilySamples(),
    ));
  }

  /**
   * Merges in the default labels and puts them in a stable order.
   *
   * @param array<string, string> $labels
   *   Labels the caller supplied.
   *
   * @return array<string, string>
   *   The labels to record against.
   */
  private function resolveLabels(array $labels): array {
    // Union rather than array_merge, so an explicit label wins over a default
    // of the same name instead of being silently replaced.
    $labels += $this->defaultLabels;

    // Sort so that callers passing the same labels in a different order still
    // address the same series. PromPHP registers a metric against the label
    // names it first saw and rejects a later mismatch.
    ksort($labels);

    return $labels;
  }

  /**
   * Reads an environment variable, falling back to a placeholder.
   *
   * A label that is present but visibly wrong beats a missing one: it can be
   * alerted on, whereas a label that disappears silently changes the identity
   * of every series it was part of.
   *
   * @param string $name
   *   The variable name.
   *
   * @return string
   *   Its value, or 'unknown' when unset or empty.
   */
  private static function environment(string $name): string {
    $value = getenv($name);

    return is_string($value) && $value !== '' ? $value : 'unknown';
  }

  /**
   * Runs a write, absorbing any failure.
   *
   * Metrics are diagnostics. A library site must not return an error to a
   * patron because the monitoring store is unreachable or full.
   *
   * @param callable(): void $write
   *   The write to attempt.
   */
  private function record(callable $write): void {
    try {
      $write();
    }
    catch (\Throwable $e) {
      if (!$this->failureLogged) {
        $this->failureLogged = TRUE;
        $this->logger->warning('Unable to record metric: @message', [
          '@message' => $e->getMessage(),
        ]);
      }
    }
  }

  /**
   * Builds the storage adapter.
   *
   * @param \Drupal\Core\Site\Settings $settings
   *   Site settings naming the metrics store.
   *
   * @return \Prometheus\Storage\Adapter
   *   A Redis adapter when a metrics store is configured, otherwise in-memory
   *   storage so that the module stays harmless in environments without one.
   */
  private static function createStorage(Settings $settings): Adapter {
    $host = $settings->get('dpl_metrics.redis_host');

    // In-memory storage is per-process, so counters never accumulate and the
    // endpoint reports close to nothing. That is the right failure mode: the
    // site keeps working and the gap is obvious in Grafana, rather than the
    // module refusing to install where the service has not been rolled out.
    if (!is_string($host) || $host === '' || !extension_loaded('redis')) {
      return new InMemory();
    }

    // The adapter connects lazily, so an unreachable store surfaces on the
    // first read or write rather than while the container is being built.
    return new Redis([
      'host' => $host,
      'port' => (int) ($settings->get('dpl_metrics.redis_port') ?: 6379),
      // Deliberately short. A patron's page load must not wait on monitoring.
      'timeout' => 0.1,
      'read_timeout' => 1.0,
      'persistent_connections' => FALSE,
    ]);
  }

}
