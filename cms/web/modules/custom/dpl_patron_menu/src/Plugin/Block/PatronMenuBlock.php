<?php

namespace Drupal\dpl_patron_menu\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user intermediate list.
 *
 * @Block(
 *   id = "dpl_menu_block",
 *   admin_label = "List user menu"
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
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory) {
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
   * @return \Drupal\dpl_loans\Plugin\Block\LoanListBlock|static
   *   Loan list block.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $context = ["context" => 'Patron menu'];

    $fbsConfig = $this->configFactory->get('dpl_fbs.settings');
    $publizonConfig = $this->configFactory->get('dpl_publizon.settings');
    $menuConfig = $this->configFactory->get("dpl_patron_menu.settings");

    $data = [
      // Config.
      "threshold-config" => $this->configFactory->get('dpl_library_agency.general_settings')->get('threshold_config'),
      // "menu-navigation-data-config" => $this->configFactory->get('dpl_patron_menu.settings')->get('menu_navigation_data_config'),
      "menu-navigation-data-config" => '[{"name": "Loans","link": "","dataId": "1"},{"name": "Reservations","link": "","dataId": "2"},{"name": "My list","link": "","dataId": "3"},{"name": "Fees & Replacement costs","link": "","dataId": "4"},{"name": "My account","link": "","dataId": "5"}]',
      "menu-login-url" => $menuConfig->get("menu_login_link"),
      "menu-sign-up-url" => $menuConfig->get("menu_create_user_link"),
      "fbs-base-url" => $fbsConfig->get('base_url'),
      "publizon-base-url" => $publizonConfig->get('base_url'),
      "page-size-desktop" => "25",
      "page-size-mobile" => "25",
      // Urls.
      // @todo update placeholder URL's
      // 'menu-page-url" => "https://unsplash.com/photos/wd6YQy0PJt8",
      // 'material-overdue-url" => "https://unsplash.com/photos/wd6YQy0PJt8",
      "search-url" => DplReactAppsController::searchResultUrl(),
      "dpl-cms-base-url" => DplReactAppsController::dplCmsBaseUrl(),

      // Texts.
      "menu-view-your-profile-text" => $this->t("My Account", [], $context),
      "menu-view-your-profile-text-url" => $this->t("https://unsplash.com/photos/tNJdaBc-r5c", [], $context),
      "menu-notification-loans-expired-text" => $this->t("loans expired", [], $context),
      "menu-notification-loans-expired-url" => $this->t("https://unsplash.com/photos/tNJdaBc-r5c", [], $context),
      "menu-notification-loans-expiring-soon-text" => $this->t("loans expiring soon", [], $context),
      "menu-notification-loans-expiring-soon-url" => $this->t("https://unsplash.com/photos/tNJdaBc-r5c", [], $context),
      "menu-notification-ready-for-pickup-text" => $this->t("reservations ready for pickup", [], $context),
      "menu-notification-ready-for-pickup-url" => $this->t("https://unsplash.com/photos/tNJdaBc-r5c", [], $context),
      "menu-log-out-text" => $this->t("Log Out", [], $context),
      "menu-log-out-url" => $this->t("https://unsplash.com/photos/tNJdaBc-r5c", [], $context),
      "menu-login-text" => $this->t("Log in", [], $context),
      "menu-sign-up-text" => $this->t("Sign up", [], $context),
    ] + DplReactAppsController::externalApiBaseUrls();

    $app = [
      "#theme" => "dpl_react_app",
      "#name" => "menu",
      "#data" => $data,
    ];
    return $app;
  }

}
