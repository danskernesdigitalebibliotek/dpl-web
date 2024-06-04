<?php

namespace Drupal\dpl_event\Plugin\Field\FieldFormatter;

use Drupal\address\Plugin\Field\FieldFormatter\AddressDefaultFormatter;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\dpl_event\EventWrapper;
use Drupal\recurring_events\Entity\EventInstance;

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

    if (!($entity instanceof EventInstance)) {
      return $default_return;
    }

    $wrapper = new EventWrapper($entity);
    $field = $wrapper->getAddressField();

    if (!$field instanceof FieldItemListInterface) {
      return $default_return;
    }

    return $field->view();
  }

}
