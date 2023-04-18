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
class DashboardBlock extends BlockBase implements ContainerFactoryPluginInterface {
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
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    ConfigFactoryInterface $configFactory
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
    $this->configFactory = $configFactory;
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
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build(): array {
    $data = [
      // Config.
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
      'your-profile-text' => $this->t("Your profile", [], ['context' => 'dashboard list']),
      'intermediate-text' => $this->t("Intermediates", [], ['context' => 'dashboard list']),
      'total-owed-text' => $this->t("You owe in total", [], ['context' => 'dashboard list']),
      'pay-owed-text' => $this->t("Read more", [], ['context' => 'dashboard list']),
      'physical-loans-text' => $this->t("Physical loans", [], ['context' => 'dashboard list']),
      'reservations-text' => $this->t("Reservations", [], ['context' => 'dashboard list']),
      'loans-overdue-text' => $this->t("Returned too late", [], ['context' => 'dashboard list']),
      'loans-soon-overdue-text' => $this->t("To be returned soon", [], ['context' => 'dashboard list']),
      'loans-not-overdue-text' => $this->t("Longer return time", [], ['context' => 'dashboard list']),
      'reservations-ready-text' => $this->t("Ready for you", [], ['context' => 'dashboard list']),
      'no-physical-loans-text' => $this->t("At the moment, you have 0 physical loans", [], ['context' => 'dashboard list']),
      'no-reservations-text' => $this->t("At the moment, you have 0 reservations", [], ['context' => 'dashboard list']),
      'intermediate-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], ['context' => 'dashboard list']),
      'pay-owed-url' => $this->t("https://unsplash.com/photos/KRztl5I6xac", [], ['context' => 'dashboard list']),
      'physical-loans-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], ['context' => 'dashboard list']),
      'loans-overdue-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], ['context' => 'dashboard list']),
      'loans-soon-overdue-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], ['context' => 'dashboard list']),
      'loans-not-overdue-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], ['context' => 'dashboard list']),
      'reservations-url' => $this->t("https://unsplash.com/photos/7LzKELgdzzI", [], ['context' => 'dashboard list']),
      'reservations-still-in-queue-for-text' => $this->t("Still in queue", [], ['context' => 'dashboard list']),
      'ready-for-loan-text' => $this->t("Ready for loan", [], ['context' => 'dashboard list']),
      'publizon-audio-book-text' => $this->t("Audiobook", [], ['context' => 'dashboard list']),
      'publizon-ebook-text' => $this->t("E-book", [], ['context' => 'dashboard list']),
      'publizon-podcast-text' => $this->t("Podcast", [], ['context' => 'dashboard list']),
      'group-modal-due-date-header-text' => $this->t("Due date @date", [], ['context' => 'dashboard list']),
      'remove-all-reservations-text' => $this->t("Remove reservations", [], ['context' => 'dashboard list']),
      'choose-all-text' => $this->t("Select all", [], ['context' => 'dashboard list']),
      'physical-text' => $this->t("Physical", [], ['context' => 'dashboard list']),
      'group-modal-return-library-text' => $this->t("Can be returned to all branches of (library) libraries", [], ['context' => 'dashboard list']),
      'group-modal-checkbox-text' => $this->t("Choose all renewable", [], ['context' => 'dashboard list']),
      'group-modal-button-text' => $this->t("Renewable (@count)", [], ['context' => 'dashboard list']),
      'group-modal-renew-loan-denied-max-renewals-reached-text' => $this->t("The item cannot be renewed further", [], ['context' => 'dashboard list']),
      'group-modal-due-date-material-text' => $this->t("To be returned @date", [], ['context' => 'dashboard list']),
      'group-modal-go-to-material-text' => $this->t("Go to material details", [], ['context' => 'dashboard list']),
      'result-pager-status-text' => $this->t("Showing @itemsShown out of @hitcount loans", [], ['context' => 'dashboard list']),
      'loan-list-material-days-text' => $this->t("days", [], ['context' => 'dashboard list']),
      'group-modal-due-date-warning-loan-overdue-text' => $this->t("The due date of return is exceeded, therefore you will be charged a fee, when the item is returned", [], ['context' => 'dashboard list']),
      'group-modal-due-date-link-to-page-with-fees-text' => $this->t("Read more about fees", [], ['context' => 'dashboard list']),
      'fees-page-url' => $this->t("https://unsplash.com/photos/wd6YQy0PJt8", [], ['context' => 'dashboard list']),
      'group-modal-renew-loan-denied-reserved-text' => $this->t("The item is reserved by another patron", [], ['context' => 'dashboard list']),
      'group-modal-renew-loan-denied-inter-library-loan-text' => $this->t("The item has been lent to you by another library and renewal is therefore conditional of the acceptance by that library", [], ['context' => 'dashboard list']),
      'pick-up-latest-text' => $this->t("Pick up before", [], ['context' => 'dashboard list']),
      'dashboard-number-in-line-text' => $this->t("Number @count in line", [], ['context' => 'dashboard list']),
      'warning-icon-alt-text' => $this->t("warningIconAltText", [], ['context' => 'dashboard list']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      "#theme" => "dpl_react_app",
      "#name" => "dashboard",
      "#data" => $data,
    ];
  }

}
