<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\dpl_event\Form\SettingsForm;
use Drupal\dpl_event\Workflows\OccurredSchedule;
use Drupal\dpl_event\Workflows\UnpublishSchedule;
use Drupal\field\FieldConfigInterface;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Entity hooks for dpl_event module.
 */
class EntityHooks {

  public function __construct(
    protected ConfigFactoryInterface $configFactory,
    protected OccurredSchedule $occurredSchedule,
    protected UnpublishSchedule $unpublishSchedule,
  ) {}

  /**
   * Require a text body in the paragraphs of events.
   *
   * Series always need one, as instances that have no paragraphs of their own
   * inherit those of the series. Instances need one when they have
   * paragraphs of their own.
   *
   * @param array<string, \Drupal\Core\Field\FieldDefinitionInterface> $fields
   *   The field definitions of the bundle, keyed by field name.
   * @param \Drupal\Core\Entity\EntityTypeInterface $entity_type
   *   The entity type of the bundle.
   * @param string $bundle
   *   The bundle.
   */
  #[Hook('entity_bundle_field_info_alter')]
  public function addTextBodyConstraint(array &$fields, EntityTypeInterface $entity_type, string $bundle): void {
    if (!in_array($entity_type->id(), ['eventseries', 'eventinstance'], TRUE)) {
      return;
    }

    $field = $fields['field_event_paragraphs'] ?? NULL;

    if (!$field instanceof FieldConfigInterface) {
      return;
    }

    $field->addConstraint('EventTextBody');
  }

  /**
   * Use our own class for event instances.
   *
   * @param mixed[] $bundles
   *   Bundle info for altering.
   */
  #[Hook('entity_bundle_info_alter')]
  public function setEventInstanceClass(array &$bundles): void {
    if (isset($bundles['eventinstance']['default'])) {
      $bundles['eventinstance']['default']['class'] = EventInstance::class;
    }
  }

  /**
   * Clear location fields that are hidden in the form.
   *
   * Clear data from fields that are hidden in the form by Drupal #states, so we
   * don't persist stale values from a previously-selected configuration. The
   * logic here mirrors the visibility states set in
   * \Drupal\dpl_event\Hook\FormHooks::alterEditForm().
   *
   * For eventinstance we read the entity's own fields — not the
   * field_inheritance fallbacks (e.g. `branch`, `event_non_branch_location`) —
   * because the form widgets edit the real storage fields (`field_branch`,
   * etc.). Using the inherited values here would wipe a custom instance address
   * whenever the series happens to have a branch.
   */
  #[Hook('entity_presave')]
  public function clearHiddenLocationFields(EntityInterface $entity): void {
    if (!($entity instanceof EventInstance) && !($entity instanceof EventSeries)) {
      return;
    }

    $location_type = $entity->hasField('field_event_location_type')
      ? $entity->get('field_event_location_type')->getString()
      : 'physical';

    // Anything that isn't 'physical' (online, or the empty "- None -" choice)
    // hides the custom-location fields, so we clear them.
    $is_physical = ($location_type === 'physical');
    $has_branch = $entity->hasField('field_branch')
      && !$entity->get('field_branch')->isEmpty();
    $is_non_branch_location = $entity->hasField('field_event_non_branch_location')
      && (bool) $entity->get('field_event_non_branch_location')->getString();

    // Mirror the form #states for the custom-location fields:
    // visible when physical AND (no branch OR non_branch_location is on).
    $show_custom_location = $is_physical && (!$has_branch || $is_non_branch_location);

    // Mirror the form #states for the non-branch-location toggle:
    // visible when physical AND a branch is set.
    $show_non_branch_toggle = $is_physical && $has_branch;

    if (!$show_custom_location) {
      if ($entity->hasField('field_event_location')) {
        $entity->set('field_event_location', NULL);
      }
      if ($entity->hasField('field_event_address_gsearch')) {
        $entity->set('field_event_address_gsearch', NULL);
      }
    }

    // If an event is fully online, we do not want place to be set.
    if ($location_type === 'online' && $entity->hasField('field_event_place')) {
      // On eventinstances we cannot just set the value to NULL, as then we'll
      // be inheriting the value from the series. To get around that, we set it
      // to an empty space.
      if ($entity instanceof EventInstance) {
        $entity->set('field_event_place', ' ');
      }
      else {
        $entity->set('field_event_place', NULL);
      }
    }

    if (!$show_non_branch_toggle && $entity->hasField('field_event_non_branch_location')) {
      $entity->set('field_event_non_branch_location', FALSE);
    }
  }

