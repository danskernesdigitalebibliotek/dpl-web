<?php

namespace Drupal\dpl_patron_menu\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_react\DplReactConfigInterface;
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
  public function __construct(
      array $configuration,
      $plugin_id,
      $plugin_definition,
      ConfigFactoryInterface $configFactory,
      private BranchSettings $branchSettings,
      private BranchRepositoryInterface $branchRepository,
      private DplReactConfigInterface $menuSettings,
      private GeneralSettings $generalSettings
  ) {
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
      \Drupal::service('dpl_patron_menu.settings'),
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
    $menuSettings = $this->menuSettings->loadConfig();
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');
    // Alternative to this menu array here this could be loaded from a drupal
    // generated menu. A place for further improvements.
    $menu = [
      [
        "name" => $this->t("Dashboard", [], ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_dashboard.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "40",
      ],
      [
        "name" => $this->t("Loans", [], ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_loans.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "1",
      ],
      [
        "name" => $this->t("Reservations", [], ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_reservations.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "2",
      ],
      [
        "name" => $this->t("My list", [], ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_favorites_list.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "20",
      ],
      [
        "name" => $this->t("Fees & Replacement costs", [], ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_fees.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "4",
      ],
      [
        "name" => $this->t("My account", [], ["context" => 'Patron menu']),
        "link" => dpl_react_apps_ensure_url_is_string(
          Url::fromRoute('dpl_dashboard.list', [], ['absolute' => TRUE])->toString()
        ),
        "dataId" => "40",
      ],
    ];

    $data = [
      // Config.
      'page-size-desktop' => $menuSettings->get('page_size_desktop'),
      'page-size-mobile' => $menuSettings->get('page_size_mobile'),
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
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
      "menu-sign-up-url" => Url::fromRoute('dpl_patron_reg.information', [], ['absolute' => TRUE])->toString(),
      'ereolen-my-page-url' => $generalSettings->get('ereolen_my_page_url'),
      'menu-view-your-profile-text-url' => Url::fromRoute('dpl_patron_page.profile', [], ['absolute' => TRUE])->toString(),
      'user-profile-url' => Url::fromRoute('dpl_patron_page.profile', [], ['absolute' => TRUE])->toString(),

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
      'menu-user-icon-aria-label-text' => $this->t('Open user menu', [], ['context' => 'Patron menu (aria)']),
      'menu-view-your-profile-text' => $this->t('Dashboard', [], ['context' => 'Patron menu']),
      'reservations-ready-for-pickup-text' => $this->t('Reservations ready for pickup', [], ['context' => 'Patron menu']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      "#theme" => "dpl_react_app",
      "#name" => "menu",
      "#data" => $data,
    ];
  }

}
