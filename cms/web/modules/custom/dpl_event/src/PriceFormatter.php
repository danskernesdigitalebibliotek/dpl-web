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
    return match(TRUE) {
      // Events with 0 cost should show "Free" instead of a numeric price.
      $price->isEqualTo(0) => $this->translation->translate("Free", [], $translation_options),
      // Add the kr. suffix for now.
      // For multi-currency support this should be replaced by a configurable
      // suffix and appropriate separators.
      // Strip fractions from prices which do not use them.
      !$price->hasNonZeroFractionalPart() => $this->translation->translate("@price kr.", ['@price' => $price->getIntegralPart()]),
      // Prices with fractions must be output with exactly two digits in the
      // fraction to match standard formatting of prices.
      default => $this->translation->translate("@price kr.", ['@price' => number_format($price->toFloat(), 2, ',', '.')])
    };
  }

}
