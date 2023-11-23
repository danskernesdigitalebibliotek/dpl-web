<?php

namespace Drupal\dpl_patron_menu\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_react\DplReactConfigInterface;

/**
 * Provides patron menu.
 *
 * @Block(
 *   id = "dpl_patron_menu_block",
 *   admin_label = "Patron menu"
 * )
 */
class PatronMenuBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

  /**
   * PatronMenuBlock constructor.
   *
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch settings for getting branches.
   * @param \Drupal\dpl_react\DplReactConfigInterface $menuSettings
   *   Dashboard settings.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory, private BranchSettings $branchSettings, private BranchRepositoryInterface $branchRepository, private DplReactConfigInterface $menuSettings) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
    $this->configFactory = $configFactory;
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
   * @return \Drupal\dpl_patron_menu\Plugin\Block\PatronMenuBlock|static
   *   Patron menu block.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      \Drupal::service('dpl_patron_menu.settings')
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   *
   * @throws \JsonException
   */
  public function build(): array {
    $menuSettings = $this->menuSettings->loadConfig();
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');
    // Alternative to this menu array here this could be loaded from a drupal
    // generated menu. A place for further improvements.
    $menu = [
      [
        "name" => $this->t("Dashboard", ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_dashboard.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "40",
      ],
      [
        "name" => $this->t("Loans", ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_loans.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "1",
      ],
      [
        "name" => $this->t("Reservations", ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_reservations.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "2",
      ],
      [
        "name" => $this->t("My list", ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_favorites_list.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "20",
      ],
      [
        "name" => $this->t("Fees & Replacement costs", ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_fees.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "4",
      ],
    ];

    $data = [
      // Config.
      'page-size-desktop' => $menuSettings->get('page_size_desktop'),
      'page-size-mobile' => $menuSettings->get('page_size_mobile'),
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
      "expiration-warning-days-before-config" => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettingsForm::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,
      "menu-navigation-data-config" => json_encode($menu, JSON_THROW_ON_ERROR),
      'reservation-detail-allow-remove-ready-reservations-config' => $generalSettings->get('reservation_detail_allow_remove_ready_reservations'),
      'interest-periods-config' => DplReactAppsController::getInterestPeriods(),

      // Urls.
      'fees-page-url' => '/user/me/fees',
      // We want the user to be redirected to the dashboard
      // after login via the patron menu.
      "menu-login-url" => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute(
          'dpl_login.login',
          ['current-path' => dpl_react_apps_ensure_url_is_string(Url::fromRoute('dpl_dashboard.list')->toString())],
          ['absolute' => TRUE]
        )->toString()
      ),
      "menu-sign-up-url" => Url::fromRoute('dpl_patron_reg.information', [], ['absolute' => TRUE])->toString(),
      'ereolen-my-page-url' => $generalSettings->get('ereolen_my_page_url'),
      'user-profile-url' => Url::fromRoute('dpl_patron_page.profile', [], ['absolute' => TRUE])->toString(),

      // Texts.
      'dashboard-number-in-line-text' => $this->t('Number @count in line', [], ['context' => 'Patron menu']),
      'delete-reservation-modal-aria-description-text' => $this->t('This button opens a modal that covers the entire page and contains the possibility to delete a selected reservation, or multiple selected reservations', [], ['context' => 'Patron menu (Aria)']),
      'delete-reservation-modal-close-modal-text' => $this->t('Close delete reservation modal', [], ['context' => 'Patron menu']),
      'delete-reservation-modal-delete-button-text' => $this->t('Cancel reservation', [], ['context' => 'Patron menu']),
      'delete-reservation-modal-delete-question-text' => $this->t('Do you want to cancel your reservation?', [], ['context' => 'Patron menu']),
      'delete-reservation-modal-header-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('Cancel reservation', [], ['context' => 'Patron menu']),
          $this->t('Cancel reservations', [], ['context' => 'Patron menu']),
        ],
      ],
      'delete-reservation-modal-not-regrettable-text' => $this->t('You cannot regret this action', [], ['context' => 'Patron menu']),
      'digital-reservations-header-text' => $this->t('Digital reservations', [], ['context' => 'Patron menu']),
      'group-modal-button-text' => $this->t('Renewable (@count)', [], ['context' => 'Patron menu']),
      'group-modal-checkbox-text' => $this->t('Choose all renewable', [], ['context' => 'Patron menu']),
      'group-modal-due-date-header-text' => $this->t('Due date @date', [], ['context' => 'Patron menu']),
      'group-modal-due-date-link-to-page-with-fees-text' => $this->t('Read more about fees', [], ['context' => 'Patron menu']),
      'group-modal-due-date-material-text' => $this->t('To be returned @date', [], ['context' => 'Patron menu']),
      'group-modal-due-date-warning-loan-overdue-text' => $this->t('The due date of return is exceeded, therefore you will be charged a fee, when the item is returned', [], ['context' => 'Patron menu']),
      'group-modal-go-to-material-text' => $this->t('Go to material details', [], ['context' => 'Patron menu']),
      'group-modal-hidden-label-checkbox-on-material-text' => $this->t("Select @label", [], ['context' => 'Patron menu']),
      'group-modal-loans-aria-description-text' => $this->t("This modal makes it possible to renew materials", [], ['context' => 'Patron menu (Aria)']),
      'group-modal-loans-close-modal-aria-label-text' => $this->t("Close modal with grouped loans", [], ['context' => 'Patron menu (Aria)']),
      'group-modal-renew-loan-denied-inter-library-loan-text' => $this->t('The item has been lent to you by another library and renewal is therefore conditional of the acceptance by that library', [], ['context' => 'Patron menu']),
      'group-modal-renew-loan-denied-max-renewals-reached-text' => $this->t('The item cannot be renewed further', [], ['context' => 'Patron menu']),
      'group-modal-renew-loan-denied-reserved-text' => $this->t('The item is reserved by another patron', [], ['context' => 'Patron menu']),
      'group-modal-reservations-close-modal-aria-label-text' => $this->t('Close modal with grouped reservations', [], ['context' => 'Patron menu']),
      'group-modal-reservations-loans-aria-description-text' => $this->t('This modal makes it possible to delete reservations', [], ['context' => 'Patron menu']),
      'group-modal-return-library-text' => $this->t('Can be returned to all branches of (library) libraries', [], ['context' => 'Patron menu']),
      'loans-overdue-text' => $this->t('Returned too late', [], ['context' => 'Patron menu']),
      'loans-soon-overdue-text' => $this->t('To be returned soon', [], ['context' => 'Patron menu']),
      'material-and-author-text' => $this->t('and', [], ['context' => 'Patron menu']),
      'material-by-author-text' => $this->t('By', [], ['context' => 'Patron menu']),
      'material-details-close-modal-aria-label-text' => $this->t("Close material details modal", [], ['context' => 'Patron menu (Aria)']),
      'material-details-digital-due-date-label-text' => $this->t("Expires", [], ['context' => 'Patron menu']),
      'material-details-go-to-ereolen-text' => $this->t("Go to eReolen", [], ['context' => 'Patron menu']),
      'material-details-link-to-page-with-fees-text' => $this->t("Read more about fees", [], ['context' => 'Patron menu']),
      'material-details-loan-date-label-text' => $this->t("Loan date", [], ['context' => 'Patron menu']),
      'material-details-material-number-label-text' => $this->t("Material Item Number", [], ['context' => 'Patron menu']),
      'material-details-modal-aria-description-text' => $this->t("This modal shows material details, and makes it possible to renew a material, of that material is renewable", [], ['context' => 'Patron menu (Aria)']),
      'material-details-overdue-text' => $this->t("Expired", [], ['context' => 'Patron menu']),
      'material-details-physical-due-date-label-text' => $this->t("Due date", [], ['context' => 'Patron menu']),
      'material-details-renew-loan-button-text' => $this->t("Renew your loans", [], ['context' => 'Patron menu']),
      'material-details-warning-loan-overdue-text' => $this->t("The due date of return is exceeded, therefore you will be charged a fee, when the item is returned", [], ['context' => 'Patron menu']),
      'menu-authenticated-close-button-text' => $this->t('Close user menu', [], ['context' => 'Patron menu']),
      'menu-authenticated-modal-description-text' => $this->t('The user modal', [], ['context' => 'Patron menu']),
      'menu-log-out-text' => $this->t('Log out', [], ['context' => 'Patron menu']),
      'menu-login-text' => $this->t('Log in', [], ['context' => 'Patron menu']),
      'menu-not-authenticated-close-button-text' => $this->t('Close user menu', [], ['context' => 'Patron menu']),
      'menu-not-authenticated-modal-description-text' => $this->t('The user modal, log in or create a user', [], ['context' => 'Patron menu']),
      'menu-notification-loans-expired-text' => $this->t('loans expired', [], ['context' => 'Patron menu']),
      'menu-notification-loans-expiring-soon-text' => $this->t('loans expiring soon', [], ['context' => 'Patron menu']),
      'menu-notification-ready-for-pickup-text' => $this->t('reservations ready for pickup', [], ['context' => 'Patron menu']),
      'menu-notifications-menu-aria-label-text' => $this->t('Notifications menu', [], ['context' => 'Patron menu (aria)']),
      'menu-profile-links-aria-label-text' => $this->t('Profile links', [], ['context' => 'Patron menu (aria)']),
      'menu-sign-up-text' => $this->t('Sign up', [], ['context' => 'Patron menu']),
      'menu-user-icon-aria-label-text' => $this->t('Open user menu', [], ['context' => 'Patron menu (aria)']),
      'menu-user-profile-url-text' => $this->t('My Account', [], ['context' => 'Patron menu']),
      'physical-reservations-header-text' => $this->t('Physical reservations', [], ['context' => 'Patron menu']),
      'pick-up-latest-text' => $this->t('Pick up before @date', [], ['context' => 'Patron menu']),
      'ready-for-loan-counter-label-text' => $this->t('Ready', [], ['context' => 'Patron menu']),
      'ready-for-loan-text' => $this->t('Ready for pickup', [], ['context' => 'Patron menu']),
      'remove-all-reservations-text' => $this->t('Remove reservations', [], ['context' => 'Patron menu']),
      'reservation-details-borrow-before-text' => $this->t('Borrow before @date', [], ['context' => 'Patron menu']),
      'reservation-details-button-remove-text' => $this->t('Remove your reservation', [], ['context' => 'Patron menu']),
      'reservation-details-change-text' => $this->t('Apply changes', [], ['context' => 'Patron menu']),
      'reservation-details-date-of-reservation-title-text' => $this->t('Date of reservation', [], ['context' => 'Patron menu']),
      'reservation-details-digital-reservation-go-to-ereolen-text' => $this->t('Go to eReolen', [], ['context' => 'Patron menu']),
      'reservation-details-no-interest-after-title-text' => $this->t('Not interested after', [], ['context' => 'Patron menu']),
      'reservation-details-number-in-queue-label-text' => $this->t('@count queued', [], ['context' => 'Patron menu']),
      'reservation-details-others-in-queue-text' => $this->t('Others are queueing for this material', [], ['context' => 'Patron menu']),
      'reservation-details-pick-up-at-title-text' => $this->t('Pickup branch', [], ['context' => 'Patron menu']),
      'reservation-details-pickup-deadline-title-text' => $this->t('Pickup deadline', [], ['context' => 'Patron menu']),
      'reservation-details-ready-for-loan-text' => $this->t('Ready for pickup', [], ['context' => 'Patron menu']),
      'reservation-details-remove-digital-reservation-text' => $this->t('Remove your reservation', [], ['context' => 'Patron menu']),
      'reservation-details-status-title-text' => $this->t('Status', [], ['context' => 'Patron menu']),
      'reservation-list-digital-pickup-text' => $this->t('Online access', [], ['context' => 'Patron menu']),
      'reservations-ready-for-pickup-text' => $this->t('Reservations ready for pickup', [], ['context' => 'Patron menu']),
      'reservations-ready-text' => $this->t('Ready for you', [], ['context' => 'Patron menu']),
      'result-pager-status-text' => $this->t('Showing @itemsShown out of @hitcount loans', [], ['context' => 'Patron menu']),
      'show-more-text' => $this->t("show more", [], ['context' => 'Patron menu']),
      'status-badge-warning-text' => $this->t('Expires soon', [], ['context' => 'Patron menu']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      "#theme" => "dpl_react_app",
      "#name" => "menu",
      "#data" => $data,
    ];
  }

}
