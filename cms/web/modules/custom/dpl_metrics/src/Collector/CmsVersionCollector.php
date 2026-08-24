<?php

declare(strict_types=1);

namespace Drupal\dpl_metrics\Collector;

use Drupal\dpl_admin\Services\VersionHelper;
use Drupal\dpl_metrics\MetricsRegistry;

/**
 * Reports which build of the CMS a site is running.
 *
 * Emitted as an info metric: the value is always 1 and everything worth
 * knowing sits in the labels. That is the Prometheus idiom for describing a
 * target rather than measuring it, and it lets a dashboard group sites by
 * version, or join the version onto other metrics, with a single query.
 */
class CmsVersionCollector implements MetricCollectorInterface {

  /**
   * Placeholder for a version that cannot be determined.
   *
   * Better than omitting the metric: a missing series is indistinguishable
   * from a site that is down, whereas an explicit 'unknown' is visibly wrong
   * and can be alerted on.
   */
  private const UNKNOWN = 'unknown';

  /**
   * Constructs a CMS version collector.
   *
   * @param \Drupal\dpl_admin\Services\VersionHelper|null $versionHelper
   *   Resolves the deployed version. The same source the admin toolbar
   *   displays, so the two can never disagree. NULL when dpl_admin is not
   *   enabled, which a site is free to do; the metric then reports an
   *   unknown version rather than disappearing.
   */
  public function __construct(
    private readonly ?VersionHelper $versionHelper = NULL,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public function collect(MetricsRegistry $registry): void {
    $registry->setGauge(
      'deployment_info',
      'Build of the CMS a site is running. Always 1 - read the labels.',
      1,
      // The project and environment naming the site are added by the
      // registry, which applies them to every metric.
      ['version' => $this->versionHelper?->getVersion() ?: self::UNKNOWN],
    );
  }

}
