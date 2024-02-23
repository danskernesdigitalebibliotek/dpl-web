<?php

namespace Drupal\dpl_patron_reg\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_patron_reg\DplPatronRegSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * PatronRegSettingsForm setting form.
 */
class PatronRegSettingsForm extends ConfigFormBase {

  /**
   * Constructs a \Drupal\system\ConfigFormBase object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   The patron registration config service.
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
      \Drupal::service('dpl_patron_reg.settings')
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
    return 'dpl_patron_reg_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->loadConfig();

    $form['age_limit'] = [
      '#type' => 'number',
      '#title' => $this->t('Minimum age to allow self registration', [], ['context' => 'Patron registration settings form']),
      '#default_value' => $config->get('age_limit') ?? DplPatronRegSettings::AGE_LIMIT,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['redirect_on_user_created_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Redirect on create', [], ['context' => 'Patron registration settings form']),
      '#description' => $this->t('Redirect to page when user is successfully created. <br>
                                         You can add a relative url (e.g. /takster). <br>
                                         You can search for an internal url. <br>
                                         You can add an external url (starting with "http://" or "https://").', [], ['context' => 'Patron registration settings form']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('redirect_on_user_created_url') ?? DplPatronRegSettings::REDIRECT_ON_USER_CREATED_URL,
    ];

    $form['information'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Information page', [], ['context' => 'Patron registration settings form']),
      '#default_value' => $config->get('information')['value'] ?? DplPatronRegSettings::INFORMATION_VALUE,
      '#format' => $config->get('information')['format'] ?? DplPatronRegSettings::INFORMATION_FORMAT,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);
    $this->config($this->configService->getConfigKey())
      ->set('age_limit', $form_state->getValue('age_limit'))
      ->set('redirect_on_user_created_url', $form_state->getValue('redirect_on_user_created_url'))
      ->set('information', $form_state->getValue('information'))
      ->save();
  }

}
