<?php

declare(strict_types = 1);

namespace Drupal\dpl_event\Workflows;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\dpl_event\EventWrapper;
use Drupal\dpl_event\Form\SettingsForm;
use Drupal\job_scheduler\Entity\JobSchedule;
use Drupal\job_scheduler\JobSchedulerInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\EventInstanceStorageInterface;

/**
 * Schedule for automatically marking events.
 */
final class UnpublishSchedule {

  /**
   * Constructor.
   */
  public function __construct(
    private LoggerChannelInterface $logger,
    private TimeInterface $time,
    private JobSchedulerInterface $jobScheduler,
    private EventInstanceStorageInterface $eventInstanceStorage,
    private ConfigFactoryInterface $configFactory
  ) {}

  /**
   * Schedule for hook_cron_job_scheduler_info().
   *
   * @return non-empty-array<string, array{'worker callback': callable}>
   *   Job scheduler information.
   */
  public function getSchedule(): array {
    return [
      'dpl_event_unpublish' => [
        'worker callback' => [$this, 'callback'],
      ],
    ];
  }

  /**
   * Callback to execute scheduled unpublication.
   */
  public function callback(JobSchedule $job): void {
    $event = $this->eventInstanceStorage->load($job->getId());
    if (!$event || !$event instanceof EventInstance) {
      throw new \UnexpectedValueException("Unable to load event instance {$job->getId()} for automatic unpublication");
    }

    $event->setUnpublished()->save();

    // If all instances in the series are unpublished then also unpublish the
    // series.
    $eventSeries = $event->getEventSeries();
    $allEventInstances = $eventSeries->get('event_instances')->referencedEntities();
    $publishedInstances = array_filter($allEventInstances, function (EventInstance $event) {
      return $event->isPublished();
    });
    if (empty($publishedInstances)) {
      $eventSeries->setUnpublished()->save();
    }
  }

  /**
   * Schedule unpublication of an event instance.
   */
  public function scheduleUnpublication(EventInstance $event): void {
    $config = $this->configFactory->get(SettingsForm::CONFIG_NAME);
    $schedule = (int) $config->get('unpublish_schedule');
    $now_timestamp = $this->time->getCurrentTime();

    $event_end_date = (new EventWrapper($event))->getEndDate();
    $unpublication_date = (\DateTimeImmutable::createFromInterface($event_end_date))->modify("+{$schedule} seconds");
    $unpublication_timestamp = $unpublication_date->getTimestamp();

    $job = [
      'name' => 'dpl_event_unpublish',
      'type' => 'eventinstance',
      'id' => $event->id(),
      // The period is the number of seconds to wait between job executions. A
      // negative period means that the job will be executed as soon as
      // possible. By setting periodic false the job is only executed once.
      'period' => $unpublication_timestamp - $now_timestamp,
      'periodic' => FALSE,
    ];

    // Remove any preexisting job with the same name, type and id.
    $this->jobScheduler->remove($job);
    // If automatic unpublication is enabled and needed then schedule a new
    // unpublication.
    if ($schedule > 0 && $event->isPublished()) {
      $this->jobScheduler->set($job);

      $this->logger->debug(
        'Scheduled unpublication for event %event_id at %end_time',
        ['%event_id' => $event->id(), '%end_time' => $unpublication_date->format('c')]
      );
    }
  }

  /**
   * Reschedule all event instances for unpublication.
   *
   * This will update schedules for all events even those that where not
   * scheduled in the past.
   */
  public function rescheduleAll(): void {
    $this->jobScheduler->removeAll('dpl_event_unpublish', 'eventinstance');

    $publishedEventInstanceIds = ($this->eventInstanceStorage->getQuery())
      ->accessCheck(FALSE)
      ->condition('status', 1)
      ->execute();
    /** @var \Drupal\recurring_events\Entity\EventInstance[] $publishedEventInstances */
    $publishedEventInstances = $this->eventInstanceStorage->loadMultiple($publishedEventInstanceIds);

    array_walk($publishedEventInstances, function (EventInstance $event) {
      $this->scheduleUnpublication($event);
    });
  }

}
