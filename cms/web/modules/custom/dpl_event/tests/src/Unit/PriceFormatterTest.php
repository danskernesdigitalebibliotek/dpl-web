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
  public function testPriceFormatting(
    string $price_string,
    string $formatted_price,
  ): void {
    $priceFormatter = new PriceFormatter($this->getStringTranslationStub());
    $this->assertSame(
          $formatted_price,
          $priceFormatter->formatPrice($price_string)
      );
  }

  /**
   * Provides examples of raw price strings and their expected formatting.
   *
   * @return array<array{string, string}>
   *   Array of examples. Each example contains a raw price string and how it
   *   should be formatted. This matches signature of testRawPriceFormatting().
   */
  public function rawPriceProvider(): array {
    return [
          // Whole number.
          ["20", "20"],
          // Number with fractional part.
          ["20.50", "20,50"],
          // Number with zero fractional part.
          ["20.00", "20"],
          // Number with non-zero fractional part.
          ["20.99", "20,99"],
          // Larger whole number.
          ["1000", "1000"],
          // Small fractional number.
    ];
  }

  /**
   * Test raw price formatting.
   *
   * @dataProvider rawPriceProvider
   */
  public function testRawPriceFormatting(
    string $raw_price,
    string $expected,
  ): void {
    $priceFormatter = new PriceFormatter($this->getStringTranslationStub());
    $this->assertSame(
          $expected,
          $priceFormatter->formatRawPrice($raw_price)
      );
  }

  /**
   * Provides examples of price arrays and their expected range formatting.
   *
   * @return array<array{array<int>, string}>
   *   Array of examples. Each example contains an array of prices and how
   *   they should be formatted. This matches signature of
   *   testPriceRangeFormatting().
   */
  public function priceRangeProvider(): array {
    return [
          // Only free prices.
          [[0], "Free"],
          // Free and a single price.
          [[0, 20], "Free - 20 kr."],
          // Range of prices.
          [[20, 30], "20 - 30 kr."],
          // Single price.
          [[20], "20 kr."],
          // Multiple prices.
          [[10, 20, 30], "10 - 30 kr."],
          // Free with multiple prices.
          [[0, 10, 20], "Free - 20 kr."],
          // Larger range of prices.
          [[50, 100, 150], "50 - 150 kr."],
          [[0, 1000], "Free - 1000 kr."],
    ];
  }

  /**
   * Test price range formatting.
   *
   * @param int[] $prices
   *   Array of integers representing prices.
   * @param string $expected
   *   Expected formatted string.
   *
   * @dataProvider priceRangeProvider
   */
  public function testPriceRangeFormatting(
    array $prices,
    string $expected,
  ): void {
    $priceFormatter = new PriceFormatter($this->getStringTranslationStub());
    $this->assertSame(
      $expected,
      $priceFormatter->formatPriceRange($prices)
    );
  }

}
