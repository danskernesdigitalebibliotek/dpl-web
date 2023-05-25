<?php

namespace Drupal\dpl_reservations\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Reservation list setting form.
 */
class ReservationListSettingsForm extends ConfigFormBase {

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
      protected DplReactConfigInterface $configService,
  ) {
    parent::__construct($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_reservations.settings')
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
    return 'reservation_list_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->getConfig();

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Reservation list (settings)']),
      '#tree' => FALSE,
    ];

    $form['settings']['pause_reservation_info_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Pause reservation link', [], ['context' => 'Reservation list (settings)']),
      '#description' => $this->t('The link in the pause reservation modal', [], ['context' => 'Reservation list (settings)']),
      '#default_value' => $config['pauseReservationInfoUrl'] ?? '',
    ];

    $form['settings']['ereolen_my_page_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Ereolen link', [], ['context' => 'Reservation list (settings)']),
      '#description' => $this->t('My page in ereolen', [], ['context' => 'Reservation list (settings)']),
      '#default_value' => $config['ereolenMyPageUrl'] ?? 'https://ereolen.dk/user/me',
    ];
    $form['settings']['pause_reservation_start_date_config'] = [
      '#type' => 'date',
      '#title' => $this->t('Start date', [], ['context' => 'Reservation list (settings)']),
      '#description' => $this->t('Pause reservation start date', [], ['context' => 'Reservation list (settings)']),
      '#default_value' => $config['pauseReservationStartDateConfig'],
    ];

    $form['settings']['page_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size mobile', [], ['context' => 'Reservation list (settings)']),
      '#default_value' => $config['pageSizeMobile'] ?? 25,
      '#min' => 0,
      '#step' => 1,
    ];

    $form['settings']['page_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size desktop', [], ['context' => 'Reservation list (settings)']),
      '#default_value' => $config['pageSizeDesktop'] ?? 25,
      '#min' => 0,
      '#step' => 1,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $feesUrl = $form_state->getValue('pause_reservation_info_url');
    if (!filter_var($feesUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('pause_reservation_info_url', $this->t('The url "%url" is not a valid URL.', ['%url' => $feesUrl], ['context' => 'Reservation list (settings)']));
    }

    $materialUrl = $form_state->getValue('ereolen_my_page_url');
    if (!filter_var($materialUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('ereolen_my_page_url', $this->t('The url "%url" is not a valid URL.', ['%url' => $materialUrl], ['context' => 'Reservation list (settings)']));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config($this->configService->getConfigKey())
      ->set('pauseReservationInfoUrl', $form_state->getValue('pause_reservation_info_url'))
      ->set('ereolenMyPageUrl', $form_state->getValue('ereolen_my_page_url'))
      ->set('pauseReservationStartDateConfig', $form_state->getValue('pause_reservation_start_date_config'))
      ->set('pageSizeDesktop', $form_state->getValue('page_size_desktop'))
      ->set('pageSizeMobile', $form_state->getValue('page_size_mobile'))
      ->save();
  }

}
