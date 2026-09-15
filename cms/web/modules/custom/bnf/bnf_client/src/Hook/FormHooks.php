<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Hook;

use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\Services\BnfImporter;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\node\Form\NodeForm;
use Drupal\node\NodeInterface;
use Psr\Log\LoggerAwareInterface;
use Psr\Log\LoggerAwareTrait;

/**
 * Subscription form hooks.
 */
class FormHooks implements LoggerAwareInterface {

  use StringTranslationTrait;
  use LoggerAwareTrait;

  public function __construct(
    protected AccountInterface $currentUser,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add BNF options to the node edit form.
   *
   * Adds an option to export the node to BNF. If checked, a custom form submit
   * handler will take care of the rest.
   *
   * @see bnf_client_form_node_form_submit()
   *
   * @phpstan-ignore missingType.iterableValue ($form is very free form)
   */
  #[Hook('form_alter')]
  public function nodeFormAlter(array &$form, FormStateInterface $form_state, string $form_id): void {
    $form_object = $form_state->getFormObject();

    if (!($form_object instanceof NodeForm)) {
      return;
    }

    $node = $form_object->getEntity();
    $allowed_cts = BnfImporter::ALLOWED_CONTENT_TYPES;

    if ((!$node instanceof NodeInterface) || !in_array($node->bundle(), $allowed_cts)) {
      return;
    }

    // We want to hide field_tags on GO content for everyone without the
    // 'bnf administer go tags' permission.
    if (str_starts_with($node->bundle(), 'go_') && isset($form['field_tags'])) {
      if (!$this->currentUser->hasPermission('bnf administer go tags')) {
        $form['field_tags']['#access'] = FALSE;
      }
    }

    if (!$this->currentUser->hasPermission('bnf export nodes')) {
      return;
    }

    if (empty($form['actions']['submit'])) {
      $this->logger?->error('Could not find submit button - cannot show BNF export flow.');
      return;
    }

    // When adding the submit handler here, it happens after ::save() and any
    // validation.
    $form['actions']['submit']['#submit'][] = 'bnf_client_form_node_form_submit';

    // Let's hide the publishing button when BNF is checked, as the value will
    // be ignored and the node will be published regardless.
    $form['status']['#states']['invisible'] =
      [':input[name="bnf_export"]' => ['checked' => TRUE]];

    // Getting the BNF state, if it exists.
    $state = BnfStateEnum::None;

    if ($node->hasField(BnfStateEnum::FIELD_NAME) && !$node->get(BnfStateEnum::FIELD_NAME)->isEmpty()) {
      /** @var \Drupal\enum_field\Plugin\Field\FieldType\EnumItemList $state_field */
      $state_field = $node->get(BnfStateEnum::FIELD_NAME);
      $states = $state_field->enums();
      $state = reset($states);
    }

    if (in_array($state, [BnfStateEnum::Imported, BnfStateEnum::LocallyClaimed])) {
      $form['bnf_keep_updated'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Keep updated with Delingstjenesten', [], ['context' => 'BNF']),
        '#description' => $this->t('Keep this content, which originates from Delingstjenesten, up to date when a new version is available. This will overwrite any custom changes you may have made.', [], ['context' => 'BNF']),
        '#default_value' => ($state == BnfStateEnum::Imported),
      ];
    }

    $exportable = ($state == BnfStateEnum::None);

    $form['bnf_export'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Publish and submit to BNF', [], ['context' => 'BNF']),
      '#default_value' => FALSE,
      '#disabled' => !$exportable,
      '#description' => $exportable ?
      $this->t('Please make sure that all content and media as part of this article is OK to be used by other libraries.', [], ['context' => 'BNF']) :
      $this->t('This content cannot be sent to BNF, as it has either been exported or imported already.', [], ['context' => 'BNF']),
    ];
  }

}
