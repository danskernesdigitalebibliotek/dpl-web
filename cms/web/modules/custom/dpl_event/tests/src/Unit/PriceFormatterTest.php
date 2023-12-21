<?php

namespace dpl_event\tests\src\Unit;

use Drupal\dpl_event\PriceFormatter;
use Drupal\Tests\UnitTestCase;

/**
 * Test case for price formatting.
 */
class PriceFormatterTest extends UnitTestCase {

  /**
   * Provides examples of price strings and how they should be formatted.
   *
   * @return array<array{string, string}>
   *   Array of examples. Each example contains a price string and how it
   *   should be formatted. This matches signature of testPriceFormatting().
   */
  public function priceProvider(): array {
    return [
      ["0", "Free"],
      ["0.0", "Free"],
      ["0.00", "Free"],
      ["10.0", "10 kr."],
      ["10.00", "10 kr."],
      ["10.01", "10,01 kr."],
      ["10.1", "10,10 kr."],
      ["10.100", "10,10 kr."],
      // We are currently rounding any fractional digits beyond 2.
      ["10.101", "10,10 kr."],
      ["10.109", "10,11 kr."],
    ];
  }

  /**
   * Test all examples of price strings.
   *
   * @dataProvider priceProvider
   */
  public function testPriceFormatting(string $price_string, string $formatted_price): void {
    $priceFormatter = new PriceFormatter($this->getStringTranslationStub());
    $this->assertSame($formatted_price, $priceFormatter->formatPrice($price_string));
  }

}
