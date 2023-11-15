<?php

namespace Drupal\dpl_dashboard\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_dashboard\DplDashboardSettings;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use function Safe\json_encode as json_encode;

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
    $allow_remove_ready_reservations = $generalSettings->get('reservation_detail_allow_remove_ready_reservations') ?? GeneralSettingsForm::RESERVATION_DETAIL_ALLOW_REMOVE_READY_RESERVATIONS;

    $data = [
      // Config.
      'page-size-desktop' => $dashboardSettings->get('page_size_desktop') ?? DplDashboardSettings::PAGE_SIZE_DESKTOP,
      'page-size-mobile' => $dashboardSettings->get('page_size_mobile') ?? DplDashboardSettings::PAGE_SIZE_MOBILE,
      'expiration-warning-days-before-config' => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettingsForm::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,
      'interest-periods-config' => DplReactAppsController::getInterestPeriods(),
      'reservation-detail-allow-remove-ready-reservations-config' => $generalSettings->get('reservation_detail_allow_remove_ready_reservations') ?? GeneralSettingsForm::RESERVATION_DETAIL_ALLOW_REMOVE_READY_RESERVATIONS,
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
      'reservation-details-config' => json_encode([
        'allowRemoveReadyReservations' => $allow_remove_ready_reservations,
      ]),

      // Urls.
      // Cannot find that route. Does it exist?
      'intermediate-url' => '/user/me/intermediates',
      'ereolen-my-page-url' => dpl_react_apps_format_app_url($generalSettings->get('ereolen_my_page_url'), GeneralSettingsForm::EREOLEN_MY_PAGE_URL),

      // Texts.
      'accept-modal-accept-button-text' => $this->t("Yes, renew", [], ['context' => 'Dashboard']),
      'accept-modal-are-you-sure-text' => $this->t("Are you sure you want to renew?", [], ['context' => 'Dashboard']),
      'accept-modal-aria-description-text' => $this->t("accept modal aria description text", [], ['context' => 'Dashboard (Aria)']),
      'accept-modal-aria-label-text' => $this->t("accept modal aria label text", [], ['context' => 'Dashboard (Aria)']),
      'accept-modal-body-text' => $this->t("If you renew your fee will be raised", [], ['context' => 'Dashboard']),
      'accept-modal-cancel-button-text' => $this->t("Cancel renewal", [], ['context' => 'Dashboard']),
      'accept-modal-header-text' => $this->t("Your fee is raised", [], ['context' => 'Dashboard']),
      'choose-all-text' => $this->t('Select all', [], ['context' => 'Dashboard']),
      'dashboard-number-in-line-text' => $this->t('Number @count in line', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-aria-description-text' => $this->t('This button opens a modal that covers the entire page and contains the possibility to delete a selected reservation, or multiple selected reservations', [], ['context' => 'Dashboard (Aria)']),
      'delete-reservation-modal-close-modal-text' => $this->t('Close delete reservation modal', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-delete-button-text' => $this->t('Cancel reservation', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-delete-question-text' => $this->t('Do you want to cancel your reservation?', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-header-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('Cancel reservation', [], ['context' => 'Dashboard']),
          $this->t('Cancel reservations', [], ['context' => 'Dashboard']),
        ],
      ],
      'delete-reservation-modal-not-regrettable-text' => $this->t('You cannot regret this action', [], ['context' => 'Dashboard']),
      'digital-reservations-header-text' => $this->t('Digital reservations', [], ['context' => 'Dashboard']),
      'digital-text' => $this->t('Digital', [], ['context' => 'Dashboard']),
      'et-al-text' => $this->t('et al.', [], ['context' => 'Dashboard']),
      'fees-text' => $this->t('Fees', [], ['context' => 'Dashboard']),
      'group-modal-aria-description-text' => $this->t('This modal makes it possible to renew materials', [], ['context' => 'Dashboard (Aria)']),
      'group-modal-button-text' => $this->t('Renewable (@count)', [], ['context' => 'Dashboard']),
      'group-modal-checkbox-text' => $this->t('Choose all', [], ['context' => 'Dashboard']),
      'group-modal-due-date-aria-description-text' => $this->t('This modal groups loans after due date and makes it possible to renew said loans', [], ['context' => 'Dashboard']),
      'group-modal-due-date-header-text' => $this->t('Due date @date', [], ['context' => 'Dashboard']),
      'group-modal-due-date-renew-loan-close-modal-aria-label-text' => $this->t('Close renew loans modal', [], ['context' => 'Dashboard']),
      'group-modal-due-date-warning-loan-overdue-text' => $this->t('The due date of return is exceeded, therefore you will be charged a fee, when the item is returned', [], ['context' => 'Dashboard']),
      'group-modal-hidden-label-checkbox-on-material-text' => $this->t('Select @label for renewal', [], ['context' => 'Dashboard']),
      'group-modal-loans-aria-description-text' => $this->t("This modal makes it possible to renew materials", [], ['context' => 'Dashboard (Aria)']),
      'group-modal-loans-close-modal-aria-label-text' => $this->t("Close modal with grouped loans", [], ['context' => 'Patron menu (Aria)']),
      'group-modal-reservations-close-modal-aria-label-text' => $this->t('Close modal with grouped reservations', [], ['context' => 'Dashboard (Aria)']),
      'group-modal-reservations-loans-aria-description-text' => $this->t('This modal makes it possible to delete reservations', [], ['context' => 'Dashboard (Aria)']),
      'intermediate-text' => $this->t('Intermediates', [], ['context' => 'Dashboard']),
      'list-details-nothing-selected-label-text' => $this->t('Pick', [], ['context' => 'Dashboard']),
      'loans-not-overdue-text' => $this->t('Longer return time', [], ['context' => 'Dashboard']),
      'loans-overdue-text' => $this->t('Returned too late', [], ['context' => 'Dashboard']),
      'loans-soon-overdue-text' => $this->t('To be returned soon', [], ['context' => 'Dashboard']),
      'material-and-author-text' => $this->t('and', [], ['context' => 'Dashboard']),
      'material-by-author-text' => $this->t('By', [], ['context' => 'Dashboard']),
      'material-details-close-modal-aria-label-text' => $this->t('Close material details modal', [], ['context' => 'Dashboard (Aria)']),
      'material-details-link-to-page-with-fees-text' => $this->t('Read more about fees', [], ['context' => 'Dashboard']),
      'material-details-loan-date-label-text' => $this->t('Loan date', [], ['context' => 'Dashboard']),
      'material-details-material-number-label-text' => $this->t('Material Item Number', [], ['context' => 'Dashboard']),
      'material-details-modal-aria-description-text' => $this->t('This modal shows material details, and makes it possible to renew a material, of that material is renewable', [], ['context' => 'Dashboard (Aria)']),
      'material-details-overdue-text' => $this->t('Expired', [], ['context' => 'Dashboard']),
      'material-details-physical-due-date-label-text' => $this->t('Afleveres', [], ['context' => 'Dashboard']),
      'material-details-warning-loan-overdue-text' => $this->t('The due date of return is exceeded, therefore you will be charged a fee, when the item is returned', [], ['context' => 'Dashboard']),
      'no-physical-loans-text' => $this->t('At the moment, you have 0 physical loans', [], ['context' => 'Dashboard']),
      'no-reservations-text' => $this->t('At the moment, you have 0 reservations', [], ['context' => 'Dashboard']),
      'pay-owed-text' => $this->t('Pay', [], ['context' => 'Dashboard']),
      'physical-loans-text' => $this->t('Loans', [], ['context' => 'Dashboard']),
      'physical-reservations-header-text' => $this->t('Physical reservations', [], ['context' => 'Dashboard']),
      'pick-up-latest-text' => $this->t('Pick up before @date', [], ['context' => 'Dashboard']),
      'publizon-audio-book-text' => $this->t('Audiobook', [], ['context' => 'Dashboard']),
      'publizon-ebook-text' => $this->t('E-book', [], ['context' => 'Dashboard']),
      'publizon-podcast-text' => $this->t('Podcast', [], ['context' => 'Dashboard']),
      'queued-reservations-text' => $this->t('Queued reservations', [], ['context' => 'Dashboard']),
      'ready-for-loan-counter-label-text' => $this->t('Ready', [], ['context' => 'Dashboard']),
      'ready-for-loan-text' => $this->t('Ready for pickup', [], ['context' => 'Dashboard']),
      'remove-all-reservations-text' => $this->t('Remove reservations (@amount)', [], ['context' => 'Dashboard']),
      'reservation-details-borrow-before-text' => $this->t('Borrow before @date', [], ['context' => 'Dashboard']),
      'reservation-details-button-remove-text' => $this->t('Remove your reservation', [], ['context' => 'Dashboard']),
      'reservation-details-change-text' => $this->t('Apply changes', [], ['context' => 'Dashboard']),
      'reservation-details-date-of-reservation-title-text' => $this->t('Date of reservation', [], ['context' => 'Dashboard']),
      'reservation-details-digital-reservation-go-to-ereolen-text' => $this->t('Go to eReolen', [], ['context' => 'Dashboard']),
      'reservation-details-no-interest-after-title-text' => $this->t('Not interested after', [], ['context' => 'Dashboard']),
      'reservation-details-number-in-queue-label-text' => $this->t('@count queued', [], ['context' => 'Dashboard']),
      'reservation-details-others-in-queue-text' => $this->t('Others are queueing for this material', [], ['context' => 'Dashboard']),
      'reservation-details-pick-up-at-title-text' => $this->t('Pickup branch', [], ['context' => 'Dashboard']),
      'reservation-details-pickup-deadline-title-text' => $this->t('Pickup deadline', [], ['context' => 'Dashboard']),
      'reservation-details-ready-for-loan-text' => $this->t('Ready for pickup', [], ['context' => 'Dashboard']),
      'reservation-details-remove-digital-reservation-text' => $this->t('Remove your reservation', [], ['context' => 'Dashboard']),
      'reservation-details-status-title-text' => $this->t('Status', [], ['context' => 'Dashboard']),
      'reservations-ready-text' => $this->t('Ready for you', [], ['context' => 'Dashboard']),
      'reservations-still-in-queue-for-text' => $this->t('Still in queue', [], ['context' => 'Dashboard']),
      'reservations-text' => $this->t('Reservations', [], ['context' => 'Dashboard']),
      'result-pager-status-text' => $this->t('Showing @itemsShown out of @hitcount elements', [], ['context' => 'Dashboard']),
      'status-badge-warning-text' => $this->t('Expires soon', [], ['context' => 'Dashboard']),
      'total-amount-fee-text' => $this->t('@total,-', [], ['context' => 'Dashboard']),
      'total-owed-text' => $this->t('You owe in total', [], ['context' => 'Dashboard']),
      'your-profile-text' => $this->t('Your profile', [], ['context' => 'Dashboard']),
    ] + dpl_react_apps_texts_renewal() + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      '#name' => 'DashBoard',
      '#data' => $data,
    ];
  }

}
