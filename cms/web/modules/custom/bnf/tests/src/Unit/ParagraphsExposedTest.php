<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit;

use Drupal\Tests\UnitTestCase;
use Symfony\Component\Yaml\Yaml;

/**
 * Test that all paragraphs are exposed in GraphQL compose module.
 *
 * The module throws a fatal error if it runs into a non-exposed paragraph type
 * regardless of whether it was queried or not.
 */
class ParagraphsExposedTest extends UnitTestCase {

  /**
   * Test that all paragraph types is exposed in config.
   *
   * GraphQL compose throw a hard error when it encounters an unexposed
   * paragraph type on a node. This results in an unhelpful JSON parsing error
   * on the receiving side, so we try to catch the problem earlier.
   */
  public function testAllParagraphsEnabled(): void {
    $config = Yaml::parseFile(DRUPAL_ROOT . '/../config/sync/graphql_compose.settings.yml');

    $this->assertArrayHasKey(
      'entity_config',
      $config,
      'Could not find `entity_config` in graphql_compose config file'
    );

    $this->assertArrayHasKey(
      'paragraph',
      $config['entity_config'],
      'Could not find `paragraph` entry within `entity_config` in graphql_compose config file'
    );

    foreach ($config['entity_config']['paragraph'] as $name => $paragraph) {
      $this->assertTrue($paragraph['enabled'], $name . ' paragraph is not enabled in graphql_compose settings');
    }
  }

}
