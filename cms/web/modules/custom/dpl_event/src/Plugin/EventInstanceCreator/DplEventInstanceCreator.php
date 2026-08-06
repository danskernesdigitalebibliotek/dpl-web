<?php

namespace Drupal\dpl_event\Plugin\EventInstanceCreator;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\dpl_event\EventPeriod;
use Drupal\recurring_events\Entity\EventInstance as RecurringEventInstance;
use Drupal\recurring_events\Entity\EventSeries;
use Drupal\recurring_events\EventCreationService;
use Drupal\recurring_events\EventInstanceCreatorBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Our custom logic for creating eventinstances, as part of updating series.
 *
 * This logic is run whenever the recurrence of an eventseries is updated. Note
 * that newly created series never reach a creator plugin - recurring_events
 * creates the instances of those itself.
 *
 * The default plugin deletes every instance of the series and creates them all
 * again from the new recurrence. We cannot afford that: the ID of an
 * eventinstance is its URL and its ID in /api/v1/events, and an instance can
 * carry data that exists nowhere else - an editor may have given a single
 * occurrence its own title, image or ticket categories. So we only delete the
 * occurrences that the new recurrence no longer contains, and only create the
 * ones that are not there yet.
 *
 * @todo Nothing about that problem is specific to these sites, so the
 *   reconciliation belongs upstream, as a creator plugin recurring_events
 *   ships itself. Reading and writing the dates through our own bundle class
 *   is what keeps this plugin from being contributed as it stands.
 *
 * @EventInstanceCreator(
 *   id = "dpl_event_eventinstance_creator",
 *   description = @Translation("DPL event: Instance Creating logic.")
 * )
 */
class DplEventInstanceCreator extends EventInstanceCreatorBase implements ContainerFactoryPluginInterface {

  use StringTranslationTrait;

  /**
   * Constructs a DplEventInstanceCreator.
   *
   * @param array<string, mixed> $configuration
   *   The plugin configuration.
   * @param string $plugin_id
   *   The plugin ID.
   * @param mixed $plugin_definition
   *   The plugin definition.
   * @param \Drupal\recurring_events\EventCreationService $creation_service
   *   The service that calculates dates and builds event instances.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   The module handler, used to invoke the instance deletion hooks.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger, used to tell the editor what happened to the occurrences.
   * @param \Psr\Log\LoggerInterface $logger
   *   The logger, used to report occurrences we cannot make sense of.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    EventCreationService $creation_service,
    protected ModuleHandlerInterface $moduleHandler,
    protected MessengerInterface $messenger,
    protected LoggerInterface $logger,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $creation_service);
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    $plugin = new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('recurring_events.event_creation_service'),
      $container->get('module_handler'),
      $container->get('messenger'),
      $container->get('dpl_event.logger'),
    );
    $plugin->setStringTranslation($container->get('string_translation'));

    return $plugin;
  }

  /**
   * {@inheritDoc}
   */
  public function processInstances(EventSeries $series): void {
    $wanted_periods = $this->calculatePeriods($series);
    $single_instance = $this->singleOccurrenceToMove($series, $wanted_periods);

    // There is exactly one wanted period whenever there is an instance to move,
    // so this only comes up empty in the cases we reconcile instead.
    $single_period = reset($wanted_periods);

    if ($single_instance instanceof EventInstance && $single_period instanceof EventPeriod) {
      $this->moveOccurrence($single_instance, $single_period);

      return;
    }

    $this->reconcileInstances($series, $wanted_periods);
  }

  /**
   * The periods a series should consist of after the change.
   *
   * The calculated dates already have excluded and included dates applied to
   * them, so they are the full picture of what the series should look like. The
   * keys the calculation itself uses are not something we can rely on, so the
   * periods are keyed by their own identity instead.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   *
   * @return array<string, \Drupal\dpl_event\EventPeriod>
   *   The periods, keyed by their identity.
   */
  private function calculatePeriods(EventSeries $series): array {
    $periods = [];

    foreach ($this->creationService->calculateEventSeriesDates($series) as $date) {
      $period = EventPeriod::fromDrupalDateTimes($date['start_date'], $date['end_date']);

      $periods[(string) $period] = $period;
    }

    return $periods;
  }

  /**
   * The instance to move, when the change only moves a single occurrence.
   *
   * If there is a single occurrence both before and after the change, then that
   * occurrence is unambiguously still the same occurrence, no matter how far
   * the date moved. Moving the existing instance keeps it, where reconciling by
   * period would delete it and create a new one.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   * @param array<string, \Drupal\dpl_event\EventPeriod> $wanted_periods
   *   The periods the series should have after the change.
   *
   * @return \Drupal\dpl_event\Entity\EventInstance|null
   *   The only instance of the series, or NULL if this is not a move of a
   *   single occurrence and the instances have to be reconciled instead.
   */
  private function singleOccurrenceToMove(EventSeries $series, array $wanted_periods): ?EventInstance {
    if (count($wanted_periods) !== 1 || $series->getInstanceCount() !== 1) {
      return NULL;
    }

    $instances = $series->getInstances();
    $instance = reset($instances);

    return ($instance instanceof EventInstance) ? $instance : NULL;
  }

  /**
   * Moves an occurrence to another period.
   */
  private function moveOccurrence(EventInstance $instance, EventPeriod $period): void {
    $instance->setDate($period);
    $instance->save();
  }

