<?php

namespace Drupal\dpl_loans\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_loans\DplLoansSettings;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user loans list.
 *
 * @Block(
 *   id = "dpl_loans_list_block",
 *   admin_label = "List user loans"
 * )
 */
class LoanListBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * LoanListBlock constructor.
   *
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_loans\DplLoansSettings $loansSettings
   *   Loans settings.
   * @param \Drupal\dpl_library_agency\GeneralSettings $generalSettings
   *   General settings.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private DplLoansSettings $loansSettings,
    private GeneralSettings $generalSettings,
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
      $container->get('dpl_loans.settings'),
      $container->get('dpl_library_agency.general_settings'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $generalSettings = $this->generalSettings->loadConfig();

    $data = [
      // Page size.
      "page-size-desktop" => $this->loansSettings->getListSizeDesktop(),
      "page-size-mobile" => $this->loansSettings->getListSizeMobile(),

      // Config.
      "expiration-warning-days-before-config" => $generalSettings->get('expiration_warning_days_before_config') ?? GeneralSettings::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,

      // Urls.
      'ereolen-my-page-url' => dpl_react_apps_format_app_url($generalSettings->get('ereolen_my_page_url'), GeneralSettings::EREOLEN_MY_PAGE_URL),
      'material-overdue-url' => Url::fromRoute('dpl_loans.list', [], ['absolute' => TRUE])->toString(),

      // Texts.
      'group-modal-header-text' => $this->t("Renew several", [], ['context' => 'Loan list']),
      'loan-list-aria-label-list-button-text' => $this->t("This button shows all loans in the list", [], ['context' => 'Loan list (Aria)']),
      'loan-list-aria-label-stack-button-text' => $this->t("This button filters the list, so only one the materials that have the same due date is shown", [], ['context' => 'Loan list (Aria)']),
      'loan-list-digital-loans-empty-list-text' => $this->t("You have no digital loans at the moment", [], ['context' => 'Loan list']),
      'loan-list-digital-loans-title-text' => $this->t("Digital loans", [], ['context' => 'Loan list']),
      'loan-list-digital-physical-loans-empty-list-text' => $this->t("You have 0 loans at the moment", [], ['context' => 'Loan list']),
      'loan-list-due-date-modal-aria-label-text' => $this->t("This button opens a modal that covers the entire page and contains loans with the same due date as the loan currently in focus", [], ['context' => 'Loan list (Aria)']),
      'loan-list-material-day-text' => $this->t("day", [], ['context' => 'Loan list']),
      'loan-list-material-days-text' => $this->t("days", [], ['context' => 'Loan list']),
      'loan-list-material-late-fee-text' => $this->t("You will be charged a fee, when the item is returned", [], ['context' => 'Loan list']),
      'loan-list-physical-loans-empty-list-text' => $this->t("You have no physical loans at the moment", [], ['context' => 'Loan list']),
      'loan-list-physical-loans-title-text' => $this->t("Physical loans", [], ['context' => 'Loan list']),
      'loan-list-renew-multiple-button-explanation-text' => $this->t("This button opens a modal that covers the entire page and contains loans with different due dates, if some of the loans in the modal are renewable you can renew them", [], ['context' => 'Loan list']),
      'loan-list-renew-multiple-button-text' => $this->t("Renew several", [], ['context' => 'Loan list']),
      'loan-list-no-items-can-be-renewed-text' => $this->t("No materials can be renewed", [], ['context' => 'Loan list']),
      'loan-list-status-badge-danger-text' => $this->t("Expired", [], ['context' => 'Loan list']),
      'loan-list-status-badge-warning-text' => $this->t("Expiring soon", [], ['context' => 'Loan list']),
      'loan-list-title-text' => $this->t("Your loans", [], ['context' => 'Loan list']),
      'loan-list-to-be-delivered-digital-material-text' => $this->t("Due date digital @date", [], ['context' => 'Loan list']),
      'loan-list-to-be-delivered-text' => $this->t("Due date physical @date", [], ['context' => 'Loan list']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'loan-list',
      '#data' => $data,
    ];
  }

}
