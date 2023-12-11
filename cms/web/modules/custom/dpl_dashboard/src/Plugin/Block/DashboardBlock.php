<?php

namespace Drupal\dpl_dashboard\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_dashboard\DplDashboardSettings;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user intermediate list.
 *
 * @Block(
 *   id = "dpl_dashboard_block",
 *   admin_label = "List user dashboard"
 * )
 */
class DashboardBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * DashboardBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   Branch settings.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   Branch repository.
   * @param \Drupal\dpl_react\DplReactConfigInterface $dashboardSettings
   *   Dashboard settings.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private ConfigFactoryInterface $configFactory,
    private BranchSettings $branchSettings,
    private BranchRepositoryInterface $branchRepository,
    private DplReactConfigInterface $dashboardSettings
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      \Drupal::service('dpl_dashboard.settings')
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build(): array {
    $dashboardSettings = $this->dashboardSettings->loadConfig();
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');

    $data = [
      // Config.
      'page-size-desktop' => $dashboardSettings->get('page_size_desktop') ?? DplDashboardSettings::PAGE_SIZE_DESKTOP,
      'page-size-mobile' => $dashboardSettings->get('page_size_mobile') ?? DplDashboardSettings::PAGE_SIZE_MOBILE,
      'expiration-warning-days-before-config' => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettingsForm::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,
      'interest-periods-config' => DplReactAppsController::getInterestPeriods(),
      'reservation-detail-allow-remove-ready-reservations-config' => $generalSettings->get('reservation_detail_allow_remove_ready_reservations') ?? GeneralSettingsForm::RESERVATION_DETAIL_ALLOW_REMOVE_READY_RESERVATIONS,
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),

      // Urls.
      // Cannot find that route. Does it exist?
      'intermediate-url' => '/user/me/intermediates',
      'ereolen-my-page-url' => dpl_react_apps_format_app_url($generalSettings->get('ereolen_my_page_url'), GeneralSettingsForm::EREOLEN_MY_PAGE_URL),

      // Texts.
      'choose-all-text' => $this->t('Select all', [], ['context' => 'Dashboard']),
      'digital-text' => $this->t('Digital', [], ['context' => 'Dashboard']),
      'fees-text' => $this->t('Fees', [], ['context' => 'Dashboard']),
      'group-modal-aria-description-text' => $this->t('This modal makes it possible to renew materials', [], ['context' => 'Dashboard (Aria)']),
      'intermediate-text' => $this->t('Intermediates', [], ['context' => 'Dashboard']),
      'list-details-nothing-selected-label-text' => $this->t('Pick', [], ['context' => 'Dashboard']),
      'loans-not-overdue-text' => $this->t('Longer return time', [], ['context' => 'Dashboard']),
      'no-physical-loans-text' => $this->t('At the moment, you have 0 physical loans', [], ['context' => 'Dashboard']),
      'no-reservations-text' => $this->t('At the moment, you have 0 reservations', [], ['context' => 'Dashboard']),
      'pay-owed-text' => $this->t('Pay', [], ['context' => 'Dashboard']),
      'physical-loans-text' => $this->t('Loans', [], ['context' => 'Dashboard']),
      'queued-reservations-text' => $this->t('Queued reservations', [], ['context' => 'Dashboard']),
      'reservations-still-in-queue-for-text' => $this->t('Still in queue', [], ['context' => 'Dashboard']),
      'reservations-text' => $this->t('Reservations', [], ['context' => 'Dashboard']),
      'total-amount-fee-text' => $this->t('@total,-', [], ['context' => 'Dashboard']),
      'total-owed-text' => $this->t('You owe in total', [], ['context' => 'Dashboard']),
      'your-profile-text' => $this->t('Your profile', [], ['context' => 'Dashboard']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      '#name' => 'DashBoard',
      '#data' => $data,
    ];
  }

}
