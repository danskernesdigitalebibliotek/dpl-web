<?php

namespace Drupal\dpl_event\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldFormatter\StringFormatter;
use Drupal\recurring_events\Entity\EventInstance;

/**
 * Getting the most relevant location simple string for events.
 *
 * @FieldFormatter(
 *   id = "dpl_event_location",
 *   label = @Translation("DPL: Event Location Type"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class EventLocationFormatter extends StringFormatter {

  /**
   * Getting relevant location field.
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $entity = $items->getEntity();

    $location_type_field_name = ($entity instanceof EventInstance) ?
      'event_location_type' : 'field_event_location_type';

    if ($entity->hasField($location_type_field_name)) {
      $location_type_field = $entity->get($location_type_field_name);
      if ($location_type_field->getString() === 'online') {
        return $location_type_field->view('full');
      }
    }

    $location_field_name = ($entity instanceof EventInstance) ?
      'event_location' : 'field_event_location';

    $default_return = parent::viewElements($items, $langcode);

    if ($entity->hasField($location_field_name)) {
      $location_field = $entity->get($location_field_name);
      $location = $location_field->getString();

      if (!empty($location) && !ctype_space($location)) {
        return $default_return;
      }
    }

    $branch_field_name = ($entity instanceof EventInstance) ?
      'branch' : 'field_branch';

    if ($entity->hasField($branch_field_name)) {
      $branch_field = $entity->get($branch_field_name);

      return $branch_field->view('card');
    }

    return $default_return;
  }

}
