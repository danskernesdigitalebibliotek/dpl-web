<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\RedundantEditableConfigNamesTrait;

/**
 * BNF client configuration form.
 */
class SettingsForm extends ConfigFormBase {

  use RedundantEditableConfigNamesTrait;

  const CONFIG_NAME = 'bnf_client.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'bnf_client_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {

    $form['bnf_client'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('BNF configuration'),
      '#tree' => FALSE,
    ];

    $form['bnf_client']['base_url'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('BNF server URL'),
      '#description' => $this->t('For example <em>https://bibliotekernesnationaleformidling.dk/</em>.'),
      '#required' => TRUE,
      '#config_target' => self::CONFIG_NAME . ':base_url',
    ];

    return parent::buildForm($form, $form_state);
  }

}