  /**
   * Set the times of all-day event instances to cover the whole day.
   *
   * If the eventinstance is set to be an all-day, we want to ignore any times
   * set, and instead set them to 00:00 - 23:59.
   *
   * The majority of the logic here is taken from the contrib module
   * date_all_day from DatetimeRangeAllDayWidget, as they appear to have figured
   * out how to deal with the issues of timezones.
   */
  #[Hook('eventinstance_presave')]
  public function setAllDayTimes(EventInstance $eventinstance): void {
    if (!$eventinstance->hasField('event_all_day')) {
      return;
    }

    $all_day = $eventinstance->get('event_all_day')->getString();

    if (empty($all_day)) {
      return;
    }

    $dates = $eventinstance->get('date')->getValue();

    $timezone = timezone_open(date_default_timezone_get());

    if (!$timezone) {
      return;
    }

    foreach ($dates as &$date) {
      $start_date = $date['value'] ?? NULL;
      $end_date = $date['end_value'] ?? NULL;

      if (!($start_date) || (!($end_date))) {
        continue;
      }

      $start_date = new DrupalDateTime($start_date, DateTimeItemInterface::STORAGE_TIMEZONE);
      $end_date = new DrupalDateTime($end_date, DateTimeItemInterface::STORAGE_TIMEZONE);

      // All day fields start at midnight on the starting date, but are
      // stored like datetime fields, so we need to adjust the time.
      // This function is called twice, so to prevent a double conversion
      // we need to explicitly set the timezone.
      $start_date->setTimezone($timezone);
      $start_date->setTime(0, 0, 0);
      $end_date->setTimezone($timezone);
      $end_date->setTime(23, 59, 59);

      $date['value'] = $start_date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT, [
        'timezone' => DateTimeItemInterface::STORAGE_TIMEZONE,
      ]);
      $date['end_value'] = $end_date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT, [
        'timezone' => DateTimeItemInterface::STORAGE_TIMEZONE,
      ]);
    }

    $eventinstance->set('date', $dates);
  }

  /**
   * Schedule occurrence and unpublication of new event instances.
   */
  #[Hook('eventinstance_insert')]
  public function scheduleNewEventInstance(EntityInterface $entity): void {
    if (!$entity instanceof EventInstance) {
      return;
    }

    $entity->isActive() && $this->occurredSchedule->scheduleOccurred($entity);
    $this->unpublishSchedule->scheduleUnpublication($entity);
  }

  /**
   * Reschedule occurrence and unpublication when event instance dates change.
   */
  #[Hook('eventinstance_update')]
  public function rescheduleUpdatedEventInstance(EntityInterface $entity): void {
    if (!$entity instanceof EventInstance) {
      return;
    }

    $original = $entity->getOriginal();

    // If there are no changes to the date then skip updating schedules.
    if ($original instanceof EventInstance && $entity->hasSameDate($original)) {
      return;
    }

    $entity->isActive() && $this->occurredSchedule->scheduleOccurred($entity);
    $this->unpublishSchedule->scheduleUnpublication($entity);
  }

  /**
   * Hide the screen name vocabulary when the feature is disabled.
   *
   * This is to totally hide the vocabulary when the feature is disabled.
   *
   * hook_entity_query_TAG_alter() is the way to hook into `accessCheck(TRUE)`.
   */
  #[Hook('entity_query_taxonomy_vocabulary_alter')]
  public function hideDisabledScreenNameVocabulary(QueryInterface $query): void {
    if (!$this->configFactory->get(SettingsForm::CONFIG_NAME)->get('enable_screen_name')) {
      $query->condition('vid', 'screen_name', '<>');
    }
  }

}
