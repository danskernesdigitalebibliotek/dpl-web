<?php

namespace Drupal\dpl_library_agency\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_library_agency\ListSizeSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * List size settings form.
 */
class ListSizeSettingsForm extends ConfigFormBase
{

  /**
   * Default constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   Config factory.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   List Size configuration object.
   */
  public function __construct(
    ConfigFactoryInterface            $config_factory,
    protected DplReactConfigInterface $configService,
  )
  {
    parent::__construct($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_library_agency.list_size_settings')
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
  public function getFormId(): string
  {
    return 'dpl_library_agency_list_size_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array
  {
    $config = $this->configService->loadConfig();

    $form['loan_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Loan list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the loan list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['loan_list_size_settings']['loan_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Loan list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('loan_list_size_desktop') ?? ListSizeSettings::LOAN_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['loan_list_size_settings']['loan_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Loan list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('loan_list_size_mobile') ?? ListSizeSettings::LOAN_LIST_SIZE_MOBILE,
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
      '#default_value' => $config->get('favorites_list_size_desktop') ?? ListSizeSettings::FAVORITES_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['favorites_list_size_settings']['favorites_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Favorites list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('favorites_list_size_mobile') ?? ListSizeSettings::FAVORITES_SIZE_MOBILE,
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
      '#default_value' => $config->get('menu_list_size_desktop') ?? ListSizeSettings::MENU_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['menu_list_size_settings']['menu_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Menu list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('menu_list_size_mobile') ?? ListSizeSettings::MENU_LIST_SIZE_MOBILE,
      '#min' => 1,
      '#step' => 1,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void
  {
    parent::submitForm($form, $form_state);
    $this->config($this->configService->getConfigKey())
      ->set('loan_list_size_desktop', $form_state->getValue('loan_list_size_desktop'))
      ->set('loan_list_size_mobile', $form_state->getValue('loan_list_size_mobile'))
      ->set('favorites_list_size_desktop', $form_state->getValue('favorites_list_size_desktop'))
      ->set('favorites_list_size_mobile', $form_state->getValue('favorites_list_size_mobile'))
      ->set('menu_list_size_desktop', $form_state->getValue('menu_list_size_desktop'))
      ->set('menu_list_size_mobile', $form_state->getValue('menu_list_size_mobile'))
      ->save();
  }

}

