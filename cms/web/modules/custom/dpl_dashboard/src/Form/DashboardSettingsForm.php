<?php

namespace Drupal\dpl_dashboard\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Dashboard list setting form.
 */
class DashboardSettingsForm extends ConfigFormBase {

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
      \Drupal::service('dpl_dashboard.settings')
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
    return 'dashboard_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->getConfig();

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Dashboard (settings)']),
      '#tree' => FALSE,
    ];

    $form['settings']['intermediate_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Fees url', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['intermediateUrl'] ?? '',
    ];

    $form['settings']['pay_owed_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Pay owed url', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['payOwedUrl'] ?? '',
    ];

    $form['settings']['physical_loans_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Physical loans url', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['physicalLoansUrl'] ?? '',
    ];

    $form['settings']['loans_overdue_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Loans overdue url', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['loansOverdueUrl'] ?? '',
    ];

    $form['settings']['loans_soon_overdue_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Loans soon overdue url', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['loansSoonOverdueUrl'] ?? '',
    ];

    $form['settings']['loans_not_overdue_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Loans not overdue url', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['loansNotOverdueUrl'] ?? '',
    ];

    $form['settings']['reservations_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Reservations url', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['reservationsUrl'] ?? '',
    ];

    $form['settings']['page_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size mobile', [], ['context' => 'Dashboard (settings)']),
      '#default_value' => $config['pageSizeMobile'] ?? 25,
      '#min' => 0,
      '#step' => 1,
    ];

    $form['settings']['page_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size desktop', [], ['context' => 'Dashboard (settings)']),
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
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);
    $this->config($this->configService->getConfigKey())
      ->set('intermediateUrl', $form_state->getValue('intermediate_url'))
      ->set('payOwedUrl', $form_state->getValue('pay_owed_url'))
      ->set('physicalLoansUrl', $form_state->getValue('physical_loans_url'))
      ->set('loansOverdueUrl', $form_state->getValue('loans_overdue_url'))
      ->set('loansSoonOverdueUrl', $form_state->getValue('loans_soon_overdue_url'))
      ->set('loansNotOverdueUrl', $form_state->getValue('loans_not_overdue_url'))
      ->set('reservationsUrl', $form_state->getValue('reservations_url'))
      ->set('pageSizeDesktop', $form_state->getValue('page_size_desktop'))
      ->set('pageSizeMobile', $form_state->getValue('page_size_mobile'))
      ->save();
  }

}
