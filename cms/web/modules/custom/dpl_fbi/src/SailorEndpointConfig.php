<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi;

use Drupal\dpl_library_token\LibraryTokenHandler;
use Spawnia\Sailor\Client;
use Spawnia\Sailor\Client\Guzzle;
use Spawnia\Sailor\Codegen\DirectoryFinder;
use Spawnia\Sailor\Codegen\Finder;
use Spawnia\Sailor\EndpointConfig;

/**
 * Configuration class for Sailor.
 */
class SailorEndpointConfig extends EndpointConfig {

  public function __construct(
    protected Fbi $fbi,
    protected LibraryTokenHandler $tokenHandler,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function makeClient(): Client {

    return new Guzzle(
      $this->fbi->getServiceUrl('local'),
      [
        'headers' => [
          'Authorization' => 'Bearer ' . $this->tokenHandler->getToken()?->token,
        ],
        // Low timeout, we don't want to hang on FBI being down.
        'timeout' => 1,
      ]
    );
  }

  /**
   * {@inheritdoc}
   */
  public function namespace(): string {
    return 'Drupal\\dpl_fbi\\GraphQL';
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
    return __DIR__ . '/../schema/fbi.graphql';
  }

  /**
   * {@inheritdoc}
   */
  public function finder(): Finder {
    return new DirectoryFinder(__DIR__ . '/../queries');
  }

}
