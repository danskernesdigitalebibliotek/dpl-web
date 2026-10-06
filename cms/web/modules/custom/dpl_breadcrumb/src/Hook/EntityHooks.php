<?php

declare(strict_types=1);

namespace Drupal\dpl_breadcrumb\Hook;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_breadcrumb\Services\BreadcrumbHelper;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\TermInterface;

/**
 * Entity hooks for dpl_breadcrumb module.
 */
class EntityHooks {

  /**
   * Overrides structure data for nodes saved in breadcrumb tree.
   *
   * When saving a node, check if it belongs to the breadcrumb tree. If it
   * does, override any manual settings with a reference to the breadcrumb's
   * parent.
   *
   * @param \Drupal\node\Entity\Node $node
   *   The node entity.
   */
  #[Hook('node_presave')]
  public function overrideNodeBreadcrumbParentOnPresave(Node $node): void {
    $service = DrupalTyped::service(BreadcrumbHelper::class, 'dpl_breadcrumb.breadcrumb_helper');

    $field_name = $service->getStructureFieldName();

    if (!$node->hasField($field_name)) {
      return;
    }

    $breadcrumb_item = $service->getBreadcrumbItem($node);

    // We did not find the node in the tree - quit out.
    if (!($breadcrumb_item instanceof TermInterface)) {
      return;
    }

    // We need to find the parent of the breadcrumb item, as this is actually
    // what we want the field to be set to.
    // The reason we want to set it to the parent, is that it is the correct
    // logic, for making sure this node shows up in the correct automatic
    // breadcrumb lists.
    $breadcrumb_parent = $service->getStructureParent($breadcrumb_item);

    $node->set($field_name, [$breadcrumb_parent?->id()]);
  }

  /**
   * Resaves nodes linked to the term upon insertion/deletion.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   The term entity.
   */
  #[Hook('taxonomy_term_insert')]
  #[Hook('taxonomy_term_update')]
  public function resaveNodesOnBreadcrumbTermUpdate(TermInterface $term): void {
    $service = DrupalTyped::service(BreadcrumbHelper::class, 'dpl_breadcrumb.breadcrumb_helper');

    if ($term->bundle() !== $service->getStructureVid() || !$term->hasField('field_content')) {
      return;
    }

    $contents = $term->get('field_content')->referencedEntities();

    foreach ($contents as $content) {
      if (!($content instanceof FieldableEntityInterface)) {
        continue;
      }

      $content->save();
    }
  }

}
