<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Hook;

use Drupal\bnf_client\BnfScheduler;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\job_scheduler\Entity\JobSchedule;

/**
 * Hooks for `job_scheduler`.
 */
class JobSchedulerHooks {

  const JOB_SCHEDULE_NAME = 'bnf_update_scheduler';

  /**
   * Constructor.
   */
  public function __construct(
    protected BnfScheduler $scheduler,
  ) {}

  /**
   * Return job schedule.
   *
   * @return non-empty-array<string, array{'worker callback': callable, 'jobs': array<array<string, string|int|bool>>}>
   *   Job schedule definition.
   */
  #[Hook('cron_job_scheduler_info')]
  public function subscriptionsUpdateJobSchedule(): array {
    return [
      self::JOB_SCHEDULE_NAME => [
        'worker callback' => [$this, 'queueUpdates'],
        'jobs' => [
          [
            'type' => 'bnf_schedules_update_check',
            'period' => 3600,
            'periodic' => TRUE,
          ],
        ],
      ],
    ];
  }

  /**
   * Queue new content updates on all nodes and subscriptions.
   */
  public function queueUpdates(JobSchedule $job): void {
    $this->scheduler->queueAllSubscriptionsUpdate();
    $this->scheduler->queueAllNodesUpdate();
  }

}
