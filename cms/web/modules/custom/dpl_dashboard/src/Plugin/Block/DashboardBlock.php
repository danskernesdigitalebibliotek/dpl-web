<?php

namespace Drupal\dpl_dashboard\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user intermediate list.
 *
 * @Block(
 *   id = "dpl_dashboard_block",
 *   admin_label = "List user dashboard"
 * )
 */
class DashboardBlock extends BlockBase implements ContainerFactoryPluginInterface
{
  /**
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

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
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
    $this->configFactory = $configFactory;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
  {
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
  public function build()
  {

    $context = ['context' => 'dashboard list'];

    $fbsConfig = $this->configFactory->get('dpl_fbs.settings');
    $publizonConfig = $this->configFactory->get('dpl_publizon.settings');

    $data = [
      // Config.
      "fbs-base-url" => $fbsConfig->get('base_url'),
      "publizon-base-url" => $publizonConfig->get('base_url'),
      "page-size-desktop" => "25",
      "page-size-mobile" => "25",
      "threshold-config" => $this->configFactory->get('dpl_library_agency.general_settings')->get('threshold_config'),
      // Urls.
      // @todo update placeholder URL's
      // 'dashboard-page-url' => "https://unsplash.com/photos/wd6YQy0PJt8",
      // 'material-overdue-url' => "https://unsplash.com/photos/wd6YQy0PJt8",
      'search-url' => DplReactAppsController::searchResultUrl(),
      'dpl-cms-base-url' => DplReactAppsController::dplCmsBaseUrl(),
      // Texts.
      'your-profile-text' => $this->t("Your profile", [], $context),
      'intermediate-text' => $this->t("Intermediates", [], $context),
      'total-owed-text' => $this->t("You owe in total", [], $context),
      'pay-owed-text' => $this->t("Read more", [], $context),
      'physical-loans-text' => $this->t("Physical loans", [], $context),
      'reservations-text' => $this->t("Reservations", [], $context),
      'loans-overdue-text' => $this->t("To be returned soon", [], $context),
      'loans-soon-overdue-text' => $this->t("Returned too late", [], $context),
      'loans-not-overdue-text' => $this->t("Longer return time", [], $context),
      'reservations-ready-text' => $this->t("Ready for you", [], $context),
      'no-physical-loans-text' => $this->t("At the moment, you have 0 physical loans", [], $context),
      'no-reservations-text' => $this->t("At the moment, you have 0 reservations", [], $context),
      'intermediate-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], $context),
      'pay-owed-url' => $this->t("https://unsplash.com/photos/KRztl5I6xac", [], $context),
      'physical-loans-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], $context),
      'loans-overdue-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], $context),
      'loans-soon-overdue-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], $context),
      'loans-not-overdue-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], $context),
      'reservations-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], $context),
      'reservations-still-in-queue-for-text' => $this->t("Still in queue", [], $context),
      'ready-for-loan-text' => $this->t("Ready for loan", [], $context),
      'publizon-audio-book-text' => $this->t("Audiobook", [], $context),
      'publizon-ebook-text' => $this->t("E-book", [], $context),
      'publizon-podcast-text' => $this->t("Podcast", [], $context),
      'group-modal-due-date-header-text' => $this->t("Due date @date", [], $context),
      // 'group-modal-return-library-text' => $this->t("", [], $context),
      'group-modal-checkbox-text' => $this->t("Choose all renewable", [], $context),
      'group-modal-button-text' => $this->t("Renewable (@count)", [], $context),
      'group-modal-renew-loan-denied-max-renewals-reached-text' => $this->t("The item cannot be renewed further", [], $context),
      'group-modal-due-date-material-text' => $this->t("To be returned @date", [], $context),
      'group-modal-go-to-material-text' => $this->t("Go to material details", [], $context),
      'result-pager-status-text' => $this->t("Showing @itemsShown out of @hitcount loans", [], $context),
      'loan-list-material-days-text' => $this->t("days", [], $context),
      'group-modal-due-date-warning-loan-overdue-text' => $this->t("The due date of return is exceeded, therefore you will be charged a fee, when the item is returned", [], $context),
      'group-modal-due-date-link-to-page-with-fees-text' => $this->t("Read more about fees", [], $context),
      'fees-page-url' => $this->t("https://unsplash.com/photos/wd6YQy0PJt8", [], $context),
      'group-modal-renew-loan-denied-reserved-text' => $this->t("The item is reserved by another patron", [], $context),
      'group-modal-renew-loan-denied-inter-library-loan-text' => $this->t("The item has been lent to you by another library and renewal is therefore conditional of the acceptance by that library", [], $context),
      'pick-up-latest-text' => $this->t("Pick up before", [], $context),
      'dashboard-number-in-line-text' => $this->t("Number @count in line", [], $context),
      'warning-icon-alt-text' => $this->t("warningIconAltText", [], $context),
    ] + DplReactAppsController::externalApiBaseUrls();

    $app = [
      "#theme" => "dpl_react_app",
      "#name" => "DashBoard",
      "#data" => $data,
    ];

    return $app;
  }
}

