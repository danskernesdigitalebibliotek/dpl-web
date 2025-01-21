<?php

// phpcs:ignoreFile

declare(strict_types=1);

use Spawnia\Sailor;

return [
  'bnf' => new class() extends Sailor\EndpointConfig {
    public function makeClient(): Sailor\Client
    {
      // Injecting an adapter to Drupals HTTP client would be nice, but this
      // is both used in in the generated client that runs in Drupal, and in
      // the sailor CLI command that doesn't. Swapping clients depending on
      // whether Drupal is available is an option, but we run with just using
      // Guzzle directly for the moment being.
      return new Sailor\Client\Guzzle(
        'http://nginx:8080/graphql',
        [
          'headers' => [
            'Authorization' => 'Basic ' . base64_encode('bnf_graphql:' . getenv('BNF_GRAPHQL_CONSUMER_USER_PASSWORD')),
          ],
        ]
      );
    }

    public function namespace(): string
    {
      return 'Drupal\\bnf\\GraphQL';
    }

    public function targetPath(): string
    {
      return __DIR__ . '/web/modules/custom/bnf/src/GraphQL';
    }

    public function schemaPath(): string
    {
      return __DIR__ . '/web/modules/custom/bnf/schema/bnf.graphql';
    }

    public function finder(): Sailor\Codegen\Finder
    {
      return new Sailor\Codegen\DirectoryFinder(__DIR__ . '/web/modules/custom/bnf/queries');
    }
  },
];
