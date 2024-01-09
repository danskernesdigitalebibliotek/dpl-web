<?php

namespace Drupal\dpl_event;

use Brick\Math\BigDecimal;
use Drupal\Core\StringTranslation\TranslationInterface;
use function Safe\sort;

/**
 * Formats prices according to local rules.
 *
 * This is important as we do not rely on fields built for prices. Instead we
 * have double fields with values as strings.
 */
class PriceFormatter {

  /**
   * Constructor.
   */
  public function __construct(
    protected TranslationInterface $translation,
  ) {}

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

      // Add the 'kr.' suffix for now.
      // For multi-currency support this should be replaced by a configurable
      // suffix and appropriate separators.
      return $formatted_price . ' kr.';
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
    $highest_price = max($filtered_prices);

    // Format the highest price.
    $formatted_highest_price = $this->formatRawPrice((string) $highest_price);

    // Construct the price range string.
    if ($has_free_price) {
      // Only display "Free" and the highest price.
      return $this->translation->translate("Free") . ' - ' . $formatted_highest_price . ' kr.';
    }
    else {
      // If no free price, display the range from the lowest to highest price.
      $lowest_price = min($filtered_prices);
      $formatted_lowest_price = $this->formatRawPrice((string) $lowest_price);
      return $formatted_lowest_price . ($lowest_price != $highest_price ? ' - ' . $formatted_highest_price : '') . ' kr.';
    }
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
