<?php

namespace Drupal\dpl_event;

use Brick\Math\BigDecimal;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_event\Form\SettingsForm;

/**
 * Formats prices according to local rules.
 *
 * This is important as we do not rely on fields built for prices. Instead we
 * have double fields with values as strings.
 */
class PriceFormatter {

  /**
   * The currency that prices should be shown in (ISO 4217 code).
   */
  public string $currency = 'DKK';

  /**
   * A possible prefix, shown in currency labels. E.g. "€ ".
   */
  public ?string $currencyPrefix = NULL;

  /**
   * A possible suffix, shown in currency labels. E.g. " DKK".
   */
  public ?string $currencySuffix = NULL;

  /**
   * {@inheritDoc}
   */
  public function __construct(
    protected TranslationInterface $translation,
    protected ConfigFactoryInterface $configFactory,
  ) {
    $config = $this->configFactory->get(SettingsForm::CONFIG_NAME);

    $currency = $config->get('price_currency') ?? $this->currency;
    $this->currency = $currency;

    switch ($currency) {
      case 'DKK':
        $this->currencySuffix = $this->translation->translate(' DKK', [], ['context' => "DPL event"])->render();
        break;

      case 'EUR':
        $this->currencyPrefix = '€ ';
        break;
    }
  }

  /**
   * Format a single price.
   */
  public function formatPrice(string $price_string): string {
    $price = BigDecimal::of($price_string);

    if ($price->isEqualTo(0)) {
      // Events with 0 cost should show "Free" instead of a numeric price.
      return $this->translation->translate("Free");
    }
    else {
      // Format the numeric part of the price using formatRawPrice.
      $formatted_price = $this->formatRawPrice($price_string);

      return "{$this->currencyPrefix}$formatted_price{$this->currencySuffix}";
    }
  }

  /**
   * Formats a range of numeric prices into a string.
   *
   * Sorts and formats prices, prepending "Free" if applicable.
   * Outputs formats like "Free - 20 kr.", "20 - 50 kr.", or just "Free".
   *
   * @param float[]|int[] $prices
   *   Array of price values (numbers).
   *
   * @return string
   *   Formatted price range string.
   */
  public function formatPriceRange(array $prices): string {
    sort($prices);

    // Check if the array is empty or all prices are zero (free).
    if (empty($prices) || max($prices) == 0) {
      return $this->translation->translate("Free");
    }

    $has_free_price = in_array(0, $prices);
    // Remove free prices (0 values) for further processing.
    $filtered_prices = array_filter($prices, fn($price) => $price > 0);

    // Determine the highest price in the range.
    $highest_price_raw = max($filtered_prices);

    // Construct the price range string.
    if ($has_free_price) {
      // Get the price, with prefix and suffix, as we only use this one.
      $highest_price_formatted = $this->formatPrice((string) $highest_price_raw);

      // Only display "Free" and the highest price.
      return $this->translation->translate("Free") . " - $highest_price_formatted";
    }

    $lowest_price_raw = min($filtered_prices);

    if ($lowest_price_raw != $highest_price_raw) {
      // If no free price, display the range from the lowest to highest price.
      // We get the prices without prefix and suffix, as we only want one
      // prefix in the beginning of the whole string, and one suffix in the end
      // of the string.
      $lowest_price = $this->formatRawPrice((string) $lowest_price_raw);
      $highest_price = $this->formatRawPrice((string) $highest_price_raw);

      return "{$this->currencyPrefix}$lowest_price - $highest_price{$this->currencySuffix}";
    }

    // Get the price, with prefix and suffix, as we only use this one.
    return $this->formatPrice((string) $lowest_price_raw);
  }

  /**
   * Helper function to format a raw price number.
   *
   * If the price has a fractional part, it will format to two decimal places,
   * if not, it is converted to an integer.
   *
   * @param string $price_string
   *   Raw price string.
   *
   * @return string
   *   Formatted price number without currency suffix.
   */
  public function formatRawPrice(string $price_string): string {
    $price = BigDecimal::of($price_string);

    if ($price->hasNonZeroFractionalPart()) {
      // Format the price with two decimal places.
      return number_format($price->toFloat(), 2, ',', '.');
    }
    else {
      // Convert the price to an integer string.
      return (string) $price->toInt();
    }
  }

}
