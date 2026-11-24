<?php

declare(strict_types=1);

namespace Drupal\dpl_opening_hours\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_opening_hours\Model\OpeningHoursRepository;
use Drupal\taxonomy\TermInterface;

/**
 * Entity hooks for dpl_opening_hours module.
 */
class EntityHooks {

  public function __construct(
    protected OpeningHoursRepository $openingHoursRepository,
  ) {}

  /**
   * Delete the opening hours of a category when the category is deleted.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   The term being deleted.
   */
  #[Hook('taxonomy_term_predelete')]
  public function deleteCategoryOpeningHours(TermInterface $term): void {
    if ($term->bundle() !== 'opening_hours_categories') {
      return;
    }

    $term_id = $term->id();
    if (!is_int($term_id) && !is_string($term_id)) {
      return;
    }

    $opening_hours_in_category = $this->openingHoursRepository->loadMultiple(categoryId: (int) $term_id);

    foreach ($opening_hours_in_category as $instance) {
      if ($instance->id) {
        $this->openingHoursRepository->delete($instance->id, $instance->repetition->id);
      }
    }
  }

}
