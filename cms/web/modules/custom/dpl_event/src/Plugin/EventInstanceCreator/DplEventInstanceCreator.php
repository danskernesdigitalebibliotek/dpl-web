<?php

namespace Drupal\dpl_event\Plugin\EventInstanceCreator;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;
use Drupal\recurring_events\EventInstanceCreatorBase;

/**
 * Our custom logic for creating eventinstances, as part of updating series.
 *
 * This logic is run, whenever an eventseries is created, or if the reccurance
 * of an eventseries is updated.
 *
 * @EventInstanceCreator(
 *   id = "dpl_event_eventinstance_creator",
 *   description = @Translation("DPL event: Instance Creating logic.")
 * )
 */
class DplEventInstanceCreator extends EventInstanceCreatorBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritDoc}
   */
  public function processInstances(EventSeries $series): void {
    $new_dates = $this->creationService->getEventDatesToCreate($series);

    // If there is only a single instance, both before and after updating
    // an eventseries, we will just update the date of the instance, rather
    // than deleting it and recreating it.
    if (count($new_dates) === 1 && $series->getInstanceCount() === 1) {
      $instances = $series->event_instances->referencedEntities();
      $instance = reset($instances);
      $date = reset($new_dates);
      $start_date = $date['start_date'] ?? NULL;
      $end_date = $date['end_date'] ?? NULL;

      // If we managed to find the relevant eventinstance and the start/end
      // dates of the new date, we'll update the eventinstance and return.
      if (($instance instanceof EventInstance) &&
          ($start_date instanceof DrupalDateTime) &&
          ($end_date instanceof DrupalDateTime)) {
        $instance->set('date', [
          'value' => $date['start_date']->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
          'end_value' => $date['end_date']->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT),
        ]);
        $instance->save();

        return;
      }
    }

    // If the above logic did not trigger, we'll do the regular "remove and
    // recreate eventinstances" logic.
    $this->creationService->clearEventInstances($series);
    $this->creationService->createInstances($series);

  }

}
