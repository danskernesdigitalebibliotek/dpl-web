<?php

namespace Drupal\dpl_patron_page\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_patron_page\DplPatronPageSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Patron page setting form.
 */
class PatronPageSettingsForm extends ConfigFormBase {

  /**
   * Default constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   Config factory.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   Reservation list configuration object.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    protected DplReactConfigInterface $configService
  ) {
    parent::__construct($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_patron_page.settings')
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
    return 'patron_page_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->loadConfig();

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Patron page settings form']),
      '#tree' => FALSE,
    ];

    $form['settings']['delete_patron_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Delete patron link', [], ['context' => 'Patron page settings form']),
      '#description' => $this->t('Link to a page where it is possible to delete patron.<br />You can add a relative url (e.g. /takster). <br />You can search for an internal url. <br />You can add an external url (starting with "http://" or "https://").', [], ['context' => 'Patron page settings form']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('delete_patron_url') ?? '',
    ];

    $form['settings']['always_available_ereolen'] = [
      '#type' => 'url',
      '#title' => $this->t('Ereolen always available', [], ['context' => 'Patron page settings form']),
      '#default_value' => $config->get('always_available_ereolen') ?? DplPatronPageSettings::ALWAYS_AVAILABLE_EREOLEN,
    ];

    $form['settings']['pincode_length_min'] = [
      '#type' => 'number',
      '#title' => $this->t('Pincode length (min)', [], ['context' => 'Patron page settings form']),
      '#default_value' => $config->get('pincode_length_min') ?? DplPatronPageSettings::PINCODE_LENGTH_MIN,
      '#min' => 4,
      '#step' => 1,
    ];

    $form['settings']['pincode_length_max'] = [
      '#type' => 'number',
      '#title' => $this->t('Pincode length max', [], ['context' => 'Patron page settings form']),
      '#default_value' => $config->get('pincode_length_max') ?? DplPatronPageSettings::PINCODE_LENGTH_MAX,
      '#min' => 4,
      '#step' => 1,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config($this->configService->getConfigKey())
      ->set('delete_patron_url', $form_state->getValue('delete_patron_url'))
      ->set('always_available_ereolen', $form_state->getValue('always_available_ereolen'))
      ->set('pincode_length_min', $form_state->getValue('pincode_length_min'))
      ->set('pincode_length_max', $form_state->getValue('pincode_length_max'))
      ->save();
  }

}
