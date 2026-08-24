<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_metrics\Unit;

use Drupal\dpl_admin\Services\VersionHelper;
use Drupal\dpl_metrics\Collector\CmsVersionCollector;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\Tests\UnitTestCase;
use Prometheus\Storage\InMemory;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for the CMS version collector.
 */
class CmsVersionCollectorTest extends UnitTestCase {

  /**
   * The version is reported, alongside the site labels the registry adds.
   */
  public function testReportsVersion(): void {
    $output = $this->render('2026.08.1');

    $this->assertStringContainsString(
      'dpl_cms_deployment_info{environment="main",project="dpl-cms-core",version="2026.08.1"} 1',
      $output,
    );
  }

  /**
   * A missing version still produces a series, labelled as unknown.
   *
   * Dropping the metric would make an unversioned deploy look exactly like a
   * site that is not responding.
   */
  public function testMissingVersionIsReportedAsUnknown(): void {
    $this->assertStringContainsString('version="unknown"', $this->render(NULL));
  }

  /**
   * Without dpl_admin the collector still reports, with an unknown version.
   *
   * The version helper is an optional dependency, so that dpl_metrics does
   * not drag the whole admin module in behind it.
   */
  public function testWorksWithoutTheVersionHelper(): void {
    $registry = new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      new InMemory(),
      [new CmsVersionCollector()],
      MetricsRegistry::siteLabels(),
    );

    $this->assertStringContainsString('version="unknown"', $registry->render());
  }

  /**
   * Renders a registry holding only this collector.
   *
   * @param string|null $version
   *   The version the helper should report.
   *
   * @return string
   *   The scrape body.
   */
  private function render(?string $version): string {
    $versionHelper = $this->prophesize(VersionHelper::class);
    $versionHelper->getVersion()->willReturn($version);

    $registry = new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      new InMemory(),
      [new CmsVersionCollector($versionHelper->reveal())],
      ['project' => 'dpl-cms-core', 'environment' => 'main'],
    );

    return $registry->render();
  }

}
