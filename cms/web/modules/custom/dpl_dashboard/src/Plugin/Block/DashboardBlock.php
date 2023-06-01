<?php

namespace Drupal\dpl_dashboard\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;

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
      'page-size-desktop' => $dashboardSettings->get('page_size_desktop'),
      'page-size-mobile' => $dashboardSettings->get('page_size_mobile'),
      'threshold-config' => $this->configFactory->get('dpl_library_agency.general_settings')->get('threshold_config'),
      'interest-periods-config' => DplReactAppsController::getInterestPeriods(),
      'reservation-detail-allow-remove-ready-reservations-config' => $generalSettings->get('reservation_detail_allow_remove_ready_reservations_config'),
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),

      // Urls.
      'dpl-cms-base-url' => DplReactAppsController::dplCmsBaseUrl(),
      'fees-page-url' => $generalSettings->get('fees_page_url'),
      'intermediate-url' => $dashboardSettings->get('intermediate_url'),
      'loans-not-overdue-url' => $dashboardSettings->get('loans_not_overdue_url'),
      'loans-overdue-url' => $dashboardSettings->get('loans_overdue_url'),
      'loans-soon-overdue-url' => $dashboardSettings->get('loans_soon_overdue_url'),
      'pay-owed-url' => $dashboardSettings->get('pay_owed_url'),
      'physical-loans-url' => $dashboardSettings->get('physical_loans_url'),
      'reservations-url' => $dashboardSettings->get('reservations_url'),
      'search-url' => DplReactAppsController::searchResultUrl(),
      'fees-url' => $dashboardSettings->get('fees_url'),
      'ereolen-my-page-url' => $generalSettings->get('ereolen_my_page_url'),

      // Texts.
      'your-profile-text' => $this->t('Your profile', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-aria-description-text' => $this->t('This button opens a modal that covers the entire page and contains the possibility to delete a selected reservation, or multiple selected reservations', [], ['context' => 'Dashboard (aria)']),
      'delete-reservation-modal-close-modal-text' => $this->t('Close delete reservation modal', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-not-regrettable-text' => $this->t('You cannot regret this action', [], ['context' => 'Dashboard']),
      'fees-text' => $this->t('Fees', [], ['context' => 'Dashboard']),
      'total-owed-text' => $this->t('You owe in total', [], ['context' => 'Dashboard']),
      'pay-owed-text' => $this->t('Pay', [], ['context' => 'Dashboard']),
      'total-amount-fee-text' => $this->t('@total,-', [], ['context' => 'Dashboard']),
      'physical-loans-text' => $this->t('Loans', [], ['context' => 'Dashboard']),
      'group-modal-close-modal-aria-label-text' => $this->t('Close modal with grouped loans', [], ['context' => 'Dashboard (aria)']),
      'loans-overdue-text' => $this->t('Returned too late', [], ['context' => 'Dashboard']),
      'group-modal-hidden-label-checkbox-on-material-text' => $this->t('Select @label for renewal', [], ['context' => 'Dashboard']),
      'loans-soon-overdue-text' => $this->t('To be returned soon', [], ['context' => 'Dashboard']),
      'loans-not-overdue-text' => $this->t('Longer return time', [], ['context' => 'Dashboard']),
      'reservations-text' => $this->t('Reservations', [], ['context' => 'Dashboard']),
      'reservations-ready-for-pickup-text' => $this->t('Reservations ready for pickup', [], ['context' => 'Dashboard']),
      'queued-reservations-text' => $this->t('Queued reservations', [], ['context' => 'Dashboard']),
      'remove-all-reservations-text' => $this->t('Remove reservations (@amount)', [], ['context' => 'Dashboard']),
      'reservations-ready-text' => $this->t('Ready for you', [], ['context' => 'Dashboard']),
      'reservations-still-in-queue-for-text' => $this->t('Still in queue', [], ['context' => 'Dashboard']),
      'no-physical-loans-text' => $this->t('At the moment, you have 0 physical loans', [], ['context' => 'Dashboard']),
      'no-reservations-text' => $this->t('At the moment, you have 0 reservations', [], ['context' => 'Dashboard']),
      'status-badge-warning-text' => $this->t('Expires soon', [], ['context' => 'Dashboard']),
      'ready-for-loan-text' => $this->t('Ready for pickup', [], ['context' => 'Dashboard']),
      'ready-for-loan-counter-label-text' => $this->t('Ready', [], ['context' => 'Dashboard']),
      'material-details-close-modal-aria-label-text' => $this->t('Close material details modal', [], ['context' => 'Dashboard (aria)']),
      'material-details-link-to-page-with-fees-text' => $this->t('Read more about fees', [], ['context' => 'Dashboard']),
      'material-details-modal-aria-description-text' => $this->t('This modal shows material details, and makes it possible to renew a material, of that material is renewable', [], ['context' => 'Dashboard (aria)']),
      'material-details-overdue-text' => $this->t('Expired', [], ['context' => 'Dashboard']),
      'material-details-material-number-label-text' => $this->t('Material Item Number', [], ['context' => 'Dashboard']),
      'material-details-loan-date-label-text' => $this->t('Loan date', [], ['context' => 'Dashboard']),
      'material-details-physical-due-date-label-text' => $this->t('Afleveres', [], ['context' => 'Dashboard']),
      'group-modal-due-date-link-to-page-with-fees-text' => $this->t('Read more about fees', [], ['context' => 'Dashboard']),
      'material-details-warning-loan-overdue-text' => $this->t('The due date of return is exceeded, therefore you will be charged a fee, when the item is returned', [], ['context' => 'Dashboard']),
      'publizon-audio-book-text' => $this->t('Audiobook', [], ['context' => 'Dashboard']),
      'publizon-ebook-text' => $this->t('E-book', [], ['context' => 'Dashboard']),
      'publizon-podcast-text' => $this->t('Podcast', [], ['context' => 'Dashboard']),
      'group-modal-due-date-header-text' => $this->t('Due date @date', [], ['context' => 'Dashboard']),
      'group-modal-return-library-text' => $this->t('Can be returned to all branches of Samsøs libraries', [], ['context' => 'Dashboard']),
      'group-modal-checkbox-text' => $this->t('Choose all', [], ['context' => 'Dashboard']),
      'group-modal-aria-description-text' => $this->t('This modal makes it possible to renew materials', [], ['context' => 'Dashboard (aria)']),
      'group-modal-button-text' => $this->t('Renewable (@count)', [], ['context' => 'Dashboard']),
      'reservation-details-remove-digital-reservation-text' => $this->t('Remove your reservation', [], ['context' => 'Dashboard']),
      'reservation-details-date-of-reservation-title-text' => $this->t('Date of reservation', [], ['context' => 'Dashboard']),
      'list-details-nothing-selected-label-text' => $this->t('Pick', [], ['context' => 'Dashboard']),
      'reservation-details-no-interest-after-title-text' => $this->t('Not interested after', [], ['context' => 'Dashboard']),
      'reservation-details-change-text' => $this->t('Apply changes', [], ['context' => 'Dashboard']),
      'reservation-details-pick-up-at-title-text' => $this->t('Pickup branch', [], ['context' => 'Dashboard']),
      'reservation-details-button-remove-text' => $this->t('Remove your reservation', [], ['context' => 'Dashboard']),
      'dashboard-number-in-line-text' => $this->t('Number @count in line', [], ['context' => 'Dashboard']),
      'group-modal-renew-loan-denied-max-renewals-reached-text' => $this->t('The item cannot be renewed further ', [], ['context' => 'Dashboard']),
      'group-modal-due-date-material-text' => $this->t('To be returned @date', [], ['context' => 'Dashboard']),
      'group-modal-go-to-material-text' => $this->t('Go to material details', [], ['context' => 'Dashboard']),
      'reservation-details-status-title-text' => $this->t('Status', [], ['context' => 'Dashboard']),
      'reservation-details-borrow-before-text' => $this->t('Borrow before @date', [], ['context' => 'Dashboard']),
      'result-pager-status-text' => $this->t('Showing @itemsShown out of @hitcount elements', [], ['context' => 'Dashboard']),
      'reservation-details-digital-reservation-go-to-ereolen-text' => $this->t('Go to eReolen', [], ['context' => 'Dashboard']),
      'loan-list-material-days-text' => $this->t('days', [], ['context' => 'Dashboard']),
      'group-modal-due-date-warning-loan-overdue-text' => $this->t('The due date of return is exceeded, therefore you will be charged a fee, when the item is returned', [], ['context' => 'Dashboard']),
      'reservation-details-ready-for-loan-text' => $this->t('Ready for pickup', [], ['context' => 'Dashboard']),
      'reservation-details-pickup-deadline-title-text' => $this->t('Pickup deadline', [], ['context' => 'Dashboard']),
      'group-modal-renew-loan-denied-reserved-text' => $this->t('The item is reserved by another patron', [], ['context' => 'Dashboard']),
      'group-modal-renew-loan-denied-inter-library-loan-text' => $this->t('The item has been lent to you by another library and renewal is therefore conditional of the acceptance by that library', [], ['context' => 'Dashboard']),
      'pick-up-latest-text' => $this->t('Pick up before @date', [], ['context' => 'Dashboard']),
      'physical-reservations-modal-header-text' => $this->t('Physical reservations', [], ['context' => 'Dashboard']),
      'digital-reservations-modal-header-text' => $this->t('Digital reservations', [], ['context' => 'Dashboard']),
      'material-and-author-text' => $this->t('and', [], ['context' => 'Dashboard']),
      'material-by-author-text' => $this->t('By', [], ['context' => 'Dashboard']),
      'choose-all-text' => $this->t('Select all', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-delete-question-text' => $this->t('Do you want to cancel your reservation?', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-delete-button-text' => $this->t('Cancel reservation', [], ['context' => 'Dashboard']),
      'delete-reservation-modal-header-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('Cancel reservation', [], ['context' => 'Dashboard']),
          $this->t('Cancel reservations', [], ['context' => 'Dashboard']),
        ],
      ],
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      '#name' => 'DashBoard',
      '#data' => $data,
    ];
  }

}
