<?php

namespace Drupal\dpl_event\Plugin\Field\FieldFormatter;

use Drupal\address\Plugin\Field\FieldFormatter\AddressDefaultFormatter;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\node\NodeInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * A custom address field formatter: Get fallback address from branch.
 *
 * E.g. - a branch node can be associated with eventinstances.
 * and that branch may have an address.
 * If it does, we will use this as a fallback, if no custom address is set.
 *
 * @FieldFormatter(
 *   id = "dpl_branch_address",
 *   label = @Translation("DPL: Branch address fallback"),
 *   field_types = {
 *     "address"
 *   }
 * )
 */
class BranchAddressFormatter extends AddressDefaultFormatter {

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $summary[] = $this->t('Use the address from associated branch as fallback.', [], ['context' => 'DPL Event']);
    return $summary;
  }

  /**
   * Looking up connected branch(es) and pulling their addresses.
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $default_return = parent::viewElements($items, $langcode);

    // We don't want to override if a custom address has been set.
    if (!$items->isEmpty()) {
      return $default_return;
    }

    $entity = $items->getEntity();

    if (!($entity instanceof EventInstance) && !($entity instanceof EventSeries)) {
      return $default_return;
    }

    $field = $this->getAddressField($entity);

    if (!$field instanceof FieldItemListInterface) {
      return $default_return;
    }

    return $field->view();
  }

  /**
   * Loading the field if it exists and has a value.
   */
  private function getField(EventSeries|EventInstance $event, string $field_name): ?FieldItemListInterface {
    // First, let's look up the custom field - does it already have a value?
    if ($event->hasField($field_name)) {
      $field = $event->get($field_name);

      if (!$field->isEmpty()) {
        return $field;
      }
    }

    return NULL;
  }

  /**
   * Load an event address - either from the series/instance or branch.
   */
  private function getAddressField(EventSeries|EventInstance $event): ?FieldItemListInterface {
    $address_field_name = ($event instanceof EventSeries) ?
      'field_event_address' : 'event_address';
    $branch_field_name = ($event instanceof EventSeries) ?
      'field_branch' : 'branch';

    $field = $this->getField($event, $address_field_name);

    if ($field instanceof FieldItemListInterface) {
      return $field;
    }

    // Could not find data - look up address from branch instead.
    $branch_field = $this->getField($event, $branch_field_name);

    if (!$branch_field instanceof FieldItemListInterface) {
      return NULL;
    }

    $branch_address_field = 'field_address';
    $branch = $branch_field->referencedEntities()[0] ?? NULL;

    if (!($branch instanceof NodeInterface) || !$branch->hasField($branch_address_field)) {
      return NULL;
    }

    return $branch->get($branch_address_field);
  }

}
