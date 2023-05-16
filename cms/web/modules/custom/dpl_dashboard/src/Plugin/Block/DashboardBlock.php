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
    $dashboardSettings = $this->configFactory->get('dashboard.settings');
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');

    $data = [
      // Config.
      "page-size-desktop" => $dashboardSettings->get('page_size_desktop'),
      "page-size-mobile" => $dashboardSettings->get('page_size_mobile'),
      "threshold-config" => $this->configFactory->get('dpl_library_agency.general_settings')->get('threshold_config'),
      // Urls.
      'dpl-cms-base-url' => DplReactAppsController::dplCmsBaseUrl(),
      'fees-page-url' => $generalSettings->get('fees_page_url'),
      'intermediate-url' => $dashboardSettings->get("intermediate_url"),
      'pay-owed-url' => $dashboardSettings->get("pay_owed_url"),
      'physical-loans-url' => $dashboardSettings->get("physical_loans_url"),
      'loans-overdue-url' => $dashboardSettings->get("loans_overdue_url"),
      'loans-soon-overdue-url' => $dashboardSettings->get("loans_soon_overdue_url"),
      'loans-not-overdue-url' => $dashboardSettings->get("loans_not_overdue_url"),
      'reservations-url' => $dashboardSettings->get("reservations_url"),
      'search-url' => DplReactAppsController::searchResultUrl(),
      // Texts.
      'choose-all-text' => $this->t("Select all", [], ['context' => 'Dashboard']),
      'dashboard-number-in-line-text' => $this->t("Number @count in line", [], ['context' => 'Dashboard']),
      'digital-text' => $this->t("Digital", [], ['context' => 'Dashboard']),
      'group-modal-button-text' => $this->t("Renewable (@count)", [], ['context' => 'Dashboard']),
      'group-modal-checkbox-text' => $this->t("Choose all renewable", [], ['context' => 'Dashboard']),
      'group-modal-due-date-aria-description-text' => $this->t("This modal groups loans after due date and makes it possible to renew said loans", [], ['context' => 'Dashboard']),
      'group-modal-due-date-header-text' => $this->t("Due date @date", [], ['context' => 'Dashboard']),
      'group-modal-due-date-link-to-page-with-fees-text' => $this->t("Read more about fees", [], ['context' => 'Dashboard']),
      'group-modal-due-date-material-text' => $this->t("To be returned @date", [], ['context' => 'Dashboard']),
      'group-modal-due-date-renew-loan-close-modal-aria-label-text' => $this->t("Close renew loans modal", [], ['context' => 'Dashboard']),
      'group-modal-due-date-warning-loan-overdue-text' => $this->t("The due date of return is exceeded, therefore you will be charged a fee, when the item is returned", [], ['context' => 'Dashboard']),
      'group-modal-go-to-material-text' => $this->t("Go to material details", [], ['context' => 'Dashboard']),
      'group-modal-renew-loan-denied-inter-library-loan-text' => $this->t("The item has been lent to you by another library and renewal is therefore conditional of the acceptance by that library", [], ['context' => 'Dashboard']),
      'group-modal-renew-loan-denied-max-renewals-reached-text' => $this->t("The item cannot be renewed further", [], ['context' => 'Dashboard']),
      'group-modal-renew-loan-denied-reserved-text' => $this->t("The item is reserved by another patron", [], ['context' => 'Dashboard']),
      'group-modal-return-library-text' => $this->t("Can be returned to all branches of (library) libraries", [], ['context' => 'Dashboard']),
      'intermediate-text' => $this->t("Intermediates", [], ['context' => 'Dashboard']),
      'loan-list-material-days-text' => $this->t("days", [], ['context' => 'Dashboard']),
      'loans-not-overdue-text' => $this->t("Longer return time", [], ['context' => 'Dashboard']),
      'loans-overdue-text' => $this->t("Returned too late", [], ['context' => 'Dashboard']),
      'loans-soon-overdue-text' => $this->t("To be returned soon", [], ['context' => 'Dashboard']),
      'material-and-author-text' => $this->t("and", [], ['context' => 'Dashboard']),
      'material-by-author-text' => $this->t("By", [], ['context' => 'Dashboard']),
      'no-physical-loans-text' => $this->t("At the moment, you have 0 physical loans", [], ['context' => 'Dashboard']),
      'no-reservations-text' => $this->t("At the moment, you have 0 reservations", [], ['context' => 'Dashboard']),
      'pay-owed-text' => $this->t("Read more", [], ['context' => 'Dashboard']),
      'physical-loans-text' => $this->t("Physical loans", [], ['context' => 'Dashboard']),
      'physical-text' => $this->t("Physical", [], ['context' => 'Dashboard']),
      'pick-up-latest-text' => $this->t("Pick up before", [], ['context' => 'Dashboard']),
      'publizon-audio-book-text' => $this->t("Audiobook", [], ['context' => 'Dashboard']),
      'publizon-ebook-text' => $this->t("E-book", [], ['context' => 'Dashboard']),
      'publizon-podcast-text' => $this->t("Podcast", [], ['context' => 'Dashboard']),
      'ready-for-loan-counter-label-text' => $this->t("Ready", [], ['context' => 'Dashboard']),
      'ready-for-loan-modal-aria-description-text' => $this->t("This modal shows materials that are ready for loan", [], ['context' => 'Dashboard']),
      'ready-for-loan-text' => $this->t("Ready for loan", [], ['context' => 'Dashboard']),
      'ready-to-loan-close-modal-aria-label-text' => $this->t("Close ready to loan details modal", [], ['context' => 'Dashboard']),
      'remove-all-reservations-text' => $this->t("Remove reservations", [], ['context' => 'Dashboard']),
      'reservations-ready-text' => $this->t("Ready for you", [], ['context' => 'Dashboard']),
      'reservations-still-in-queue-for-text' => $this->t("Still in queue", [], ['context' => 'Dashboard']),
      'reservations-text' => $this->t("Reservations", [], ['context' => 'Dashboard']),
      'result-pager-status-text' => $this->t("Showing @itemsShown out of @hitcount loans", [], ['context' => 'Dashboard']),
      'still-in-queue-close-modal-aria-label-text' => $this->t("Close still in queue details modal", [], ['context' => 'Dashboard']),
      'still-in-queue-modal-aria-description-text' => $this->t("This modal shows materials that are still in queue", [], ['context' => 'Dashboard']),
      'total-owed-text' => $this->t("You owe in total", [], ['context' => 'Dashboard']),
      'warning-icon-alt-text' => $this->t("warningIconAltText", [], ['context' => 'Dashboard']),
      'your-profile-text' => $this->t("Your profile", [], ['context' => 'Dashboard']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      "#theme" => "dpl_react_app",
      "#name" => "DashBoard",
      "#data" => $data,
    ];
  }

}
