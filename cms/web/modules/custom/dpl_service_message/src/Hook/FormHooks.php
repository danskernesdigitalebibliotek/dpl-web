<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Hook;

use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;

/**
 * Form hooks for dpl_service_message module.
 */
class FormHooks {
  use StringTranslationTrait;

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected AccountProxyInterface $currentUser,
  ) {}

  /**
   * Alter the service message node form.
   *
   * @param array<mixed> $form
   *   The form element.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The ID for the form.
   */
  #[Hook('form_node_service_message_form_alter')]
  #[Hook('form_node_service_message_edit_form_alter')]
  public function alterForm(array &$form, FormStateInterface $form_state, string $form_id): void {
    $this->hideGeneratedTitle($form);
    $this->hideIrrelevantTargets($form);
    $this->restrictGlobalPlacement($form);
    $this->warnAboutReplacement($form, $form_state);
    $this->hideLinkTarget($form);
  }

  /**
   * Hide the "open in new window" checkbox on the link field.
   *
   * `dpl_link_options` adds it to every link widget, but service messages
   * link to the library's own pages, so it is not needed here.
   *
   * @param array<mixed> $form
   *   The form element.
   */
  protected function hideLinkTarget(array &$form): void {
    if (!isset($form['field_svcmsg_link']['widget'][0]['target_blank'])) {
      return;
    }

    $form['field_svcmsg_link']['widget'][0]['target_blank']['#access'] = FALSE;
  }

  /**
   * Hide the title field, as the title is generated on save.
   *
   * @param array<mixed> $form
   *   The form element.
   *
   * @see \Drupal\dpl_service_message\Hook\EntityHooks::generateLabel()
   */
  protected function hideGeneratedTitle(array &$form): void {
    if (!isset($form['title']['widget'][0]['value'])) {
      return;
    }

    $element = &$form['title']['widget'][0]['value'];

    // A placeholder that passes validation. It is replaced on presave.
    $element['#type'] = 'value';
    $element['#value'] = $element['#default_value'] ?? '-';
  }

  /**
   * Only show the front page and branch fields for in-page messages.
   *
   * @param array<mixed> $form
   *   The form element.
   */
  protected function hideIrrelevantTargets(array &$form): void {
    $in_page = [
      ':input[name="field_svcmsg_placement"]' => [
        'value' => ServiceMessagePlacement::InPage->value,
      ],
    ];

    foreach (['field_svcmsg_frontpage', 'field_svcmsg_branches'] as $field) {
      if (isset($form[$field])) {
        $form[$field]['#states']['visible'] = $in_page;
      }
    }
  }

  /**
   * Remove the global placement option for editors without permission.
   *
   * This form is the only place service messages can be created or edited,
   * so it is also the only place the permission needs to be checked.
   *
   * @param array<mixed> $form
   *   The form element.
   */
  protected function restrictGlobalPlacement(array &$form): void {
    if ($this->currentUser->hasPermission('administer global service messages')) {
      return;
    }

    if (!isset($form['field_svcmsg_placement']['widget'])) {
      return;
    }

    $element = &$form['field_svcmsg_placement']['widget'];
    $global = ServiceMessagePlacement::GlobalBar->value;

    // If the message is already global, show that, but don't allow changing
    // it.
    if (($element['#default_value'][0] ?? NULL) === $global) {
      $element['#disabled'] = TRUE;

      return;
    }

    unset($element['#options'][$global]);
  }

  /**
   * Warn that publishing a global message unpublishes the current one.
   *
   * @param array<mixed> $form
   *   The form element.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @see \Drupal\dpl_service_message\Hook\EntityHooks::retireOtherGlobalMessages()
   */
  protected function warnAboutReplacement(array &$form, FormStateInterface $form_state): void {
    if (!isset($form['field_svcmsg_placement']['widget'])) {
      return;
    }

    // No warning if the editor can't choose global placement.
    $global = ServiceMessagePlacement::GlobalBar->value;

    if (!isset($form['field_svcmsg_placement']['widget']['#options'][$global])) {
      return;
    }

    $active = $this->publishedGlobalMessages($this->formNode($form_state));

    if (!$active) {
      return;
    }

    $form['svcmsg_replacement_warning'] = [
      '#type' => 'container',
      '#states' => [
        'visible' => [
          ':input[name="field_svcmsg_placement"]' => ['value' => $global],
        ],
      ],
      '#weight' => ($form['field_svcmsg_placement']['#weight'] ?? 0) + 0.01,
      'message' => [
        '#theme' => 'status_messages',
        '#message_list' => [
          'warning' => [
            $this->t(
              'Publishing this as a site-wide message will unpublish %label, which is site-wide and published now.',
              ['%label' => reset($active)->label()],
              ['context' => 'dpl_service_message']
            ),
          ],
        ],
        '#status_headings' => [
          'warning' => $this->t('Warning message', [], ['context' => 'dpl_service_message']),
        ],
      ],
    ];
  }

  /**
   * Get the node edited by the form.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The node being edited, or NULL if the form is not a node form.
   */
  protected function formNode(FormStateInterface $form_state): ?NodeInterface {
    $form_object = $form_state->getFormObject();

    if (!$form_object instanceof EntityFormInterface) {
      return NULL;
    }

    $entity = $form_object->getEntity();

    return $entity instanceof NodeInterface ? $entity : NULL;
  }

  /**
   * Get the published global messages.
   *
   * @param \Drupal\node\NodeInterface|null $except
   *   A message to leave out, usually the one being edited.
   *
   * @return \Drupal\node\NodeInterface[]
   *   The published global messages.
   */
  protected function publishedGlobalMessages(?NodeInterface $except = NULL): array {
    $storage = $this->entityTypeManager->getStorage('node');

    $query = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', ServiceMessageLoader::BUNDLE)
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('field_svcmsg_placement', ServiceMessagePlacement::GlobalBar->value);

    if ($except && !$except->isNew()) {
      $query->condition('nid', $except->id(), '<>');
    }

    return array_values($storage->loadMultiple($query->execute()));
  }

}
