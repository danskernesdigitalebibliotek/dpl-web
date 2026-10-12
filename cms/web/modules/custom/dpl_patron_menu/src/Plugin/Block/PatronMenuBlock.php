<?php

namespace Drupal\dpl_patron_menu\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_login\DplLoginInterface;
use Drupal\dpl_login\UserTokens;
use Drupal\dpl_patron_menu\DplMenuSettings;
use Drupal\dpl_patron_reg\DplPatronRegSettings;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\json_encode as json_encode;

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
   * PatronMenuBlock constructor.
   *
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_patron_menu\DplMenuSettings $patronMenuSettings
   *   Patron menu settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch settings for getting branches.
   * @param \Drupal\dpl_library_agency\GeneralSettings $generalSettings
   *   General settings.
   * @param \Drupal\dpl_patron_reg\DplPatronRegSettings $patronRegSettings
   *   Patron registration settings.
   * @param \Drupal\dpl_login\UserTokens $userTokens
   *   The user tokens of the current user.
   * @param \Drupal\Core\Session\AccountInterface $currentUser
   *   The current user.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected DplMenuSettings $patronMenuSettings,
    protected BranchSettings $branchSettings,
    protected BranchRepositoryInterface $branchRepository,
    protected GeneralSettings $generalSettings,
    protected DplPatronRegSettings $patronRegSettings,
    protected UserTokens $userTokens,
    protected AccountInterface $currentUser,
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
   * @return \Drupal\dpl_patron_menu\Plugin\Block\PatronMenuBlock|static
   *   Patron menu block.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_patron_menu.settings'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      $container->get('dpl_library_agency.general_settings'),
      $container->get('dpl_patron_reg.settings'),
      $container->get('dpl_login.user_tokens'),
      $container->get('current_user'),
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
    $patronRegSettings = $this->patronRegSettings;
    // Only a Unilogin student has a uni-id, so only then does the menu vary
    // per user.
    $is_unilogin_user = $this->currentUser->hasRole(DplLoginInterface::ROLE_UNILOGIN_PATRON);
    $generalSettings = $this->generalSettings->loadConfig();

    // Alternative to this menu array here this could be loaded from a drupal
    // generated menu. A place for further improvements.
    $menu = [
      [
        "name" => $this->t('Dashboard', [], ['context' => 'Patron menu']),
        'link' => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_dashboard.list', [], ['absolute' => TRUE])->toString()
        ),
        'dataId' => '40',
      ],
      [
        'name' => $this->t('Loans', [], ['context' => 'Patron menu']),
        'link' => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_loans.list', [], ['absolute' => TRUE])->toString()
        ),
        'dataId' => '1',
      ],
      [
        'name' => $this->t('Reservations', [], ['context' => 'Patron menu']),
        'link' => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_reservations.list', [], ['absolute' => TRUE])->toString()
        ),
        'dataId' => '2',
      ],
      [
        'name' => $this->t('My list', [], ['context' => 'Patron menu']),
        'link' => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_favorites_list.list', [], ['absolute' => TRUE])->toString()
        ),
        'dataId' => '20',
      ],
      [
        'name' => $this->t('Fees & Replacement costs', [], ['context' => 'Patron menu']),
        'link' => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_fees.list', [], ['absolute' => TRUE])->toString()
        ),
        'dataId' => '4',
      ],
    ];

    $data = [
      // Config.
      'page-size-desktop' => $this->patronMenuSettings->getListSizeDesktop(),
      'page-size-mobile' => $this->patronMenuSettings->getListSizeMobile(),
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
      // A Unilogin student is logged in without being a patron, so the header
      // shows the student's uni-id instead of a name.
      'unilogin-user-id-config' => ($is_unilogin_user ? $this->userTokens->getUniloginUserId() : NULL) ?? '',
      "expiration-warning-days-before-config" => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettings::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,
      "menu-navigation-data-config" => json_encode($menu, JSON_THROW_ON_ERROR),
      'reservation-detail-allow-remove-ready-reservations-config' => $generalSettings->get('reservation_detail_allow_remove_ready_reservations'),
      'interest-periods-config' => json_encode($this->generalSettings->getInterestPeriodsConfig()),

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
      "menu-sign-up-url" => $patronRegSettings->getPatronRegistrationPageUrl(),
      'menu-view-your-profile-text-url' => Url::fromRoute('dpl_patron_page.profile', [], ['absolute' => TRUE])->toString(),

      // Texts.
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
      'menu-user-profile-url-text' => $this->t('My Account', [], ['context' => 'Patron menu']),
      'menu-user-icon-aria-label-logged-out-text' => $this->t('Open user menu', [], ['context' => 'Patron menu (aria)']),
      'menu-user-icon-aria-label-text' => $this->t('Open login menu', [], ['context' => 'Patron menu (aria)']),
      'menu-view-your-profile-text' => $this->t('Dashboard', [], ['context' => 'Patron menu']),
      'reservations-ready-for-pickup-text' => $this->t('Reservations ready for pickup', [], ['context' => 'Patron menu']),
      'unilogin-patron-login-cancel-text' => $this->t('Stay logged in with Unilogin', [], ['context' => 'Patron menu']),
      'unilogin-patron-login-confirm-text' => $this->t('Log out and log in as a patron', [], ['context' => 'Patron menu']),
      'unilogin-patron-login-description-text' => $this->t('This requires logging in as a library patron.', [], ['context' => 'Patron menu']),
      'unilogin-patron-login-heading-text' => $this->t('You are logged in with Unilogin', [], ['context' => 'Patron menu']),
      'unilogin-patron-login-logout-text' => $this->t('If you continue, you will be logged out of Unilogin.', [], ['context' => 'Patron menu']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      "#theme" => "dpl_react_app",
      "#name" => "menu",
      "#data" => $data,
      "#cache" => ["contexts" => $is_unilogin_user ? ["user.roles", "user"] : ["user.roles"]],
    ];
  }

}
