<?php

namespace Drupal\dpl_opening_hours\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;

/**
 * Defines OpeningHoursEditorController class.
 */
class OpeningHoursEditorController extends ControllerBase {

  /**
   * Display the opening hours app.
   *
   * @param int $node
   *   The node ID.
   *
   * @return mixed[]
   *   The app render array.
   */
  public function content(int $node): array {
    $nodeStorage = $this->entityTypeManager()->getStorage('node');
    $nodeEntity = $nodeStorage->load($node);

    if (!$nodeEntity instanceof NodeInterface || $nodeEntity->getType() !== 'branch') {
      return [];
    }

    $taxonomyStorage = $this->entityTypeManager()->getStorage('taxonomy_term');
    $openingHoursCategories = $taxonomyStorage->loadByProperties([
      "vid" => "opening_hours_categories",
    ]);

    return [
      '#theme' => 'dpl_react_app',
      '#name' => 'opening-hours-editor',
      '#data' => [
        'opening-hours-editor-categories-config' => $this->buildOpeningHoursCategoriesArray($openingHoursCategories),
        'opening-hours-branch-id-config' => $nodeEntity->id(),
        'opening-hours-remove-event-button-text' => $this->t('Remove event'),
        'opening-hours-event-form-title-text' => $this->t('Title'),
        'opening-hours-event-form-start-time-text' => $this->t('Start time'),
        'opening-hours-event-form-end-time-text' => $this->t('End time'),
        'opening-hours-event-form-submit-text' => $this->t('Save'),
      ],
    ];
  }

  /**
   * Build the opening hours categories array.
   *
   * @param \Drupal\taxonomy\TermInterface[] $openingHoursCategories
   *   Array of opening hours categories.
   *
   * @return array<array{'title': string, "color": string}>
   *   Array of category details.
   */
  private function buildOpeningHoursCategoriesArray(array $openingHoursCategories): array {
    $categoriesArray = [];
    foreach ($openingHoursCategories as $category) {
      $categoriesArray[] = [
        'title' => $category->getName(),
        'color' => $this->getOpeningHoursColor($category),
      ];
    }
    return $categoriesArray;
  }

  /**
   * Get the color for the opening hours category.
   *
   * This method retrieves the color specified in the
   * 'field_opening_hours_color' of a taxonomy term.
   *
   * @param \Drupal\taxonomy\TermInterface $category
   *   The taxonomy term for the opening hours category.
   *
   * @return string
   *   The opening hours color.
   */
  private function getOpeningHoursColor(TermInterface $category): string {
    /** @var \Drupal\Core\Field\FieldItemInterface $firstItem */
    $firstItem = $category->get('field_opening_hours_color')->first();
    return $firstItem->get('color')->getString();
  }

  /**
   * Check access for a specific node.
   *
   * @param int $node
   *   The node ID.
   *
   * @return \Drupal\Core\Access\AccessResult
   *   The access result.
   */
  public function access(int $node): AccessResult {
    $nodeStorage = $this->entityTypeManager()->getStorage('node');
    $nodeEntity = $nodeStorage->load($node);

    if ($nodeEntity instanceof NodeInterface && $nodeEntity->getType() === 'branch') {
      return AccessResult::allowed();
    }
    else {
      return AccessResult::forbidden();
    }
  }

}
