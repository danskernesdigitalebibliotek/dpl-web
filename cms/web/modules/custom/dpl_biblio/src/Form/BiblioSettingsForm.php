<?php

declare(strict_types=1);

namespace Drupal\dpl_biblio\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\RedundantEditableConfigNamesTrait;

/**
 * Biblio adapter setting form.
 */
class BiblioSettingsForm extends ConfigFormBase {

  use RedundantEditableConfigNamesTrait;

  const CONFIG_NAME = 'dpl_biblio.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_biblio_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Dpl Biblio']),
      '#tree' => FALSE,
    ];

    $form['settings']['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use the Biblio adapter for digital materials', [], ['context' => 'Dpl Biblio']),
      '#description' => $this->t('When enabled the web apps will use the Biblio adapter instead of Publizon. Leave disabled to keep using Publizon.', [], ['context' => 'Dpl Biblio']),
      '#config_target' => self::CONFIG_NAME . ':enabled',
    ];

    return parent::buildForm($form, $form_state);
  }

}
