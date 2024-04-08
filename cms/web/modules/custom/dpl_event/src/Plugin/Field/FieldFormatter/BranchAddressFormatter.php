<?php

namespace Drupal\dpl_event\Plugin\Field\FieldFormatter;

use Drupal\address\Plugin\Field\FieldFormatter\AddressDefaultFormatter;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\node\NodeInterface;

/**
 * A custom address field formatter: Get fallback address from branch.
 *
 * E.g. - a branch node can be associated with some content (such as events),
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

    // Does the current entity even have a branch field?
    // Otherwise, we return the standard viewElements.
    if (!$entity->hasField('field_branch') || $entity->get('field_branch')->isEmpty()) {
      return $default_return;
    }

    // Getting the branch entities.
    $branches = $entity->get('field_branch')->referencedEntities();
    $addresses = [];

    // Looping through all the connected branches, and if they have an address,
    // we create it as a render array.
    foreach ($branches as $branch) {
      if (!($branch instanceof NodeInterface) || !$branch->hasField('field_address')) {
        continue;
      }

      $addresses[] = $branch->get('field_address')->view();
    }

    // If we didn't find any addresses, we'll just use whatever already exists.
    if (empty($addresses)) {
      return $default_return;
    }

    return $addresses;
  }

}
