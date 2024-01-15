<?php

namespace Drupal\dpl_fees\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_fees\DplFeesSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user fee list.
 *
 * @Block(
 *   id = "dpl_fees_list_block",
 *   admin_label = "List user fees"
 * )
 */
class FeesListBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * FeesListBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_fees\DplFeesSettings $feesSettings
   *   Fees settings.
   * @param \Drupal\dpl_react\DplReactConfigInterface $feesConfig
   *   Fees config.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private DplFeesSettings $feesSettings,
    private DplReactConfigInterface $feesConfig,
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
      $container->get('dpl_fees.settings'),
      \Drupal::service('dpl_fees.settings'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $feesConfig = $this->feesConfig->loadConfig();

    $data = [
      // Config.
      "page-size-desktop" => $this->feesSettings->getListSizeDesktop(),
      "page-size-mobile" => $this->feesSettings->getListSizeMobile(),

      // Urls.
      'payment-overview-url' => dpl_react_apps_format_app_url($feesConfig->get('payment_overview_url'), DplFeesSettings::PAYMENT_OVERVIEW_URL),
      'view-fees-and-compensation-rates-url' => dpl_react_apps_format_app_url($feesConfig->get('fees_and_replacement_costs_url'), DplFeesSettings::FEES_AND_REPLACEMENT_COSTS_URL),

      // Texts.
      'already-paid-text' => $this->t("Please note that paid fees are not registered up until 72 hours after your payment after which your debt is updated and your user unblocked if it has been blocked.", [], ['context' => 'Fees list']),
      'empty-fee-list-text' => $this->t("You have 0 unpaid fees or replacement costs", [], ['context' => 'Fees list']),
      'fee-created-text' => $this->t("Fees charged @date", [], ['context' => 'Fees list']),
      'fee-details-modal-close-modal-aria-label-text' => $this->t("Close fee details modal", [], ['context' => 'Fees list (Aria)']),
      'fee-details-modal-description-text' => $this->t("Modal containing information about this element or group of elements fees", [], ['context' => 'Fees list']),
      'fee-details-modal-screen-reader-text' => $this->t("A modal containing details about a fee", [], ['context' => 'Fees list']),
      'fee-list-already-paid-info-text' => $this->t("Already paid? It can take up to 72 hours register the transaction.", [], ['context' => 'Fees list']),
      'fee-list-body-text' => $feesConfig->get('fee_list_body_text') ?? DplFeesSettings::FEE_LIST_BODY_TEXT,
      'fee-list-days-text' => $this->t("Days", [], ['context' => 'Fees list']),
      'fee-list-headline-text' => $this->t("Fees & replacement costs", [], ['context' => 'Fees list']),
      'fee-list-material-number-text' => $this->t("# @materialNumber", [], ['context' => 'Fees list']),
      'fee-payment-modal-body-text' => $this->t("You will be redirected to Mit Betalingsoverblik.", [], ['context' => 'Fees list']),
      'fee-payment-modal-cancel-text' => $this->t("Cancel", [], ['context' => 'Fees list']),
      'fee-payment-modal-goto-text' => $this->t("Go to Mit Betalingsoverblik", [], ['context' => 'Fees list']),
      'fee-payment-modal-header-text' => $this->t("Unpaid fees post 27/10 2020", [], ['context' => 'Fees list']),
      'fee-payment-modal-notice-text' => $this->t("Paid fees can take up to 24 hours to registrer.", [], ['context' => 'Fees list']),
      'i-accept-text' => $this->t("I accept the", [], ['context' => 'Fees list']),
      'item-fee-amount-text' => $this->t("Fee @fee,-", [], ['context' => 'Fees list']),
      'material-number-text' => $this->t("# @materialNumber", [], ['context' => 'Fees list']),
      'other-materials-text' => $this->t("Other materials", [], ['context' => 'Fees list']),
      'pay-text' => $this->t("Pay", [], ['context' => 'Fees list']),
      'plus-x-other-materials-text' => $this->t("+ @amount other materials", [], ['context' => 'Fees list']),
      'post-payment-type-change-date-text' => $this->t("AFTER 27/10 2020", [], ['context' => 'Fees list']),
      'pre-payment-type-change-date-text' => $this->t("BEFORE 27/10 2020", [], ['context' => 'Fees list']),
      'total-fee-amount-text' => $this->t("Fee", [], ['context' => 'Fees list']),
      'total-text' => $this->t("Total: @total", [], ['context' => 'Fees list']),
      'turned-in-text' => $this->t("Turned in @date", [], ['context' => 'Fees list']),
      'unpaid-fees-first-headline-text' => $this->t("Unsettled debt 1", [], ['context' => 'Fees list']),
      'unpaid-fees-second-headline-text' => $this->t("Unsettled debt 2", [], ['context' => 'Fees list']),
      'view-fees-and-compensation-rates-text' => $this->t("see our fees and replacement costs", [], ['context' => 'Fees list']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'fee-list',
      '#data' => $data,
    ];
  }

}
