<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Hook;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\AdminContext;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;

/**
 * Drupal hooks for the module. Modern alternative to .module file.
 */
class DplServiceMessageHooks {
  use StringTranslationTrait;

  /**
   * The longest generated label, in characters.
   */
  protected const LABEL_LENGTH = 60;

  public function __construct(
    protected ServiceMessageLoader $loader,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected AccountProxyInterface $currentUser,
    protected AdminContext $adminContext,
  ) {}

  /**
   * Place the service messages that belong on the page being rendered.
   *
   * The theme prints service_message_global above the header and
   * service_messages between the header and the page content.
   *
   * @param array<mixed> $variables
   *   The variables for the page template.
   */
  #[Hook('preprocess_page')]
  public function preprocessPage(array &$variables): void {
    // The admin theme prints neither, and this runs on every uncached page.
    if ($this->adminContext->isAdminRoute()) {
      return;
    }

    $variables['service_message_global'] = $this->loader->buildGlobal();
    $variables['service_messages'] = $this->loader->buildInPage();
  }

  /**
   * Give a service message the label that the editor never types.
   *
   * The design wants body-only messages, but node titles are mandatory and
   * every core UI needs something to show, so the label is derived from the
   * content instead of asked for.
   */
  #[Hook('node_presave')]
  public function generateLabel(NodeInterface $node): void {
    if ($node->bundle() !== ServiceMessageLoader::BUNDLE) {
      return;
    }

    // ->value, not ->getString(): the latter joins every property of the
    // field item, so a formatted text field hands back "the text, limited".
    $heading = trim((string) ($node->get('field_svcmsg_heading')->value ?? ''));
    $body = trim(strip_tags((string) ($node->get('field_svcmsg_body')->value ?? '')));
    $label = $heading ?: $body;

    if ($label === '') {
      // Nothing to derive from. The content constraint rejects this on the
      // form; a programmatic save gets a label it can be found by.
      $label = (string) $this->t('Service message', [], ['context' => 'dpl_service_message']);
    }

    $node->setTitle(Unicode::truncate($label, self::LABEL_LENGTH, TRUE, TRUE));
  }

  /**
   * Keep at most one global service message published.
   *
   * Enforced on the save of the published message rather than at validation:
   * scheduler publishes on cron, long after any form was submitted, so
   * nothing at save time can see that two future windows overlap.
   */
  #[Hook('node_insert')]
  #[Hook('node_update')]
  public function retireOtherGlobalMessages(NodeInterface $node): void {
    if ($node->bundle() !== ServiceMessageLoader::BUNDLE || !$node->isPublished()) {
      return;
    }

    if ($node->get('field_svcmsg_placement')->getString() !== ServiceMessagePlacement::GlobalBar->value) {
      return;
    }

    $storage = $this->entityTypeManager->getStorage('node');

    $ids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', ServiceMessageLoader::BUNDLE)
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('field_svcmsg_placement', ServiceMessagePlacement::GlobalBar->value)
      ->condition('nid', $node->id(), '<>')
      ->execute();

    foreach ($storage->loadMultiple($ids) as $other) {
      // Replaced, not deleted - the editor can publish it again later.
      $other->setUnpublished();
      $other->save();
    }
  }

  /**
   * Adapt the edit form to the placement the editor picks.
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
   * Take the "open in new window" checkbox off the link field.
   *
   * `dpl_link_options` adds it to every field that uses the widget. Neither
   * KB-43 nor the design asks for it here, and a service message links to
   * the library's own page for what it concerns, so it is left out rather
   * than shipped as a choice nobody specified.
   *
   * `#access` rather than unset: an inaccessible element keeps its default
   * value, so a message that was already set to open in a new window is not
   * silently changed by the next save.
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
   * Hide the title field, which the label generation fills in.
   *
   * @param array<mixed> $form
   *   The form element.
   */
  protected function hideGeneratedTitle(array &$form): void {
    if (!isset($form['title']['widget'][0]['value'])) {
      return;
    }

    $element = &$form['title']['widget'][0]['value'];

    // A value the entity validation accepts. generateLabel() overwrites it
    // with the real label before the node is written.
    $element['#type'] = 'value';
    $element['#value'] = $element['#default_value'] ?? '-';
  }

  /**
   * Show the in-page targeting only when the message is placed in a page.
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
   * Take the global option away from editors who may not use it.
   *
   * A global message is red, says "alert" and appears on every page, so it
   * sits behind its own permission. The matching constraint covers the
   * saves that never pass through this form.
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

    // Leave the option in place on a message that is already global, so the
    // form still shows what it is rather than silently switching it.
    if (($element['#default_value'][0] ?? NULL) === $global) {
      $element['#disabled'] = TRUE;

      return;
    }

    unset($element['#options'][$global]);
  }

  /**
   * Warn that publishing a global message retires the one now showing.
   *
   * The rule itself is enforced on the save, not here - scheduler publishes
   * messages on cron, long after any form was open. This is the
   * editor-facing half: what will happen, before it happens.
   *
   * @param array<mixed> $form
   *   The form element.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  protected function warnAboutReplacement(array &$form, FormStateInterface $form_state): void {
    if (!isset($form['field_svcmsg_placement']['widget'])) {
      return;
    }

    // Nothing to warn about when the editor cannot pick site-wide at all.
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
      // Only while site-wide is the selected placement - the warning is about
      // what that choice does, and says nothing about an in-page message.
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
   * The node the given form edits, if it edits one.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The node being edited, or NULL on a form that has none.
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
   * The global messages that are published right now.
   *
   * @return \Drupal\node\NodeInterface[]
   *   The messages currently occupying the global bar.
   */
  protected function publishedGlobalMessages(?NodeInterface $except = NULL): array {
    $storage = $this->entityTypeManager->getStorage('node');

    $query = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', ServiceMessageLoader::BUNDLE)
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('field_svcmsg_placement', ServiceMessagePlacement::GlobalBar->value);

    // A message does not replace itself.
    if ($except && !$except->isNew()) {
      $query->condition('nid', $except->id(), '<>');
    }

    return array_values($storage->loadMultiple($query->execute()));
  }

  /**
   * Implements hook_theme().
   *
   * @return array<string, mixed>
   *   The theme hooks the module defines.
   */
  #[Hook('theme')]
  public function theme(): array {
    return [
      'dpl_service_message_bar' => [
        'variables' => ['message' => []],
      ],
      'dpl_service_messages' => [
        'variables' => ['messages' => []],
      ],
    ];
  }

  /**
   * Weigh the fields of a service message against each other.
   *
   * The rules span several fields, so they attach to the node entity type
   * rather than to a field, and skip the bundles they do not apply to.
   *
   * @param array<string, \Drupal\Core\Entity\EntityTypeInterface> $entity_types
   *   The entity types, keyed by ID.
   */
  #[Hook('entity_type_alter')]
  public function addConstraints(array &$entity_types): void {
    $node = $entity_types['node'] ?? NULL;

    if (!$node instanceof EntityTypeInterface) {
      return;
    }

    $node->addConstraint('ServiceMessageContent');
    $node->addConstraint('GlobalPlacementAccess');
  }

}
