<?php

namespace Drupal\Tests\dpl_search\Unit;

use Drupal\dpl_search\FacetPhrase;
use Drupal\Tests\UnitTestCase;

/**
 * Test case for extracting the web search teaser phrase from facet links.
 *
 * The JSON format under test is the wire contract with dpl-react: links
 * from material pages are produced by constructSearchUrlWithFacets as
 * [{"facetName": "creators", "selectedValues": ["..."]}, ...]. If that
 * format changes, this test and the extraction must change with it.
 */
class FacetPhraseTest extends UnitTestCase {

  /**
   * Provides facets JSON strings and the phrase they should yield.
   *
   * @return array<string, array{string, string|null}>
   *   Array of examples, keyed by description. Each example contains a
   *   facets JSON string and the expected phrase (or NULL for none).
   */
  public function facetsProvider(): array {
    return [
      'a creator link from a material page' => [
        '[{"facetName":"creators","selectedValues":["h.c. andersen"]}]',
        'h.c. andersen',
      ],
      'a subject link from a material page' => [
        '[{"facetName":"subjects","selectedValues":["skovbadning"]}]',
        'skovbadning',
      ],
      'a dk5 link from a material page' => [
        '[{"facetName":"dk5","selectedValues":["99.4"]}]',
        '99.4',
      ],
      'the first phrase facet wins when other facets come first' => [
        '[{"facetName":"materialTypesGeneral","selectedValues":["bog"]},{"facetName":"subjects","selectedValues":["krimi"]}]',
        'krimi',
      ],
      'only the first value of a facet is used' => [
        '[{"facetName":"subjects","selectedValues":["krimi","spænding"]}]',
        'krimi',
      ],
      'facets without a usable phrase' => [
        '[{"facetName":"materialTypesGeneral","selectedValues":["bog"]}]',
        NULL,
      ],
      'an empty facet list' => [
        '[]',
        NULL,
      ],
      'an empty string' => [
        '',
        NULL,
      ],
      'malformed JSON' => [
        '[{"facetName":',
        NULL,
      ],
      'JSON that is not a list' => [
        '"skovbadning"',
        NULL,
      ],
      'a facet that is not an object' => [
        '["skovbadning"]',
        NULL,
      ],
      'a facet without values' => [
        '[{"facetName":"subjects","selectedValues":[]}]',
        NULL,
      ],
      'values that are not a list' => [
        '[{"facetName":"subjects","selectedValues":"skovbadning"}]',
        NULL,
      ],
      'an empty value' => [
        '[{"facetName":"subjects","selectedValues":[""]}]',
        NULL,
      ],
    ];
  }

  /**
   * Test that the teaser phrase is extracted from the facets parameter.
   *
   * @dataProvider facetsProvider
   */
  public function testPhraseExtraction(string $facets_json, ?string $expected): void {
    $this->assertSame($expected, FacetPhrase::fromJson($facets_json));
  }

}
