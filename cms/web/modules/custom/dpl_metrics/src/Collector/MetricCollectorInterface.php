<?php

declare(strict_types=1);

namespace Drupal\dpl_metrics\Collector;

use Drupal\dpl_metrics\MetricsRegistry;

/**
 * Supplies metrics that are computed while the endpoint is being scraped.
 *
 * Use a collector for anything derivable from current state: a version
 * string, a queue depth, a row count. Values a collector writes are held only
 * for the duration of the scrape and never reach the shared store, so they
 * cannot go stale and cost nothing on ordinary requests.
 *
 * Events that leave no durable trace - a reservation was created, a login
 * failed - are the opposite case. Those must be counted as they happen, by
 * calling MetricsRegistry::incrementCounter() from wherever they occur.
 *
 * Register an implementation by tagging its service 'dpl_metrics_collector'.
 */
interface MetricCollectorInterface {

  /**
   * Writes this collector's metrics.
   *
   * A collector that throws is logged and skipped, so a broken one degrades
   * the scrape rather than failing it.
   *
   * @param \Drupal\dpl_metrics\MetricsRegistry $registry
   *   Registry to write to. Passed in rather than injected, because the
   *   registry is what invokes collectors.
   */
  public function collect(MetricsRegistry $registry): void;

}
