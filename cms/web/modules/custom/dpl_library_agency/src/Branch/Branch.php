<?php

namespace Drupal\dpl_library_agency\Branch;

use Drupal\address_dawa\AddressDawaItemInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\node\NodeInterface;

/**
 * Value object representing a branch in an agency.
 *
 * In this context the branch is a library (typically with a physical location)
 * within a library organization (typically a municipality).
 *
 * A branch is identified by an id which will typically be an ISIL code.
 * See https://vip.dbc.dk/lister.php?vis=folk_alle for a full list.
 *
 * Example: The branch Nørrebro Bibliotek in the Copenhagen libraries has
 * the following values:
 *
 * Title: Nørrebro Bibliotek
 * Id: DK-710111
 */
class Branch {

  /**
   * Constructor.
   *
   * @param string $id
   *   The id of the library. Typically an ISIL code.
   * @param string $title
   *   The title of the library.
   */
  public function __construct(
    public string $id,
    public string $title,
  ) {}

  /**
   * Getting a (possibly) associated Drupal 'branch' node.
   *
   * @return ?NodeInterface
   *   A branch node if available.
   */
  public function getNode(): ?NodeInterface {
    $entity_type_manager = DrupalTyped::service(EntityTypeManagerInterface::class, 'entity_type.manager');

    $storage = $entity_type_manager->getStorage('node');
    $nodes = $storage->loadByProperties([
      'type' => 'branch',
      'field_agency_branch_id' => $this->id,
    ]);

    $node = reset($nodes);
    return ($node instanceof NodeInterface) ? $node : NULL;
  }

  /**
   * Getting address data of a branch, set on a possible Drupal node.
   *
   * @return \Drupal\address_dawa\AddressDawaItemInterface|null
   *   The address field, along with metadata such as GPS coordinates.
   */
  public function getAddressData(): ?AddressDawaItemInterface {
    $node = $this->getNode();

    if (!($node) || !$node->hasField('field_address_dawa')) {
      return NULL;
    }

    $field = $node->get('field_address_dawa');

    if ($field->isEmpty()) {
      return NULL;
    }

    $value = $field->first();

    return ($value instanceof AddressDawaItemInterface) ? $value : NULL;
  }

}
