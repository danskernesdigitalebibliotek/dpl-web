<?php

namespace Drupal\dpl_loans\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
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
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

  /**
   * LoanListBlock constructor.
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
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory) {
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
   * Gets threshold config.
   *
   * @return string
   *   Returns the threshold config.
   */
  public function getThresholdConfig(): string {
    $generalSettings = $this->configFactory->get('dpl_library_agency.general_settings');
    return $generalSettings->get('threshold_config');
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $loanListSettings = $this->configFactory->get('dpl_loan_list.settings');
    $context = ['context' => 'Loan list'];
    $contextAria = ['context' => 'Loan list (Aria)'];
    $fbsConfig = $this->configFactory->get('dpl_fbs.settings');
    $publizonConfig = $this->configFactory->get('dpl_publizon.settings');

    $data = [
      // Page size.
      "page-size-desktop" => $loanListSettings->get('page_size_desktop'),
      "page-size-mobile" => $loanListSettings->get('page_size_mobile'),
      // Config.
      "threshold-config" => $this->getThresholdConfig(),
      // Urls.
      "fbs-base-url" => $fbsConfig->get('base_url'),
      "publizon-base-url" => $publizonConfig->get('base_url'),
      'fees-page-url' => $loanListSettings->get('fees_page_url'),
      'material-overdue-url' => $loanListSettings->get('material_overdue_url'),
      'dpl-cms-base-url' => DplReactAppsController::dplCmsBaseUrl(),
      // Texts.
      'group-modal-due-date-link-to-page-with-fees-text' => $this->t("Read more about fees", [], $context),
      'group-modal-due-date-renew-loan-close-modal-aria-label-text' => $this->t("Close renew loans modal", [], $contextAria),
      'group-modal-due-date-aria-description-text' => $this->t("This modal groups loans after due date and makes it possible to renew said loans", [], $contextAria),
      'group-modal-checkbox-text' => $this->t("Choose all renewable", [], $context),
      'group-modal-due-date-header-text' => $this->t("Due date @date", [], $context),
      'group-modal-due-date-warning-loan-overdue-text' => $this->t("The due date of return is exceeded, therefore you will be charged a fee, when the item is returned", [], $context),
      'group-modal-go-to-material-text' => $this->t("Go to material details", [], $context),
      'group-modal-return-library-text' => $this->t("Can be returned to all branches of the municipalities libraries", [], $context),
      'loan-list-aria-label-list-button-text' => $this->t("This button shows all loans in the list", [], $contextAria),
      'loan-list-aria-label-stack-button-text' => $this->t("This button filters the list, so only one the materials that have the same due date is shown", [], $contextAria),
      'group-modal-renew-loan-denied-inter-library-loan-text' => $this->t("The item has been lent to you by another library and renewal is therefore conditional of the acceptance by that library", [], $context),
      'group-modal-renew-loan-denied-max-renewals-reached-text' => $this->t("The item cannot be renewed further", [], $context),
      'group-modal-renew-loan-denied-reserved-text' => $this->t("The item is reserved by another patron", [], $context),
      'loan-list-digital-loans-empty-list-text' => $this->t("You have no digital loans at the moment", [], $context),
      'loan-list-digital-loans-title-text' => $this->t("Digital loans", [], $context),
      'loan-list-digital-physical-loans-empty-list-text' => $this->t("You have 0 loans at the moment", [], $context),
      'loan-list-due-date-modal-aria-label-text' => $this->t("This button opens a modal that covers the entire page and contains loans with the same due date as the loan currently in focus", [], $contextAria),
      'group-modal-hidden-label-checkbox-on-material-text' => $this->t("Select @label for renewal", [], $context),
      'loan-list-material-late-fee-text' => $this->t("You will be charged a fee, when the item is returned", [], $context),
      'loan-list-material-days-text' => $this->t("days", [], $context),
      'loan-list-material-day-text' => $this->t("day", [], $context),
      'loan-list-additional-materials-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('+ 1 other material', [], $context),
          $this->t('+ @count other materials', [], $context),
        ],
      ],
      'loan-list-physical-loans-empty-list-text' => $this->t("You have no physical loans at the moment", [], $context),
      'loan-list-physical-loans-title-text' => $this->t("Physical loans", [], $context),
      'loan-list-renew-multiple-button-explanation-text' => $this->t("This button opens a modal that covers the entire page and contains loans with different due dates, if some of the loans in the modal are renewable you can renew them", [], $context),
      'loan-list-renew-multiple-button-text' => $this->t("Renew several", [], $context),
      'loan-list-status-badge-danger-text' => $this->t("Expired", [], $context),
      'loan-list-status-badge-warning-text' => $this->t("Expiring soon", [], $context),
      'loan-list-title-text' => $this->t("Your loans", [], $context),
      'loan-list-to-be-delivered-digital-material-text' => $this->t("Due date @date", [], $context),
      'group-modal-due-date-material-text' => $this->t("Due date @date", [], $context),
      'loan-list-to-be-delivered-text' => $this->t("Due date @date", [], $context),
      'material-and-author-text' => $this->t("and", [], $context),
      'material-by-author-text' => $this->t("By", [], $context),
      'material-details-close-modal-aria-label-text' => $this->t("Close material details modal", [], $contextAria),
      'material-details-digital-due-date-label-text' => $this->t("Expires", [], $context),
      'material-details-physical-due-date-label-text' => $this->t("Due date", [], $context),
      'material-details-go-to-ereolen-text' => $this->t("Go to eReolen", [], $context),
      'material-details-link-to-page-with-fees-text' => $this->t("Read more about fees", [], $context),
      'material-details-loan-date-label-text' => $this->t("Loan date", [], $context),
      'material-details-material-number-label-text' => $this->t("Material Item Number", [], $context),
      'material-details-modal-aria-description-text' => $this->t("This modal shows material details, and makes it possible to renew a material, of that material is renewable", [], $contextAria),
      'material-details-overdue-text' => $this->t("Expired", [], $context),
      'material-details-renew-loan-button-text' => $this->t("Renew your loans", [], $context),
      'material-details-warning-loan-overdue-text' => $this->t("The due date of return is exceeded, therefore you will be charged a fee, when the item is returned", [], $context),
      'publizon-audio-book-text' => $this->t("Audiobook", [], $context),
      'publizon-ebook-text' => $this->t("E-book", [], $context),
      'publizon-podcast-text' => $this->t("Podcast", [], $context),
      'group-modal-aria-description-text' => $this->t("This modal makes it possible to renew materials", [], $contextAria),
      'group-modal-button-text' => $this->t("Renewable (@count)", [], $context),
      'group-modal-close-modal-aria-label-text' => $this->t("Close modal with grouped loans", [], $contextAria),
      'group-modal-header-text' => $this->t("Renew several", [], $context),
      'result-pager-status-text' => $this->t("Showing @itemsShown out of @hitcount loans", [], $context),
      'show-more-text' => $this->t("show more", [], $context),
      'group-modal-go-to-material-aria-label-text' => $this->t("Go to @label material details", [], $contextAria),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'loan-list',
      '#data' => $data,
    ];
  }

}
