<?php

namespace Drupal\dpl_event\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\EntityReferenceFieldItemListInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldFormatter\EntityReferenceLabelFormatter;
use Drupal\recurring_events\Entity\EventInstance;

/**
 * Getting the list-oriented location string for events.
 *
 * @FieldFormatter(
 *   id = "dpl_event_location",
 *   label = @Translation("DPL: Event Location Type"),
 *   field_types = {
 *     "entity_reference"
 *   }
 * )
 */
class EventLocationFormatter extends EntityReferenceLabelFormatter {

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $summary[] = $this->t('Most relevant location, for use in lists.', [], ['context' => 'DPL Event']);
    return $summary;
  }

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

    if (!($items instanceof EntityReferenceFieldItemListInterface)) {
      return [];
    }

    $return = [];

    foreach ($this->getEntitiesToView($items, $langcode) as $entity) {
      $return[] = [
        '#plain_text' => $entity->label(),
      ];
    }

    return $return;
  }

}
