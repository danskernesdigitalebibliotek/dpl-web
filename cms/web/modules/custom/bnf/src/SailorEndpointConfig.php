<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Spawnia\Sailor\Client;
use Spawnia\Sailor\Client\Guzzle;
use Spawnia\Sailor\Codegen\DirectoryFinder;
use Spawnia\Sailor\Codegen\Finder;
use Spawnia\Sailor\EndpointConfig;

/**
 * Configuration class for Sailor.
 *
 * This is both used by Drupal and the vendor/bin/sailor command, so it should
 * work both cases.
 */
class SailorEndpointConfig extends EndpointConfig {

  public function __construct(
    protected string $uri,

  ) {

  }

  /**
   * {@inheritdoc}
   */
  public function makeClient(): Client {
    // Injecting an adapter to Drupals HTTP client would be nice, but the
    // advantage over just using Sailors own Guzzle adapter is questionable.
    return new Guzzle(
      $this->uri,
      [
        'headers' => [
          'Authorization' => 'Basic ' . base64_encode('bnf_graphql:' . getenv('BNF_GRAPHQL_CONSUMER_USER_PASSWORD')),
        ],
      ]
    );
  }

  /**
   * {@inheritdoc}
   */
  public function namespace(): string {
    return 'Drupal\\bnf\\GraphQL';
  }

  /**
   * {@inheritdoc}
   */
  public function targetPath(): string {
    return __DIR__ . '/GraphQL';
  }

  /**
   * {@inheritdoc}
   */
  public function schemaPath(): string {
    return __DIR__ . '/../schema/bnf.graphql';
  }

  /**
   * {@inheritdoc}
   */
  public function finder(): Finder {
    return new DirectoryFinder(__DIR__ . '/../queries');
  }

}
