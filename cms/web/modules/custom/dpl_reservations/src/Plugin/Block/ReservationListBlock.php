<?php

namespace Drupal\dpl_reservations\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Drupal\dpl_reservations\DplReservationsSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;

/**
 * Provides user reservations list.
 *
 * @Block(
 *   id = "dpl_reservations_list_block",
 *   admin_label = "List user reservations"
 * )
 */
class ReservationListBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * ReservationListBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch-settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch-settings for getting branches.
   * @param \Drupal\dpl_react\DplReactConfigInterface $reservationListSettings
   *   Reservation list settings.
   */
  public function __construct(
      array $configuration,
      string $plugin_id,
      array $plugin_definition,
      private ConfigFactoryInterface $configFactory,
      protected BranchSettings $branchSettings,
      protected BranchRepositoryInterface $branchRepository,
      protected DplReactConfigInterface $reservationListSettings
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
      \Drupal::service('dpl_reservations.settings'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build(): array {
    $config = $this->reservationListSettings->loadConfig();
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');

    $data = [
      // Branches.
      'blacklisted-availability-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'blacklisted-search-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedSearchBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),

      // Url.
      'ereolen-my-page-url' => dpl_react_apps_format_app_url($config->get('ereolen_my_page_url'), GeneralSettingsForm::EREOLEN_MY_PAGE_URL),
      'pause-reservation-info-url' => dpl_react_apps_format_app_url($generalSettings->get('pause_reservation_info_url'), GeneralSettingsForm::PAUSE_RESERVATION_INFO_URL),

      // Config.
      'interest-periods-config' => DplReactAppsController::getInterestPeriods(),
      'page-size-desktop' => $config->get('page_size_desktop') ?? DplReservationsSettings::PAGE_SIZE_DESKTOP,
      'page-size-mobile' => $config->get('page_size_mobile') ?? DplReservationsSettings::PAGE_SIZE_MOBILE,
      'pause-reservation-start-date-config' => $generalSettings->get('pause_reservation_start_date_config') ?? GeneralSettingsForm::PAUSE_RESERVATION_START_DATE_CONFIG,
      'expiration-warning-days-before-config' => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettingsForm::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,
    ] + DplReactAppsController::externalApiBaseUrls() + DplReactAppsController::getBlockedSettings();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'reservation-list',
      '#data' => $data,
    ];
  }

}
