<?php

namespace Drupal\dpl_library_agency\Entity;

use Drupal\gsearch\AddressGsearchItemInterface;
use Drupal\node\Entity\Node;

/**
 * Bundle class for branch nodes.
 *
 * A branch node is the editorial representation of a library: the page an
 * editor maintains, holding the address, contact details and opening hours
 * that the site and the APIs present to patrons.
 *
 * Not to be confused with \Drupal\dpl_library_agency\Branch\Branch, which
 * represents the same library as it is known to the library system. That one
 * is identified by its ISIL and may or may not have a node attached. This one
 * is the node, which may or may not have an ISIL.
 */
class BranchNode extends Node {

  /**
   * Get the ISIL code identifying the branch in the library system.
   *
   * Only branches registered in the library system have one, so a branch that
   * exists as editorial content alone returns NULL.
   */
  public function getIsilId(): ?string {
    return $this->get('field_agency_branch_id')->getString() ?: NULL;
  }

  /**
   * Get the phone number patrons can reach the branch on.
   */
  public function getPhone(): ?string {
    return $this->get('field_phone')->getString() ?: NULL;
  }

  /**
   * Get the email address patrons can reach the branch on.
   */
  public function getEmail(): ?string {
    return $this->get('field_email')->getString() ?: NULL;
  }

  /**
   * Get the address of the branch, with metadata such as GPS coordinates.
   */
  public function getAddressData(): ?AddressGsearchItemInterface {
    $value = $this->get('field_address_gsearch')->first();

    return ($value instanceof AddressGsearchItemInterface) ? $value : NULL;
  }

}
