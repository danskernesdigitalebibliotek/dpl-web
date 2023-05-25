<?php

namespace Drupal\dpl_loans\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Loan list setting form.
 */
class LoanListSettingsForm extends ConfigFormBase {

  /**
   * Default constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   Config factory.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   Loan list configuration object.
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
      \Drupal::service('dpl_loans.settings')
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
    return 'loan_list_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->getConfig();

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Loan list (settings)']),
      '#tree' => FALSE,
    ];

    $form['settings']['material_overdue_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Material overdue url', [], ['context' => 'Loan list (settings)']),
      '#description' => $this->t('The link to the material overdue page', [], ['context' => 'Loan list (settings)']),
      '#default_value' => $config['materialOverdueUrl'] ?? '',
    ];

    $form['settings']['page_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size mobile', [], ['context' => 'Loan list (settings)']),
      '#default_value' => $config['pageSizeMobile'] ?? 25,
      '#min' => 0,
      '#step' => 1,
    ];

    $form['settings']['page_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Page size desktop', [], ['context' => 'Loan list (settings)']),
      '#default_value' => $config['pageSizeDesktop'] ?? 25,
      '#min' => 0,
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
      ->set('materialOverdueUrl', $form_state->getValue('material_overdue_url'))
      ->set('pageSizeDesktop', $form_state->getValue('page_size_desktop'))
      ->set('pageSizeMobile', $form_state->getValue('page_size_mobile'))
      ->save();
  }

}
