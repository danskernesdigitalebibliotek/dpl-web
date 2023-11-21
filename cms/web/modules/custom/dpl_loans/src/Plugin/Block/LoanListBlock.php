<?php

namespace Drupal\dpl_loans\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;
use Drupal\dpl_loans\DplLoansSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user loans list.
 *
 * @Block(
 *   id = "dpl_loans_list_block",
 *   admin_label = "List user loans"
 * )
 */
class LoanListBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * LoanListBlock constructor.
   *
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   * @param \Drupal\dpl_react\DplReactConfigInterface $loanSettings
   *   Loans settings.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private ConfigFactoryInterface $configFactory,
    private DplReactConfigInterface $loanSettings
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
  }

  /**
   * {@inheritDoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The service container.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param int $plugin_definition
   *   The plugin implementation definition.
   *
   * @return \Drupal\dpl_loans\Plugin\Block\LoanListBlock|static
   *   Loan list block.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      \Drupal::service('dpl_loans.settings')
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $loanListSettings = $this->loanSettings->loadConfig();
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');

    $data = [
      // Page size.
      "page-size-desktop" => $loanListSettings->get('page_size_desktop') ?? DplLoansSettings::PAGE_SIZE_DESKTOP,
      "page-size-mobile" => $loanListSettings->get('page_size_mobile') ?? DplLoansSettings::PAGE_SIZE_MOBILE,

      // Config.
      "expiration-warning-days-before-config" => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettingsForm::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,

      // Urls.
      'ereolen-my-page-url' => dpl_react_apps_format_app_url($generalSettings->get('ereolen_my_page_url'), GeneralSettingsForm::EREOLEN_MY_PAGE_URL),
      'material-overdue-url' => Url::fromRoute('dpl_loans.list', [], ['absolute' => TRUE])->toString(),
    ] + DplReactAppsController::externalApiBaseUrls() + DplReactAppsController::getBlockedSettings();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'loan-list',
      '#data' => $data,
    ];
  }

}
