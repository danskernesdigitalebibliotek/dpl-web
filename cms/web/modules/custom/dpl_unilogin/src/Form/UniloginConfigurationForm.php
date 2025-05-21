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

    $form['unilogin_configuration']['unilogin_api_endpoints'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('API endpoints', [], ['context' => 'Unilogin configuration']),
      '#tree' => FALSE,
    ];

    $form['unilogin_configuration']['unilogin_api_endpoints']['unilogin_api_endpoint'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin API endpoint URL.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin API endpoint url.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiEndpoint(),
      '#required' => TRUE,
    ];

    $form['unilogin_configuration']['unilogin_api_endpoints']['unilogin_api_wellknown_endpoint'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin API wellknown endpoint URL', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin API wellknown endpoint url.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiWellknownEndpoint(),
      '#required' => TRUE,
    ];

    $form['unilogin_configuration']['unilogin_api_credentials'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('API credentials', [], ['context' => 'Unilogin configuration']),
      '#tree' => FALSE,
    ];

    $form['unilogin_configuration']['unilogin_api_credentials']['unilogin_api_client_id'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin API client ID.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin API client ID.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiClientId(),
      '#required' => TRUE,
    ];

    $form['unilogin_configuration']['unilogin_api_credentials']['unilogin_api_client_secret'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin API client secret.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin API client secret.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiClientSecret(),
      '#required' => TRUE,
    ];

    $form['unilogin_configuration']['webservice_configuration'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Webservice configuration', [], ['context' => 'Unilogin configuration']),
      '#tree' => FALSE,
    ];

    $form['unilogin_configuration']['webservice_configuration']['unilogin_api_webservice_user_name'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin webservice username.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin webservice username.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiWebServiceUsername(),
      '#required' => TRUE,
    ];

    $form['unilogin_configuration']['webservice_configuration']['unilogin_api_webservice_password'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin webservice password.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin webservice password.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiWebServicePassword(),
      '#required' => TRUE,
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
      '#required' => TRUE,
    ];

    $form['unilogin_configuration']['unilogin_api_municipality_id'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('Unilogin municipality ID.', [], ['context' => 'Unilogin configuration']),
      '#description' => $this->t('The Unilogin municipality ID.', [], ['context' => 'Unilogin configuration']),
      '#default_value' => $this->uniloginConfiguration->getUniloginApiMunicipalityId(),
      '#required' => TRUE,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config($this->configService->getConfigKey())
      ->set('unilogin_api_endpoint', $form_state->getValue('unilogin_api_endpoint'))
      ->set('unilogin_api_wellknown_endpoint', $form_state->getValue('unilogin_api_wellknown_endpoint'))
      ->set('unilogin_api_client_id', $form_state->getValue('unilogin_api_client_id'))
      ->set('unilogin_api_client_secret', $form_state->getValue('unilogin_api_client_secret'))
      ->set('unilogin_api_municipality_id', $form_state->getValue('unilogin_api_municipality_id'))
      ->set('unilogin_api_webservice_user_name', $form_state->getValue('unilogin_api_webservice_user_name'))
      ->set('unilogin_api_webservice_password', $form_state->getValue('unilogin_api_webservice_password'))
      ->set('unilogin_api_pubhub_retailer_key_code', $form_state->getValue('unilogin_api_pubhub_retailer_key_code'))
      ->save();
  }

}
