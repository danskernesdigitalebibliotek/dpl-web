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
   * @param \Drupal\dpl_react\DplReactConfigInterface $feesSettings
   *   Fees settings.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private DplReactConfigInterface $feesSettings
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
      \Drupal::service('dpl_fees.settings')
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $feesConfig = $this->feesSettings->loadConfig();

    $data = [
      // Config.
      "page-size-desktop" => $feesConfig->get('page_size_desktop') ?? DplFeesSettings::PAGE_SIZE_DESKTOP,
      "page-size-mobile" => $feesConfig->get('page_size_mobile') ?? DplFeesSettings::PAGE_SIZE_MOBILE,

      // Urls.
      // @todo images to be done in future tender.
      'available-payment-types-url' => dpl_react_apps_format_app_url($feesConfig->get('available_payment_types_url'), DplFeesSettings::AVAILABLE_PAYMENT_TYPES_URL),
      'payment-overview-url' => dpl_react_apps_format_app_url($feesConfig->get('payment_overview_url'), DplFeesSettings::PAYMENT_OVERVIEW_URL),
      'terms-of-trade-url' => dpl_react_apps_format_app_url($feesConfig->get('terms_of_trade_url'), DplFeesSettings::TERMS_OF_TRADE_URL),
      'view-fees-and-compensation-rates-url' => dpl_react_apps_format_app_url($feesConfig->get('fees_and_replacement_costs_url'), DplFeesSettings::FEES_AND_REPLACEMENT_COSTS_URL),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'fee-list',
      '#data' => $data,
    ];
  }

}
