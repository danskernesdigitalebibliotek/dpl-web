<?php

declare(strict_types=1);

namespace Drupal\dpl_protected_nodes\Hook;

use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;

/**
 * Form hooks for dpl_protected_nodes module.
 */
class FormHooks {

  use StringTranslationTrait;

  public function __construct(
    protected ModuleHandlerInterface $moduleHandler,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Prevent deleting a node that is used in configuration.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_node_confirm_form_alter')]
  public function protectNode(array &$form, FormStateInterface $form_state): void {
    $form_object = $form_state->getFormObject();
    if ($form_object instanceof EntityFormInterface) {
      /** @var \Drupal\node\NodeInterface $node */
      $node = $form_object->getEntity();

      $form = $this->disableDeleteOfProtectedNodes([$node->id() => $node->getTitle()], $form);
    }
  }

  /**
   * Prevent bulk deleting nodes that are used in configuration.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_node_delete_multiple_confirm_form_alter')]
  public function protectNodes(array &$form, FormStateInterface $form_state): void {
    $items = $form['entities']['#items'];
    $nodes = [];

    foreach ($items as $key => $value) {
      $key = explode(':', $key, 2);
      $nodes[$key[0]] = $value;
    }

    $form = $this->disableDeleteOfProtectedNodes($nodes, $form);
  }

  /**
   * Checks if node is protected and alters the delete confirm form accordingly.
   *
   * @param mixed[] $nodes
   *   Node titles keyed by node id.
   * @param mixed[] $form
   *   The form array to alter.
   *
   * @return mixed[]
   *   The altered form array.
   */
  protected function disableDeleteOfProtectedNodes(array $nodes, array $form): array {
    $protected_nodes = $this->moduleHandler->invokeAll('dpl_protected_nodes_get_protected_nodes');

    foreach ($protected_nodes as $key => $value) {
      if (array_key_exists($value['node_id'], $nodes)) {

        $form['actions']['submit']['#disabled'] = TRUE;

        $form['protected_node'][$value['node_id']]['description'] = [
          '#markup' => $this->t('<br /><br />"@title" is being used in configuration. Before you can delete it, you need to remove it from the following configuration fields:', [
            '@title' => $nodes[$value['node_id']],
          ]),
        ];

        $form['protected_node'][$value['node_id']]['configuration'][$key] = [
          '#markup' => $this->t('<br /><a href=":url">@title</a>', [
            '@title' => $value['config_title'],
            ':url' => $value['config_path'],
          ]),
        ];
      }
    }

    return $form;
  }

}
