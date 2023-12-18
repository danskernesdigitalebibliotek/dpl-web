<?php

namespace Drupal\dpl_reservations\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_react\DplReactConfigInterface;
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
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch-settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch-settings for getting branches.
   * @param \Drupal\dpl_react\DplReactConfigInterface $reservationListSettings
   *   Reservation list settings.
   * @param \Drupal\dpl_library_agency\GeneralSettings $generalSettings
   *   General settings.
   */
  public function __construct(
      array $configuration,
      string $plugin_id,
      array $plugin_definition,
      private ConfigFactoryInterface $configFactory,
      protected BranchSettings $branchSettings,
      protected BranchRepositoryInterface $branchRepository,
      protected DplReactConfigInterface $reservationListSettings,
      protected GeneralSettings $generalSettings
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
    $config = $this->reservationListSettings->loadConfig();
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');
    $listSizeSettings = $this->configFactory->get('dpl_list_size.settings');


    $data = [
      // Branches.
      'blacklisted-availability-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'blacklisted-search-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedSearchBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),

      // Url.
      'ereolen-my-page-url' => dpl_react_apps_format_app_url($config->get('ereolen_my_page_url'), GeneralSettings::EREOLEN_MY_PAGE_URL),
      'pause-reservation-info-url' => dpl_react_apps_format_app_url($generalSettings->get('pause_reservation_info_url'), GeneralSettings::PAUSE_RESERVATION_INFO_URL),

      // Config.
      'interest-periods-config' => json_encode($this->generalSettings->getInterestPeriodsConfig()),
      'page-size-desktop' => $config->get('page_size_desktop') ?? DplReservationsSettings::PAGE_SIZE_DESKTOP,
      'page-size-mobile' => $config->get('page_size_mobile') ?? DplReservationsSettings::PAGE_SIZE_MOBILE,
      'expiration-warning-days-before-config' => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettings::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,

      // Texts.
      'modal-reservation-form-no-interest-after-label-text' => $this->t("Change the amount of time after which you're no longer interested in this material.", [], ['context' => 'Reservation list']),
      'modal-reservation-form-pickup-label-text' => $this->t("Change pickup location for your reservation.", [], ['context' => 'Reservation list']),
      'reservation-details-cancel-text' => $this->t('Cancel', [], ['context' => 'Reservation list']),
      'reservation-details-digital-material-expires-title-text' => $this->t('Borrow before', [], ['context' => 'Reservation list']),
      'reservation-details-expires-text' => $this->t('Your reservation expires @date!', [], ['context' => 'Reservation list']),
      'reservation-details-expires-title-text' => $this->t('Pickup deadline', [], ['context' => 'Reservation list']),
      'reservation-details-save-text' => $this->t('Save', [], ['context' => 'Reservation list']),
      'reservation-list-all-empty-text' => $this->t('At the moment you have 0 reservations', [], ['context' => 'Reservation list']),
      'reservation-list-available-in-text' => $this->t('Available in @count days', [], ['context' => 'Reservation list']),
      'reservation-list-day-text' => $this->t('day', [], ['context' => 'Reservation list']),
      'reservation-list-days-text' => $this->t('days', [], ['context' => 'Reservation list']),
      'reservation-list-digital-pickup-text' => $this->t('Online access', [], ['context' => 'Reservation list']),
      'reservation-list-digital-reservations-empty-text' => $this->t('At the moment you have 0 reservations on digital items', [], ['context' => 'Reservation list']),
      'reservation-list-digital-reservations-header-text' => $this->t('Digital reservations', [], ['context' => 'Reservation list']),
      'reservation-list-first-in-queue-text' => $this->t('You are at the front of the queue', [], ['context' => 'Reservation list']),
      'reservation-list-header-text' => $this->t('Your reservations', [], ['context' => 'Reservation list']),
      'reservation-list-in-queue-text' => $this->t('queued', [], ['context' => 'Reservation list']),
      'reservation-list-loan-before-text' => $this->t('Borrow before @date', [], ['context' => 'Reservation list']),
      'reservation-list-number-in-queue-text' => $this->t('There are @count people in the queue before you', [], ['context' => 'Reservation list']),
      'reservation-list-on-hold-aria-text' => $this->t('Reservations have been paused in the following time span:', [], ['context' => 'Reservation list (Aria)']),
      'reservation-list-pause-reservation-aria-modal-text' => $this->t('This button opens a modal that covers the entire page and contains the possibility to pause physical reservations', [], ['context' => 'Reservation list (Aria)']),
      'reservation-list-pause-reservation-text' => $this->t('Pause reservations on physical items', [], ['context' => 'Reservation list']),
      'reservation-list-pause-reservation-on-hold-text' => $this->t('Your reservations are paused', [], ['context' => 'Reservation list']),
      'reservation-list-physical-reservations-empty-text' => $this->t('At the moment you have 0 physical reservations', [], ['context' => 'Reservation list']),
      'reservation-list-physical-reservations-header-text' => $this->t('Physical reservations', [], ['context' => 'Reservation list']),
      'reservation-list-ready-for-pickup-empty-text' => $this->t('At the moment you have 0 reservations ready for pickup', [], ['context' => 'Reservation list']),
      'reservation-list-ready-for-pickup-title-text' => $this->t('Ready for pickup', [], ['context' => 'Reservation list']),
      'reservation-list-ready-text' => $this->t('Ready', [], ['context' => 'Reservation list']),
      'reservation-list-status-icon-ready-for-pickup-aria-label-text' => $this->t('This material is ready for pickup', [], ['context' => 'Reservation list (Aria)']),
      'reservation-list-pause-reservation-button-text' => $this->t('Settings', [], ['context' => 'Reservation list']),
      'reservation-list-status-icon-queued-aria-label-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('You are the only person queued for this material', [], ['context' => 'Reservation list (Aria)']),
          $this->t('This material has @count people in queue before you', [], ['context' => 'Reservation list (Aria)']),
        ],
      ],
      'reservation-list-status-icon-ready-in-aria-label-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('This material is ready in 1 day', [], ['context' => 'Reservation list (Aria)']),
          $this->t('This material is ready in @count days', [], ['context' => 'Reservation list (Aria)']),
        ],
      ],
      'reservation-pick-up-latest-text' => $this->t('Pick up before @date', [], ['context' => 'Reservation list']),
      'reservation-status-button-text' => $this->t('Close', [], ['context' => 'Reservation list']),
      'reservation-success-sub-title-text' => $this->t('Click the button below to close this window', [], ['context' => 'Reservation list']),
      'reservation-success-title-text' => $this->t('Your reservation has been changed', [], ['context' => 'Reservation list']),
    ] + DplReactAppsController::externalApiBaseUrls() + DplReactAppsController::getBlockedSettings();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'reservation-list',
      '#data' => $data,
    ];
  }

}
