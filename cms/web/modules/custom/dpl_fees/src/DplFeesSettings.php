<?php

namespace Drupal\dpl_fees;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles instant loan settings.
 */
class DplFeesSettings extends DplReactConfigBase {
  const FEES_AND_REPLACEMENT_COSTS_URL = '';
  const PAYMENT_SITE_URL = '';
  const FEES_LIST_SIZE_DESKTOP = 25;
  const FEES_LIST_SIZE_MOBILE = 25;
  const BLOCKED_PATRON_E_LINK_URL = '';

  use StringTranslationTrait;

  /**
   * Gets the configuration key for the instant loan settings.
   */
  public function getConfigKey(): string {
    return 'dpl_fees.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

  /**
   * Get the getViewFeesAndCompensationRates url.
   *
   * @return string
   *   The url.
   */
  public function getViewFeesAndCompensationRatesUrl(): string {
    return dpl_react_apps_format_app_url(
      $this->loadConfig()->get('fees_and_replacement_costs_url'),
      self::FEES_AND_REPLACEMENT_COSTS_URL
    );
  }

  /**
   * Get FeeListBodyText.
   *
   * @return string
   *   The body text.
   */
  public function getFeeListBodyText(): string {
    $text = $this->loadConfig()->get('fee_list_body_text');
    return !empty($text) ? $text : $this->t('Fees and replacement costs are handled through the new system "Mit betalingsoverblik"', [], ['context' => 'Fees list settings form']);
  }

  /**
   * Get the desktop list size.
   *
   * @return string
   *   The desktop list size or the fallback value.
   */
  public function getListSizeDesktop(): string {
    return $this->loadConfig()->get('fees_list_size_desktop') ?? self::FEES_LIST_SIZE_DESKTOP;
  }

  /**
   * Get the mobile list size.
   *
   * @return string
   *   The mobile list size or the fallback value.
   */
  public function getListSizeMobile(): string {
    return $this->loadConfig()->get('fees_list_size_mobile') ?? self::FEES_LIST_SIZE_MOBILE;
  }

  /**
   * Get the fees and replacement cost url.
   *
   * @return string
   *   The fees and replacement cost url or the fallback value.
   */
  public function getFeesAndReplacementCostsUrl(): string {
    return dpl_react_apps_format_app_url($this->loadConfig()->get('fees_and_replacement_costs_url'), self::FEES_AND_REPLACEMENT_COSTS_URL);
  }

  /**
   * Get the payment overview url.
   *
   * @return string
   *   The payment overview url or empty, because it is allowed to be empty.
   */
  public function getPaymentSiteUrl(): string {
    // We deliberately do NOT use url formatting here
    // because we want it to be able to be empty.
    return $this->loadConfig()->get('payment_site_url') ?? self::PAYMENT_SITE_URL;
  }

  /**
   * Get the payment site button label.
   *
   * @return string
   *   The payment site button label or the fallback value.
   */
  protected function getFeeListPaymentSiteButtonLabel(): string {
    $label = $this->loadConfig()->get('payment_site_button_label');
    return !empty($label) ? $label : $this->t('Go to payment page', [], ['context' => 'Fees list settings form']);
  }

  /**
   * Get the mobile list size.
   *
   * @return mixed[]
   *   The mobile list size or the fallback value.
   */
  public function getFeeListConfig(): mixed {
    return [
      "pageSizeDesktop" => $this->getListSizeDesktop(),
      "pageSizeMobile" => $this->getListSizeMobile(),
      "paymentSiteButtonLabel" => $this->getFeeListPaymentSiteButtonLabel(),
    ];
  }

  /**
   * Get urls for blocked patrons.
   *
   * @param string|null $name
   *   The name of the url to get.
   *
   * @return string|mixed[]|null
   *   String if one url is asked for or null if not found.
   *   If no name is provided then all available urls.
   */
  protected function getBlockedPatronUrls($name = NULL): string|array|null {
    $urls = [
      'blocked-patron-e-link' => $this->loadConfig()->get('blocked_patron_e_link_url') ?? self::BLOCKED_PATRON_E_LINK_URL,
    ];

    if ($name) {
      return $urls[$name] ?? NULL;
    }

    return $urls;
  }

  /**
   * Get url for the blocked patron of type E.
   *
   * @return string
   *   The url.
   */
  public function getBlockedPatronElinkUrl(): string {
    $url = $this->getBlockedPatronUrls('blocked-patron-e-link');
    return is_string($url) ? $url : '';
  }

}
