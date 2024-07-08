<?php

namespace Drupal\dpl_reservations\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Drupal\dpl_reservations\DplReservationsSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\json_encode as json_encode;

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
   * @param \Drupal\dpl_reservations\DplReservationsSettings $reservationsSettings
   *   The branch-settings for branch config.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch-settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch-settings for getting branches.
   * @param \Drupal\dpl_library_agency\GeneralSettings $generalSettings
   *   General settings.
   */
  public function __construct(
    array $configuration,
    string $plugin_id,
    array $plugin_definition,
    private DplReservationsSettings $reservationsSettings,
    private BranchSettings $branchSettings,
    private BranchRepositoryInterface $branchRepository,
    private GeneralSettings $generalSettings,
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
      $container->get('dpl_reservations.settings'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      $container->get('dpl_library_agency.general_settings'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   *
   * @throws \Safe\Exceptions\JsonException
   */
  public function build(): array {
    $general_settings = $this->generalSettings->loadConfig();

    $data = [
      // Branches.
      'blacklisted-availability-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'blacklisted-search-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedSearchBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),

      // Url.
      'ereolen-my-page-url' => dpl_react_apps_format_app_url($general_settings->get('ereolen_my_page_url'), GeneralSettings::EREOLEN_MY_PAGE_URL),
      'pause-reservation-info-url' => dpl_react_apps_format_app_url($general_settings->get('pause_reservation_info_url'), GeneralSettings::PAUSE_RESERVATION_INFO_URL),

      // Config.
      'interest-periods-config' => json_encode($this->generalSettings->getInterestPeriodsConfig()),
      'page-size-desktop' => $this->reservationsSettings->getListSizeDesktop(),
      'page-size-mobile' => $this->reservationsSettings->getListSizeMobile(),
      'expiration-warning-days-before-config' => $general_settings->get('expiration_warning_days_before_config') ?? GeneralSettings::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'reservation-list',
      '#data' => $data,
    ];
  }

}
