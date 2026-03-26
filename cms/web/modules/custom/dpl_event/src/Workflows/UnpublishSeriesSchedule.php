<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Workflows;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_event\Form\SettingsForm;
use Drupal\job_scheduler\Entity\JobSchedule;
use Drupal\recurring_events\Entity\EventSeries;
use Drupal\recurring_events\EventInstanceStorageInterface;

/**
 * Cron workflow for unpublishing event series without published instances.
 */
final class UnpublishSeriesSchedule {
  const JOB_SCHEDULE_NAME = 'dpl_event_unpublish_series';
  const JOB_SCHEDULE_TYPE = 'eventseries';
  const JOB_SCHEDULE_PERIOD = 1800;

  /**
   * Constructor.
   */
  public function __construct(
    private EventInstanceStorageInterface $eventInstanceStorage,
    private EntityTypeManagerInterface $entityTypeManager,
    private ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * Schedule for hook_cron_job_scheduler_info().
   *
   * @return non-empty-array<string, array{'worker callback': callable, 'jobs': array<array{'type': string, 'period': int, 'periodic': bool}>}>
   *   Job scheduler information.
   */
  public function getSchedule(): array {
    return [
      self::JOB_SCHEDULE_NAME => [
        'worker callback' => [$this, 'callback'],
        'jobs' => [
          [
            'type' => self::JOB_SCHEDULE_TYPE,
            'period' => self::JOB_SCHEDULE_PERIOD,
            'periodic' => TRUE,
          ],
        ],
      ],
    ];
  }

  /**
   * Callback to execute periodic event-series unpublication.
   */
  public function callback(JobSchedule $job): void {
    $this->unpublishEmptySeries();
  }

  /**
   * Unpublish series that do not have any published event instances.
   */
  private function unpublishEmptySeries(): void {
    $config = $this->configFactory->get(SettingsForm::CONFIG_NAME);
    $seriesUnpublishingEnabled = (bool) $config->get('unpublish_series_enable');

    if (!$seriesUnpublishingEnabled) {
      return;
    }

    $eventSeriesStorage = $this->entityTypeManager->getStorage('eventseries');
    $publishedSeriesIds = $eventSeriesStorage->getQuery()
      ->accessCheck(FALSE)
      ->condition('status', 1)
      ->execute();

    /** @var \Drupal\recurring_events\Entity\EventSeries[] $publishedSeries */
    $publishedSeries = $eventSeriesStorage->loadMultiple($publishedSeriesIds);
    foreach ($publishedSeries as $eventSeries) {
      if (!$eventSeries instanceof EventSeries) {
        continue;
      }

      $publishedEventInstanceCount = ($this->eventInstanceStorage->getQuery())
        ->accessCheck(FALSE)
        ->condition('eventseries_id', $eventSeries->id())
        ->condition('status', 1)
        ->count()
        ->execute();

      if (!empty($publishedEventInstanceCount)) {
        continue;
      }

      $eventSeries->setUnpublished()->save();
    }
  }

}
