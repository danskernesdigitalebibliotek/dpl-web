<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Hook;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Queue\QueueFactory;
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
    protected EntityTypeManagerInterface $entityTypeManager,
    protected QueueFactory $queueFactory,
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
        'worker callback' => [$this, 'queueSubscriptionsUpdate'],
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
   * Queue new content updates on all subscriptions.
   */
  public function queueSubscriptionsUpdate(JobSchedule $job): void {
    /** @var \Drupal\bnf_client\Entity\Subscription[] $subscriptions */
    $subscriptions = $this->entityTypeManager->getStorage('bnf_subscription')->loadMultiple();

    $queue = $this->queueFactory->get('bnf_client_new_content');

    foreach ($subscriptions as $subscription) {
      $queue->createItem(['uuid' => $subscription->getSubscriptionUuid()]);
    }
  }

}
