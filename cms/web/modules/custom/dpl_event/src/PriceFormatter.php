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
    $translation_options = ['context' => 'dpl_event'];

    $price = BigDecimal::of($price_string);
    if ($price->isEqualTo(0)) {
      // Events with 0 cost should show "Free" instead of a numeric price.
      $price_string = $this->translation->translate("Free", [], $translation_options);
    }
    else {
      // Add the kr. suffix for now.
      // For multi-currency support this should be replaced by a configurable
      // suffix and appropriate separators.
      if (!$price->hasNonZeroFractionalPart()) {
        // Strip fractions from prices which do not use them.
        $price_string = $this->translation->translate("@price kr.", ['@price' => $price->getIntegralPart()]);
      }
      else {
        // Prices with fractions must be output with exactly two digits in the
        // fraction to match standard formatting of prices.
        $price_string = $this->translation->translate("@price kr.", ['@price' => number_format($price->toFloat(), 2, ',', '.')]);
      }
    }
    return $price_string;
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

    // Check if all prices are zero (free) or the array is empty.
    if (empty($prices) || max($prices) == 0) {
      return $this->translation->translate("Free");
    }

    $has_free_price = in_array(0, $prices);
    // Remove free prices (0 values) for further processing.
    $filtered_prices = array_filter($prices, fn($price) => $price > 0);

    // Format the price range.
    $price_range = array_map(fn($price) => $this->formatRawPrice((string) $price), $filtered_prices);
    $formatted_price_range = implode(' - ', $price_range);

    // Prepend "Free" if there are free prices and other prices.
    if ($has_free_price && !empty($filtered_prices)) {
      $formatted_price_range = $this->translation->translate("Free") . ' - ' . $formatted_price_range;
    }

    return $formatted_price_range . ' kr.';
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
  protected function formatRawPrice(string $price_string): string {
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
