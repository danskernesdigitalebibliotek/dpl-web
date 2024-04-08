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
   * @param \Drupal\dpl_fees\DplFeesSettings $feesSettings
   *   The DPL fee settings.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    protected DplReactConfigInterface $configService,
    protected DplFeesSettings $feesSettings
  ) {
    $this->setConfigFactory($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_fees.settings'),
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
      '#description' => $this->t('File or URL containing the fees and replacement costs. <br />
                                         You can add a relative url (e.g. /takster). <br />
                                         You can search for an internal url. <br />
                                         You can add an external url (starting with "http://" or "https://").', [], ['context' => 'Fees list settings form']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $this->feesSettings->getFeesAndReplacementCostsUrl(),
    ];

    $form['settings']['fee_list_body_text'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Intro text', [], ['context' => 'Fees list settings form']),
      '#description' => $this->t('Display an intro-text below the headline <br />
      If nothing is written here the text: "@text" will be used.', ['@text' => $this->t('Fees and replacement costs are handled through the new system "Mit betalingsoverblik"', [], ['context' => 'Fees list settings form'])], ['context' => 'Fees list settings form']),
      '#default_value' => $config->get('fee_list_body_text'),
    ];

    // Payment site button.
    $form['settings']['payment_site_button'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Payment site button configuration', [], ['context' => 'Fees list settings form']),
      '#tree' => FALSE,
    ];

    $form['settings']['payment_site_button']['payment_site_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Payment site url', [], ['context' => 'Fees list settings form']),
      '#description' => $this->t('URL containing a link to a payment page. <br />
                                         <strong>NB!: The button will only display if this field has been filled.</strong>', [], ['context' => 'Fees list settings form']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('payment_site_url'),
    ];

    $form['settings']['payment_site_button']['payment_site_button_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Payment site button label', [], ['context' => 'Fees list settings form']),
      '#description' => $this->t('Define the text of the button that links to the payment page. <br />
                                  If nothing is written here the text: "@text" will be used.', ['@text' => $this->t('Go to payment page', [], ['context' => 'Fees list settings form'])], ['context' => 'Fees list settings form']),
      '#default_value' => $config->get('payment_site_button_label'),
    ];

    $form['settings']['blocked_user'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Blocked user', [], ['context' => 'Fees list settings form']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['settings']['blocked_user']['blocked_patron_e_link_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Blocked user link for modal', [], ['context' => 'Fees list settings form']),
      '#description' => $this->t('If a user is blocked because of fees a modal appears. This field makes it possible to place a link in the modal to e.g. payment options or help page. <br />
                                         If left empty, the link will not be shown. <br />
                                         You can add a relative url (e.g. /takster). <br />
                                         You can search for an internal url. <br />
                                         You can add an external url (starting with "http://" or "https://").', [], ['context' => 'Fees list settings form']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('blocked_patron_e_link_url') ?? DplFeesSettings::BLOCKED_PATRON_E_LINK_URL,
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
      ->set('payment_site_url', $form_state->getValue('payment_site_url'))
      ->set('payment_site_button_label', $form_state->getValue('payment_site_button_label'))
      ->set('fee_list_body_text', $form_state->getValue('fee_list_body_text'))
      ->set('blocked_patron_e_link_url', $form_state->getValue('blocked_patron_e_link_url'))
      ->save();
  }

}
