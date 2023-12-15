<?php

namespace Drupal\dpl_event;

use Brick\Math\BigDecimal;
use Drupal\Core\StringTranslation\TranslationInterface;

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

}
