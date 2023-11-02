<?php

namespace Drupal\dpl_fees\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_fees\DplFeesSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Menu setting form.
 */
class FeesListSettingsForm extends ConfigFormBase {

  /**
   * Constructs a \Drupal\system\ConfigFormBase object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   The instant loan config service.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    protected DplReactConfigInterface $configService
  ) {
    $this->setConfigFactory($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_fees.settings')
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
    return 'fee_list_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->loadConfig();

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings'),
      '#tree' => FALSE,
    ];

    $form['settings']['fees_and_replacement_costs_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Fees and Replacement costs URL'),
      '#description' => $this->t('File or URL containing the fees and replacement costs'),
      '#default_value' => $config->get('fees_and_replacement_costs_url') ?? DplFeesSettings::FEES_AND_REPLACEMENT_COSTS_URL,
    ];

    $form['settings']['available_payment_types_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Available payment types url'),
      '#default_value' => $config->get('available_payment_types_url') ?? DplFeesSettings::AVAILABLE_PAYMENT_TYPES_URL,
    ];

    $form['settings']['terms_of_trade_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Terms of trade text'),
      '#description' => $this->t('Terms of trade text'),
      '#default_value' => $config->get('terms_of_trade_text') ?? DplFeesSettings::TERMS_OF_TRADE_TEXT,
    ];

    $form['settings']['terms_of_trade_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Terms of trade redirect url'),
      '#default_value' => $config->get('terms_of_trade_url') ?? DplFeesSettings::TERMS_OF_TRADE_URL,
    ];

    $form['settings']['page_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size mobile', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config->get('page_size_mobile') ?? DplFeesSettings::PAGE_SIZE_MOBILE,
      '#min' => 0,
      '#step' => 1,
    ];

    $form['settings']['page_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size desktop', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config->get('page_size_desktop') ?? DplFeesSettings::PAGE_SIZE_DESKTOP,
      '#min' => 0,
      '#step' => 1,
    ];

    // @todo images to be done in future render.
    $form['settings']['image'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Payment options image'),
      '#description' => $this->t('Image containing the available payment options (300x35)'),
      '#default_value' => $config->get('image') ?? '',
    ];

    $form['settings']['payment_overview_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Payment overview url'),
      '#default_value' => $config->get('payment_overview_url') ?? DplFeesSettings::PAYMENT_OVERVIEW_URL,
    ];

    $form['settings']['fee_list_body_text'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Intro text'),
      '#description' => $this->t('Display an intro-text below the headline'),
      '#default_value' => $config->get('fee_list_body_text') ?? $this->t('Fees and replacement costs are handled through the new system "Mit betalingsoverblik.'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config($this->configService->getConfigKey())
      ->set('fees_and_replacement_costs_url', $form_state->getValue('fees_and_replacement_costs_url'))
      ->set('terms_of_trade_text', $form_state->getValue('terms_of_trade_text'))
      ->set('terms_of_trade_url', $form_state->getValue('terms_of_trade_url'))
      ->set('payment_overview_url', $form_state->getValue('payment_overview_url'))
      ->set('fee_list_body_text', $form_state->getValue('fee_list_body_text'))
      ->set('page_size_desktop', $form_state->getValue('page_size_desktop'))
      ->set('page_size_mobile', $form_state->getValue('page_size_mobile'))
      ->set('available_payment_types_url', $form_state->getValue('available_payment_types_url'))
      ->save();
  }

}
