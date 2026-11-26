<?php

declare(strict_types=1);

namespace Drupal\dpl_library_agency\Hook;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\node\Form\NodeForm;
use Drupal\node\NodeInterface;

/**
 * Form hooks for dpl_library_agency module.
 */
class FormHooks {

  use StringTranslationTrait;

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add unique agency branch ID validation to branch node forms.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_node_branch_form_alter')]
  #[Hook('form_node_branch_edit_form_alter')]
  public function addBranchIdValidation(array &$form, FormStateInterface $form_state): void {
    $form['#validate'][] = static::class . ':validateUniqueBranchId';
  }

  /**
   * Ensure that the agency branch ID isn't used by any other node.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function validateUniqueBranchId(array &$form, FormStateInterface $form_state): void {
    $form_object = $form_state->getFormObject();

    if (!($form_object instanceof NodeForm)) {
      return;
    }

    $user_input = $form_state->getUserInput();
    $branch_id = $user_input['field_agency_branch_id'] ?? NULL;

    if (empty($branch_id)) {
      return;
    }

    $current_node = $form_object->getEntity();

    if (!($current_node instanceof NodeInterface)) {
      return;
    }

    /** @var \Drupal\node\NodeInterface[] $used_nodes */
    $used_nodes = $this->entityTypeManager->getStorage('node')->loadByProperties([
      'field_agency_branch_id' => $branch_id,
    ]);

    foreach ($used_nodes as $used_node) {
      if ($used_node->id() !== $current_node->id()) {
        $form_state->setErrorByName(
          'field_agency_branch_id',
          $this->t('This agency branch ID is already in use by @title', ['@title' => (string) $used_node->label()], ['context' => 'dpl_library_agency']),
        );
        return;
      }
    }
  }

}
