<?php

namespace Drupal\dpl_patron_page\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;
use Drupal\dpl_patron_page\DplPatronPageSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\ReservationSettings;

/**
 * Provides patron page.
 *
 * @Block(
 *   id = "dpl_patron_page_block",
 *   admin_label = "Patron page"
 * )
 */
class PatronPageBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * PatronPageBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   * @param \Drupal\dpl_library_agency\ReservationSettings $reservationSettings
   *   Reservation settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   Branch settings.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   Branch repository.
   * @param \Drupal\dpl_react\DplReactConfigInterface $patronPageSettings
   *   Patron page settings.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private ConfigFactoryInterface $configFactory,
    protected ReservationSettings $reservationSettings,
    private BranchSettings $branchSettings,
    private BranchRepositoryInterface $branchRepository,
    private DplReactConfigInterface $patronPageSettings
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
      $container->get('dpl_library_agency.reservation_settings'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      \Drupal::service('dpl_patron_page.settings'),
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
  public function build() {
    $patron_page_settings = $this->patronPageSettings->loadConfig();

    $general_config = $this->configFactory->get('dpl_library_agency.general_settings');
    $dateConfig = $general_config->get('pause_reservation_start_date_config') ?? GeneralSettingsForm::PAUSE_RESERVATION_START_DATE_CONFIG;

    $data = [
      // Configuration.
      // @todo write service for getting branches.
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
      'pause-reservation-start-date-config' => $dateConfig,
      'pincode-length-max-config' => $patron_page_settings->get('pincode_length_max') ?? DplPatronPageSettings::PINCODE_LENGTH_MAX,
      'pincode-length-min-config' => $patron_page_settings->get('pincode_length_min') ?? DplPatronPageSettings::PINCODE_LENGTH_MIN,
      'text-notifications-enabled-config' => (int) $this->reservationSettings->smsNotificationsIsEnabled(),

      // Urls.
      'always-available-ereolen-url' => dpl_react_apps_format_app_url($patron_page_settings->get('always_available_ereolen'), DplPatronPageSettings::ALWAYS_AVAILABLE_EREOLEN),
      'delete-patron-url' => dpl_react_apps_format_app_url($patron_page_settings->get('delete_patron_url'), DplPatronPageSettings::DELETE_PATRON_URL),
      'pause-reservation-info-url' => dpl_react_apps_format_app_url($patron_page_settings->get('pause_reservation_info_url'), GeneralSettingsForm::PAUSE_RESERVATION_INFO_URL),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'patron-page',
      '#data' => $data,
    ];
  }

}
