<?php

namespace Drupal\dpl_event\Plugin\EventInstanceCreator;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;
use Drupal\recurring_events\EventCreationService;
use Drupal\recurring_events\EventInstanceCreatorBase;
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
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    EventCreationService $creation_service,
    protected ModuleHandlerInterface $moduleHandler,
    protected MessengerInterface $messenger,
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
    );
    $plugin->setStringTranslation($container->get('string_translation'));

    return $plugin;
  }

  /**
   * {@inheritDoc}
   */
  public function processInstances(EventSeries $series): void {
    // The calculated dates already have excluded and included dates applied to
    // them, so they are the full picture of what the series should look like.
    $new_dates = $this->indexDatesByRange(
      $this->creationService->calculateEventSeriesDates($series)
    );

    if ($this->moveSingleInstance($series, $new_dates)) {
      return;
    }

    $this->reconcileInstances($series, $new_dates);
  }

  /**
   * Moves the only instance of a series to the only date of the series.
   *
   * If there is a single occurrence both before and after the change, then that
   * occurrence is unambiguously still the same occurrence, no matter how far
   * the date moved. Updating the date of the existing instance keeps it, where
   * reconciling by date range would delete it and create a new one.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   * @param array<string, array{start_date: \Drupal\Core\Datetime\DrupalDateTime, end_date: \Drupal\Core\Datetime\DrupalDateTime}> $new_dates
   *   The dates the series should have after the change.
   *
   * @return bool
   *   TRUE if the instance was moved, and nothing else needs to happen.
   */
  private function moveSingleInstance(EventSeries $series, array $new_dates): bool {
    if (count($new_dates) !== 1 || $series->getInstanceCount() !== 1) {
      return FALSE;
    }

    $instances = $series->getInstances();
    $instance = reset($instances);

    if (!$instance instanceof EventInstance) {
      return FALSE;
    }

    $date = reset($new_dates);
    $instance->set('date', [
      'value' => $date['start_date']->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
      'end_value' => $date['end_date']->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
    ]);
    $instance->save();

    return TRUE;
  }

  /**
   * Brings the instances of a series in line with the dates it should have.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   * @param array<string, array{start_date: \Drupal\Core\Datetime\DrupalDateTime, end_date: \Drupal\Core\Datetime\DrupalDateTime}> $wanted_dates
   *   The dates the series should have after the change, keyed by date range.
   */
  private function reconcileInstances(EventSeries $series, array $wanted_dates): void {
    // Keep the first instance we find for each wanted date range. Any further
    // instance of that same range is a duplicate, and is removed along with the
    // instances of the date ranges that are gone. Recreating everything used to
    // clean duplicates up as a side effect - preserving instances does not, so
    // we have to be explicit about it.
    $preserved_instances = [];
    $obsolete_instances = [];

    foreach ($series->getInstances() as $instance) {
      $range = $this->instanceDateRange($instance);

      if (isset($wanted_dates[$range]) && !isset($preserved_instances[$range])) {
        $preserved_instances[$range] = $instance;
      }
      else {
        $obsolete_instances[] = $instance;
      }
    }

    $deleted_count = $this->deleteInstances($series, $obsolete_instances);
    $created_count = $this->createInstances($series, array_diff_key($wanted_dates, $preserved_instances));

    $this->messenger->addStatus($this->t('Updated the occurrences of this event series: @created created, @deleted removed and @preserved left untouched.', [
      '@created' => $created_count,
      '@deleted' => $deleted_count,
      '@preserved' => count($preserved_instances),
    ], ['context' => 'dpl_event']));
  }

  /**
   * Indexes calculated dates by their date range.
   *
   * The keys the date calculation itself uses are not something we can rely on,
   * so we build an index of our own. An occurrence is identified by its whole
   * date range here.
   *
   * @param array<string, array{start_date: \Drupal\Core\Datetime\DrupalDateTime, end_date: \Drupal\Core\Datetime\DrupalDateTime}> $dates
   *   The calculated dates.
   *
   * @return array<string, array{start_date: \Drupal\Core\Datetime\DrupalDateTime, end_date: \Drupal\Core\Datetime\DrupalDateTime}>
   *   The same dates, keyed by date range.
   */
  private function indexDatesByRange(array $dates): array {
    $indexed_dates = [];

    foreach ($dates as $date) {
      $range = $this->dateRange(
        $date['start_date']->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
        $date['end_date']->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
      );

      $indexed_dates[$range] = $date;
    }

    return $indexed_dates;
  }

  /**
   * Reads the date range of an existing event instance.
   *
   * @param \Drupal\recurring_events\Entity\EventInstance $instance
   *   The instance to read the date range of.
   *
   * @return string
   *   The date range, in the same shape as the calculated dates are indexed by.
   */
  private function instanceDateRange(EventInstance $instance): string {
    /** @var \Drupal\datetime_range\Plugin\Field\FieldType\DateRangeItem $date */
    $date = $instance->get('date')->first();

    /** @var \Drupal\Core\Datetime\DrupalDateTime $start_date */
    $start_date = $date->get('start_date')->getValue();

    /** @var \Drupal\Core\Datetime\DrupalDateTime $end_date */
    $end_date = $date->get('end_date')->getValue();

    return $this->dateRange(
      $start_date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
      $end_date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
    );
  }

  /**
   * Builds the identity of an occurrence from its start and end date.
   *
   * Two occurrences are the same occurrence when they cover the same range.
   * Both dates are given in the storage format and timezone, which is what the
   * date calculation produces and what an instance has stored, so the two can
   * be compared without any conversion in between.
   */
  private function dateRange(string $start_date, string $end_date): string {
    return $start_date . '/' . $end_date;
  }

  /**
   * Deletes the instances that the new recurrence no longer contains.
   *
   * EventCreationService::clearEventInstances() cannot be used for this, as it
   * always deletes every instance of the series. We invoke the same hooks it
   * does, so modules reacting to a date configuration change still see the
   * instances that are actually going away.
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

    $this->moduleHandler->invokeAll('recurring_events_save_pre_instances_deletion', [$series]);
    // Modules may remove instances from the list here, to keep them around.
    $this->moduleHandler->invokeAll('recurring_events_save_pre_instances_deletion_alter', [&$instances]);

    foreach ($instances as $instance) {
      $this->moduleHandler->invokeAll('recurring_events_save_pre_instance_deletion', [$series, $instance]);
      $instance->delete();
      $this->moduleHandler->invokeAll('recurring_events_save_post_instance_deletion', [$series, $instance]);
    }

    $this->moduleHandler->invokeAll('recurring_events_save_post_instances_deletion', [$series]);

    return count($instances);
  }

  /**
   * Creates the instances for the date ranges that do not have one yet.
   *
   * EventCreationService::createInstances() cannot be used for this, as it
   * creates an instance for every date of the series, which would duplicate the
   * instances we just preserved.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series being saved.
   * @param array<string, array{start_date: \Drupal\Core\Datetime\DrupalDateTime, end_date: \Drupal\Core\Datetime\DrupalDateTime}> $dates
   *   The dates to create instances for.
   *
   * @return int
   *   The number of instances that were created.
   */
  private function createInstances(EventSeries $series, array $dates): int {
    $created_count = 0;

    foreach ($dates as $date) {
      $instance = $this->creationService->createEventInstance($series, $date['start_date'], $date['end_date']);

      // A missing instance means the series is a translation without a matching
      // instance in the default language, which createEventInstance() logs.
      if (!$instance instanceof EventInstance) {
        continue;
      }

      $this->creationService->configureDefaultInheritances($instance, (int) $series->id());
      $instance->save();
      $created_count++;
    }

    return $created_count;
  }

}
