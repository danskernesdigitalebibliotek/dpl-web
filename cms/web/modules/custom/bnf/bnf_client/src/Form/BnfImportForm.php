<?php

namespace Drupal\bnf_client\Form;

use Drupal\Component\Uuid\Uuid;
use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use function Safe\get_meta_tags;

/**
 * An import form, letting editors input URL or UUID from BNF.
 */
class BnfImportForm implements FormInterface, ContainerInjectionInterface {
  use StringTranslationTrait;

  use AutowireTrait;

  /**
   * {@inheritDoc}
   */
  public function getFormId(): string {
    return 'bnf_initial_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['#title'] = $this->t('Import nodes from BNF', [], ['context' => 'BNF']);
    $form['reference'] = [
      '#type' => 'textfield',
      '#title' => $this->t('URL or UUID of content'),
    ];

    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Preview content'),
    ];

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $reference = $form_state->getValue('reference');
    $uuid = $this->parseAndValidateUuid($reference);

    if (empty($uuid)) {
      $form_state->setErrorByName(
        'reference',
        $this->t('Invalid URL or UUID.', [], ['context' => 'BNF'])
      );
    }

    $form_state->set('uuid', $uuid);
  }

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $uuid = $form_state->get('uuid');
    $form_state->setRedirect('bnf_client.import_confirm_form', ['uuid' => $uuid]);
  }

  /**
   * Getting and validate a UUID from string or URL.
   */
  protected function parseAndValidateUuid(string $reference): string|false {
    try {
      // Detect if reference is a URL.
      if (filter_var($reference, FILTER_VALIDATE_URL)) {
        // Finding the metatag that contains the UUID.
        $meta_tags = get_meta_tags($reference);
        $reference = $meta_tags['uuid'] ?? NULL;
      }

      return Uuid::isValid((string) $reference) ? $reference : FALSE;
    }
    catch (\Exception) {
      return FALSE;
    }
  }

}
