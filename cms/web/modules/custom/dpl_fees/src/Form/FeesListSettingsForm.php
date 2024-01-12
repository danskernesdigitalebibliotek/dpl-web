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
      '#title' => $this->t('Basic settings', [], ['context' => 'Fees list settings form']),
      '#tree' => FALSE,
    ];

    $form['settings']['fees_and_replacement_costs_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Fees and Replacement costs URL', [], ['context' => 'Fees list settings form']),
      '#description' => $this->t('File or URL containing the fees and replacement costs. <br>
                                         You can add a relative url (e.g. /takster). <br>
                                         You can search for an internal url. <br>
                                         You can add an external url (starting with "http://" or "https://").', [], ['context' => 'Fees list settings form']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('fees_and_replacement_costs_url') ?? DplFeesSettings::FEES_AND_REPLACEMENT_COSTS_URL,
    ];

    $form['settings']['payment_overview_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Payment overview url', [], ['context' => 'Fees list settings form']),
      '#description' => $this->t('URL containing the payment overview. <br>
                                         You can add a relative url (e.g. /takster). <br>
                                         You can search for an internal url. <br>
                                         You can add an external url (starting with "http://" or "https://")', [], ['context' => 'Fees list settings form']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('payment_overview_url') ?? DplFeesSettings::PAYMENT_OVERVIEW_URL,
    ];

    $form['settings']['fee_list_body_text'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Intro text', [], ['context' => 'Fees list settings form']),
      '#description' => $this->t('Display an intro-text below the headline', [], ['context' => 'Fees list settings form']),
      '#default_value' => $config->get('fee_list_body_text') ?? $this->t('Fees and replacement costs are handled through the new system "Mit betalingsoverblik.', [], ['context' => 'Fees list settings form']),
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
      ->set('payment_overview_url', $form_state->getValue('payment_overview_url'))
      ->set('fee_list_body_text', $form_state->getValue('fee_list_body_text'))
      ->save();
  }

}
