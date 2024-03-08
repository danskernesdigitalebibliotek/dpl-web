<?php

namespace Drupal\dpl_event\Workflows;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\dpl_event\EventState;
use Drupal\dpl_event\EventWrapper;
use Drupal\job_scheduler\Entity\JobSchedule;
use Drupal\job_scheduler\JobSchedulerInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\EventInstanceStorageInterface;
use Psr\Log\LoggerInterface;

/**
 * Schedule for marking events that are no longer active as occurred.
 */
class OccurredSchedule {

  /**
   * Constructor.
   */
  public function __construct(
    private LoggerInterface $logger,
    private TimeInterface $time,
    private JobSchedulerInterface $jobScheduler,
    private EventInstanceStorageInterface $eventInstanceStorage,
  ) {}

  /**
   * Schedule for hook_cron_job_scheduler_info().
   *
   * @return non-empty-array<string, array{'worker callback': callable}>
   *   Job scheduler information.
   */
  public function getSchedule(): array {
    return [
      "dpl_event_set_occurred" => [
        "worker callback" => [$this, 'callback'],
      ],
    ];
  }

  /**
   * The callback which will be triggered when the scheduled event occurs.
   */
  public function callback(JobSchedule $job): void {
    $event = $this->eventInstanceStorage->load($job->getId());
    if (!$event || !$event instanceof EventInstance) {
      return;
    }
    if ((new EventWrapper($event))->isActive()) {
      $event->set("field_event_state", EventState::Occurred);
      $event->save();
    }
  }

  /**
   * Schedule setting an event to occurred in the future.
   */
  public function scheduleOccurred(EventInstance $event): void {
    $nowTimestamp = $this->time->getCurrentTime();
    $eventEndDate = (new EventWrapper($event))->getEndDate();

    $job = [
      'name' => 'dpl_event_set_occurred',
      'type' => 'event',
      'id' => $event->id(),
      // The period is the number of seconds to wait between job executions. A
      // negative period means that the job will be executed as soon as
      // possible. By setting periodic false the job is only executed once.
      'period' => $eventEndDate->getTimestamp() - $nowTimestamp,
      'periodic' => FALSE,
    ];

    // Remove any preexisting job with the same name, type and id.
    $this->jobScheduler->remove($job);
    // Schedule the new update.
    $this->jobScheduler->set($job);

    $this->logger->debug(
      'Scheduled "occurred" update for event %event_id at %end_time',
      ['%event_id' => $event->id(), '%end_time' => $eventEndDate->format('c')]
    );
  }

}
