<?php

declare(strict_types=1);

namespace Drupal\dpl_breadcrumb\Hook;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Url;
use Drupal\dpl_breadcrumb\Services\BreadcrumbHelper;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;

/**
 * Form hooks for dpl_breadcrumb module.
 */
class FormHooks {

  /**
   * Adds the rendered referencing nodes to the taxonomy term form.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param string $form_id
   *   The unique identifier of the form.
   */
  #[Hook('form_taxonomy_term_breadcrumb_structure_form_alter')]
  public function addBreadcrumbChildrenToForm(array &$form, FormStateInterface $form_state, string $form_id): void {
    $service = DrupalTyped::service(BreadcrumbHelper::class, 'dpl_breadcrumb.breadcrumb_helper');

    $breadcrumb_item = \Drupal::routeMatch()->getParameter('taxonomy_term');

    if (!($breadcrumb_item instanceof TermInterface)) {
      return;
    }

    $form['breadcrumb_children'] = [
      '#type' => 'details',
      '#title' => t('Content that has set this breadcrumb as a parent', [], ['context' => 'DPL admin UX']),
      '#weight' => 5,
      'items' => $service->getRenderedReferencingNodes($breadcrumb_item, 'teaser'),
    ];
  }

  /**
   * Alter the node edit form and delete form for breadcrumb constraints.
   *
   * Detects if the current node already exists in the content structure.
   * If it does, we do not want the editor to be able to change it, as it will
   * be overwritten in the save() hook.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  #[Hook('form_alter')]
  public function lockNodeEditOrDeleteForm(array &$form, FormStateInterface $form_state, string $form_id): void {
    if (str_starts_with($form_id, 'node_') && str_ends_with($form_id, '_delete_form')) {
      $this->alterDeleteConfirm($form, $form_state, $form_id);
    }

    if (str_starts_with($form_id, 'node_') && str_ends_with($form_id, '_edit_form')) {
      $this->alterNodeForm($form, $form_state, $form_id);
    }
  }

  /**
   * Alter the node-confirmation form, adding warning if relevant.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  protected function alterDeleteConfirm(array &$form, FormStateInterface $form_state, string $form_id): void {
    $service = DrupalTyped::service(BreadcrumbHelper::class, 'dpl_breadcrumb.breadcrumb_helper');
    $node = \Drupal::routeMatch()->getParameter('node');

    if (!($node instanceof NodeInterface)) {
      return;
    }

    $breadcrumb_item = $service->getBreadcrumbItem($node);

    if (!$breadcrumb_item) {
      return;
    }

    // Overwrite the existing description.
    $form['description'] = [
      '#weight' => -10,
      '#markup' => t(
          '<p>You are about to delete <strong>"@title"</strong>. This page is linked to the breadcrumb <strong>"@breadcrumb_title"</strong>.
          <br>You cannot delete this content until you replace the page in the "Content to link to" field in <strong>"@breadcrumb_title"</strong>.
          <br><strong><a href="@breadcrumb_edit_url" target="_blank">Edit the breadcrumb "@breadcrumb_title"</a></strong></p>',
          [
            '@title' => $node->label(),
            '@breadcrumb_title' => $breadcrumb_item->getName(),
            '@breadcrumb_edit_url' => Url::fromRoute('entity.taxonomy_term.edit_form', ['taxonomy_term' => $breadcrumb_item->id()])->toString(),
          ],
          ['context' => 'DPL admin UX']
      ),
    ];

    // Disable the delete button. Technically, the editor still have access to
    // delete the content, but if they do find a way around it, then it is their
    // own 'problem' as this is a helping functionality.
    $form['actions']['submit']['#disabled'] = TRUE;
  }

  /**
   * Alters node edit form to lock structure field.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  protected function alterNodeForm(array &$form, FormStateInterface $form_state, string $form_id): void {
    $service = DrupalTyped::service(BreadcrumbHelper::class, 'dpl_breadcrumb.breadcrumb_helper');
    $field_name = $service->getStructureFieldName();

    if (empty($form[$field_name]['widget'])) {
      return;
    }

    $field = &$form[$field_name]['widget'];
    $node = \Drupal::routeMatch()->getParameter('node');
    $breadcrumb_item = $service->getBreadcrumbItem($node);

    // If this node exists in the structure tree, we want to override data.
    if ($breadcrumb_item) {
      $breadcrumb_parent = $service->getStructureParent($breadcrumb_item);

      $field['#disabled'] = TRUE;
      $field['#default_value'] = [$breadcrumb_parent?->id()];
      $field['#description'] = t('TODO - A text that describes that this node already exists in the content structure and cannot be edited.', [], ['context' => 'DPL Breadcrumbs']);
    }
  }

}