  /**
   * Brings the instances of a series in line with the periods it should have.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   * @param array<string, \Drupal\dpl_event\EventPeriod> $wanted_periods
   *   The periods the series should have after the change, keyed by identity.
   */
  private function reconcileInstances(EventSeries $series, array $wanted_periods): void {
    // Keep the first instance we find for each wanted period. Any further
    // instance of that same period is a duplicate, and is removed along with
    // the instances of the periods that are gone. Recreating everything used to
    // clean duplicates up as a side effect - preserving instances does not, so
    // we have to be explicit about it.
    $preserved_identities = [];
    $preserved_count = 0;
    $obsolete_instances = [];

    foreach ($series->getInstances() as $instance) {
      $period = $this->instancePeriod($instance);

      // An occurrence we cannot read the date of is left alone. It matches no
      // wanted period, so reconciling it would mean deleting it, and that would
      // throw away whatever an editor put on it over a date that we are the
      // ones failing to understand.
      if ($period === NULL) {
        $this->logger->error('Left event instance @instance of event series @series untouched: it has no date range that could be read.', [
          '@instance' => $instance->id(),
          '@series' => $series->id(),
        ]);
        $preserved_count++;
        continue;
      }

      $identity = (string) $period;

      if (isset($wanted_periods[$identity]) && !isset($preserved_identities[$identity])) {
        $preserved_identities[$identity] = TRUE;
        $preserved_count++;
      }
      else {
        $obsolete_instances[] = $instance;
      }
    }

    $deleted_count = $this->deleteInstances($series, $obsolete_instances);
    $created_count = $this->createInstances($series, array_diff_key($wanted_periods, $preserved_identities));

    $this->messenger->addStatus($this->t('Updated the occurrences of this event series: @created created, @deleted removed and @preserved left untouched.', [
      '@created' => $created_count,
      '@deleted' => $deleted_count,
      '@preserved' => $preserved_count,
    ], ['context' => 'dpl_event']));
  }

  /**
   * Reads the period of an existing event instance.
   *
   * @param \Drupal\recurring_events\Entity\EventInstance $instance
   *   The instance to read the period of.
   *
   * @return \Drupal\dpl_event\EventPeriod|null
   *   The period, or NULL if the instance has no date we can read. An instance
   *   is supposed to always have one, but these sites have seen instances end
   *   up in states the module does not allow, and this runs after the series
   *   has been saved, so a fatal here would leave the editor with a white
   *   screen and a series whose occurrences were never reconciled.
   */
  private function instancePeriod(RecurringEventInstance $instance): ?EventPeriod {
    if (!$instance instanceof EventInstance) {
      return NULL;
    }

    // Every way of failing to read the date is the same answer here: we do not
    // know when this occurrence is, so it is not ours to reconcile.
    try {
      return $instance->getDate();
    }
    catch (\Exception $exception) {
      return NULL;
    }
  }

  /**
   * Deletes the instances that the new recurrence no longer contains.
   *
   * EventCreationService::clearEventInstances() cannot be used for this, as it
   * always deletes every instance of the series. We invoke the hooks it invokes
   * per instance, so modules reacting to a date configuration change still see
   * the instances that are actually going away.
   *
   * The two series-wide hooks it also invokes are deliberately left out.
   * hook_recurring_events_save_pre_instances_deletion() means that every
   * instance of the series is about to go, and implementors act on the series
   * rather than on a list of instances: recurring_events_registration answers
   * it by deleting every registrant of the series and notifying them all. That
   * is the wrong thing to do when a single occurrence is being removed, and
   * there is no partial-deletion equivalent to invoke instead.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   * @param \Drupal\recurring_events\Entity\EventInstance[] $instances
   *   The instances to delete.
   *
   * @return int
   *   The number of instances that were deleted.
   */
  private function deleteInstances(EventSeries $series, array $instances): int {
    if (empty($instances)) {
      return 0;
    }

    // Modules may remove instances from the list here, to keep them around.
    $this->moduleHandler->invokeAll('recurring_events_save_pre_instances_deletion_alter', [&$instances]);

    foreach ($instances as $instance) {
      $this->moduleHandler->invokeAll('recurring_events_save_pre_instance_deletion', [$series, $instance]);
      $instance->delete();
      $this->moduleHandler->invokeAll('recurring_events_save_post_instance_deletion', [$series, $instance]);
    }

    return count($instances);
  }

  /**
   * Creates the instances for the periods that do not have one yet.
   *
   * EventCreationService::createInstances() cannot be used for this, as it
   * creates an instance for every date of the series, which would duplicate the
   * instances we just preserved.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   * @param array<string, \Drupal\dpl_event\EventPeriod> $periods
   *   The periods to create instances for.
   *
   * @return int
   *   The number of instances that were created.
   */
  private function createInstances(EventSeries $series, array $periods): int {
    $created_count = 0;

    foreach ($periods as $period) {
      $instance = $this->creationService->createEventInstance(
        $series,
        $period->getStartDrupalDateTime(),
        $period->getEndDrupalDateTime(),
      );

      // A missing instance means the series is a translation without a matching
      // instance in the default language, which createEventInstance() logs.
      if (!$instance instanceof RecurringEventInstance) {
        continue;
      }

      $this->creationService->configureDefaultInheritances($instance, (int) $series->id());
      $instance->save();
      $created_count++;
    }

    return $created_count;
  }

}
