<?php

namespace Drupal\dpl_instant_loan\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\preg_split;

/**
 * Instant Loan settings form.
 */
class DplInstantLoanSettingsForm extends ConfigFormBase {

  /**
   * The instant loan config service.
   *
   * @var \Drupal\dpl_react\DplReactConfigInterface
   */
  protected $configService;

  /**
   * Constructs a \Drupal\system\ConfigFormBase object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\dpl_react\DplReactConfigInterface $config_service
   *   The instant loan config service.
   */
  public function __construct(ConfigFactoryInterface $config_factory, DplReactConfigInterface $config_service) {
    $this->setConfigFactory($config_factory);
    $this->configService = $config_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_instant_loan.settings')
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
    return 'dpl_instant_loan_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config($this->configService->getConfigKey());
    $config_field_states = [
      'required' => [
        ':input[name="enabled"]' => ['checked' => TRUE],
      ],
      'visible' => [
        ':input[name="enabled"]' => ['checked' => TRUE],
      ],
    ];

    $form['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enabled', [], ['context' => 'dpl_instant_loan']),
      '#description' => $this->t(
        'Should materials available for instant loans be promoted to patrons?',
        [],
        ['context' => 'dpl_instant_loan']
      ),
      '#default_value' => $config->get('enabled'),
    ];

    $form['match_strings'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Match Strings', [], ['context' => 'dpl_instant_loan']),
      // Set the number of visible rows for the textarea.
      '#rows' => 5,
      '#description' => $this->t('Text used to identify materials which are available for instant loans.<br/> You can write multiple strings - each on a spearate line.<br/> To find a match one of the strings must be present in the material group of such materials.', [], ['context' => 'dpl_instant_loan']),
      '#default_value' => implode("\n", $config->get('match_strings') ?? []),
      '#states' => $config_field_states,
    ];

    $form['threshold'] = [
      '#type' => 'number',
      '#title' => $this->t('Threshold', [], ['context' => 'dpl_instant_loan']),
      '#description' => $this->t(
        'The minimum number of materials which must be available for instant loan at a library branch to notify patrons of the option when making reservations.',
        [],
        ['context' => 'dpl_instant_loan']
      ),
      '#default_value' => $config->get('threshold'),
      '#states' => $config_field_states,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config($this->configService->getConfigKey())
      ->set('enabled', $form_state->getValue('enabled'))
      ->set('match_strings', preg_split("/\s*[\r\n]+\s*/", $form_state->getValue('match_strings')))
      ->set('threshold', $form_state->getValue('threshold'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
