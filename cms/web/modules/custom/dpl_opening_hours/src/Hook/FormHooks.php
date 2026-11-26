<?php

declare(strict_types=1);

namespace Drupal\dpl_opening_hours\Hook;

use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_opening_hours\Model\OpeningHoursRepository;
use Drupal\taxonomy\TermInterface;

/**
 * Form hooks for dpl_opening_hours module.
 */
class FormHooks {

  use StringTranslationTrait;

  public function __construct(
    protected OpeningHoursRepository $openingHoursRepository,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Warn that deleting a category also deletes its opening hours.
   *
   * @param array<mixed> $form
   *   The form structure array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_taxonomy_term_opening_hours_categories_delete_form_alter')]
  public function addCategoryDeleteWarning(array &$form, FormStateInterface $form_state): void {
    $form_object = $form_state->getFormObject();
    if (!$form_object instanceof EntityFormInterface) {
      return;
    }

    $term = $form_object->getEntity();
    if (!$term instanceof TermInterface) {
      return;
    }

    $term_id = $term->id();
    if (!is_int($term_id) && !is_string($term_id)) {
      return;
    }

    $term_label = $term->label() ?? '';

    $form['#title'] = $this->t('Are you sure you want to delete all "@term_label" opening hours?', [
      '@term_label' => $term_label,
    ], ['context' => 'Opening Hours']);

    $opening_hours_in_category = $this->openingHoursRepository->loadMultiple(categoryId: (int) $term_id);

    $form['description']['#markup'] = $this->t('@term_label is associated with @count opening hours. Deleting @term_label will also delete these opening hours. Are you sure you want to continue?', [
      '@term_label' => $term_label,
      '@count' => count($opening_hours_in_category),
    ], ['context' => 'Opening Hours']);
  }

}
