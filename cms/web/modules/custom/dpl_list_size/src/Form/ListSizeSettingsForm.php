<?php

namespace Drupal\dpl_list_size\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_list_size\DplListSizeSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * List size settings form.
 */
class ListSizeSettingsForm extends ConfigFormBase {

  /**
   * Default constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   Config factory.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   List Size configuration object.
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
      \Drupal::service('dpl_list_size.settings')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array{
    return ['dpl_list_size.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'list_size_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->loadConfig();

//    $form['dashboard_list_size_settings'] = [
//      '#type' => 'fieldset',
//      '#title' => $this->t('Dashboard list size settings', [], ['context' => 'List size (settings)']),
//      '#description' => $this->t('The number of items to display in the dashboard list.', [], ['context' => 'List size (settings)']),
//      '#tree' => FALSE,
//    ];
//
//    $form['dashboard_list_size_settings']['dashboard_list_size_desktop'] = [
//      '#type' => 'number',
//      '#title' => $this->t('Dashboard list size on desktop', [], ['context' => 'List size (settings)']),
//      '#default_value' => $config->get('dashboard_list_size_desktop') ?? DplListSizeSettings::DASHBOARD_LIST_SIZE_DESKTOP,
//      '#min' => 1,
//      '#step' => 1,
//    ];
//
//    $form['dashboard_list_size_settings']['dashboard_list_size_mobile'] = [
//      '#type' => 'number',
//      '#title' => $this->t('Dashboard list size on mobile', [], ['context' => 'List size (settings)']),
//      '#default_value' => $config->get('dashboard_list_size_mobile') ?? DplListSizeSettings::DASHBOARD_LIST_SIZE_MOBILE,
//      '#min' => 1,
//      '#step' => 1,
//    ];

    $form['reservation_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservation list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the reservation list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['reservation_list_size_settings']['reservation_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Reservation list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('reservation_list_size_desktop') ?? DplListSizeSettings::RESERVATION_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['reservation_list_size_settings']['reservation_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Reservation list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('reservation_list_size_mobile') ?? DplListSizeSettings::RESERVATION_LIST_SIZE_MOBILE,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['loan_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Loan list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the loan list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['loan_list_size_settings']['loan_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Loan list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('loan_list_size_desktop') ?? DplListSizeSettings::LOAN_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['loan_list_size_settings']['loan_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Loan list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('loan_list_size_mobile') ?? DplListSizeSettings::LOAN_LIST_SIZE_MOBILE,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['favorites_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Favorites list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the favorites list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['favorites_list_size_settings']['favorites_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Favorites list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('favorites_list_size_desktop') ?? DplListSizeSettings::FAVORITES_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['favorites_list_size_settings']['favorites_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Favorites list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('favorites_list_size_mobile') ?? DplListSizeSettings::FAVORITES_SIZE_MOBILE,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['menu_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Menu list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the menu list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['menu_list_size_settings']['menu_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Menu list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('menu_list_size_desktop') ?? DplListSizeSettings::MENU_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['menu_list_size_settings']['menu_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Menu list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('menu_list_size_mobile') ?? DplListSizeSettings::MENU_LIST_SIZE_MOBILE,
      '#min' => 1,
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
      ->set('reservation_list_size_desktop', $form_state->getValue('reservation_list_size_desktop'))
      ->set('reservation_list_size_mobile', $form_state->getValue('reservation_list_size_mobile'))
      ->set('loan_list_size_desktop', $form_state->getValue('loan_list_size_desktop'))
      ->set('loan_list_size_mobile', $form_state->getValue('loan_list_size_mobile'))
      ->set('favorites_list_size_desktop', $form_state->getValue('favorites_list_size_desktop'))
      ->set('favorites_list_size_mobile', $form_state->getValue('favorites_list_size_mobile'))
      ->set('menu_list_size_desktop', $form_state->getValue('menu_list_size_desktop'))
      ->set('menu_list_size_mobile', $form_state->getValue('menu_list_size_mobile'))
      ->save();
  }

}
