<?php

namespace Drupal\dpl_event\Workflows;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\dpl_event\EventState;
use Drupal\job_scheduler\Entity\JobSchedule;
use Drupal\job_scheduler\JobSchedulerInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\EventInstanceStorageInterface;
use Psr\Log\LoggerInterface;
use Safe\DateTimeImmutable;

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

    if ($this->isActive($event)) {
      $event->set("field_event_state", EventState::Occurred);
      $event->save();
    }
  }

  /**
   * Schedule setting an event to occurred in the future.
   */
  public function scheduleOccurred(EventInstance $event): void {
    $now_timestamp = $this->time->getCurrentTime();

    $event_date = $event->get('date')->get(0);
    if (!$event_date) {
      return;
    }
    $event_date_values = $event_date->getValue();
    if (!$event_date_values || empty($event_date_values["end_value"])) {
      return;
    }
    // Drupal stores dates in UTC by default but if no timezone is specified
    // then the default timezone will be assumed.
    $event_end_date = new DateTimeImmutable($event_date_values["end_value"], new \DateTimeZone('UTC'));
    $event_end_timestamp = $event_end_date->getTimestamp();

    $job = [
      'name' => 'dpl_event_set_occurred',
      'type' => 'event',
      'id' => $event->id(),
      // The period is the number of seconds to wait between job executions. A
      // negative period means that the job will be executed as soon as
      // possible. By setting periodic false the job is only executed once.
      'period' => $event_end_timestamp - $now_timestamp,
      'periodic' => FALSE,
    ];

    // Remove any preexisting job with the same name, type and id.
    $this->jobScheduler->remove($job);
    // Schedule the new update.
    $this->jobScheduler->set($job);

    $this->logger->debug(
      'Scheduled "occurred" update for event %event_id at %end_time',
      ['%event_id' => $event->id(), '%end_time' => $event_end_date->format('c')]
    );
  }

  /**
   * Determine if an event is considered active.
   *
   * An event is considered active if it has not occurred or been cancelled.
   */
  public function isActive(EventInstance $event): bool {
    $event_states = array_map(function (array $sfield_value): EventState {
      return EventState::from($sfield_value['value']);
    }, $event->get("event_state")->getValue());

    return !(in_array(EventState::Cancelled, $event_states)
      || in_array(EventState::Occurred, $event_states));
  }

}
