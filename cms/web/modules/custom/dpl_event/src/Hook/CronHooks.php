<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_event\Workflows\OccurredSchedule;
use Drupal\dpl_event\Workflows\UnpublishSchedule;
use Drupal\dpl_event\Workflows\UnpublishSeriesSchedule;

/**
 * Cron hooks for dpl_event module.
 */
class CronHooks {

  public function __construct(
    protected OccurredSchedule $occurredSchedule,
    protected UnpublishSchedule $unpublishSchedule,
    protected UnpublishSeriesSchedule $unpublishSeriesSchedule,
  ) {}

  /**
   * Register the job scheduler jobs for event occurrence and unpublication.
   *
   * @return non-empty-array<string, array{'worker callback': callable}>
   *   Job scheduler information.
   */
  #[Hook('cron_job_scheduler_info')]
  public function registerEventSchedules(): array {
    return array_merge(
      $this->occurredSchedule->getSchedule(),
      $this->unpublishSchedule->getSchedule(),
      $this->unpublishSeriesSchedule->getSchedule()
    );
  }

}
