<?php

namespace Drupal\dpl_unilogin\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_unilogin\UniloginConfiguration;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * UniLogin configuration form.
 */
class UniloginConfigurationForm extends ConfigFormBase {

  /**
   * Constructs a \Drupal\system\ConfigFormBase object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   The instant loan config service.
   * @param \Drupal\dpl_unilogin\UniloginConfiguration $uniloginConfiguration
   *   The DPL fee settings.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    protected DplReactConfigInterface $configService,
    protected UniloginConfiguration $uniloginConfiguration,
  ) {
    parent::__construct($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_unilogin.settings'),
      \Drupal::service('dpl_unilogin.settings'),
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      $this->configService->getConfigKey(),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_unilogin_configuration_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {

    $form['unilogin_configuration'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Unilogin API configuration', [], ['context' => 'Unilogin configuration']),
      '#tree' => FALSE,
    ];

    $form['unilogin_configuration']['unilogin_api_credentials'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('API credentials', [], ['context' => 'Unilogin configuration']),
      '#tree' => FALSE,
    ];

    $form['unilogin_configuration']['unilogin_api_credentials']['unilogin_api_client_secret'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin API client secret.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin API client secret.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiClientSecret(),
    ];

    $form['unilogin_configuration']['webservice_configuration'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Webservice configuration', [], ['context' => 'Unilogin configuration']),
      '#tree' => FALSE,
    ];

    $form['unilogin_configuration']['webservice_configuration']['unilogin_api_webservice_username'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin webservice username.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin webservice username.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiWebServiceUsername(),
    ];

    $form['unilogin_configuration']['webservice_configuration']['unilogin_api_webservice_password'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin webservice password.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin webservice password.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiWebServicePassword(),
    ];

    $form['unilogin_configuration']['pubhub_configuration'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('PubHub configuration', [], ['context' => 'Unilogin configuration']),
      '#tree' => FALSE,
    ];

    $form['unilogin_configuration']['pubhub_configuration']['unilogin_api_pubhub_retailer_key_code'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Retailer key code.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The PubHub retailer key code.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiPubhubRetailerKeyCode(),
    ];

    $form['unilogin_configuration']['unilogin_api_municipality_id'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin municipality ID.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin municipality ID.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiMunicipalityId(),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config($this->configService->getConfigKey())
      ->set('unilogin_api_client_secret', $form_state->getValue('unilogin_api_client_secret') ?? NULL)
      ->set('unilogin_api_webservice_username', $form_state->getValue('unilogin_api_webservice_username') ?? NULL)
      ->set('unilogin_api_webservice_password', $form_state->getValue('unilogin_api_webservice_password') ?? NULL)
      ->set('unilogin_api_pubhub_retailer_key_code', $form_state->getValue('unilogin_api_pubhub_retailer_key_code') ?? NULL)
      ->set('unilogin_api_municipality_id', $form_state->getValue('unilogin_api_municipality_id') ?? NULL)
      ->save();
  }

}
