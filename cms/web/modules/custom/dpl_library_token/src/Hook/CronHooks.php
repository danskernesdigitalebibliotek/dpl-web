<?php

declare(strict_types=1);

namespace Drupal\dpl_library_token\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_library_token\LibraryTokenHandler;

/**
 * Cron hooks.
 */
class CronHooks {

  public function __construct(
    protected LibraryTokenHandler $libraryTokenHandler,
  ) {
  }

  /**
   * Fetch a fresh library token and store it.
   */
  #[Hook('cron')]
  public function refreshLibraryToken(): void {
    $this->libraryTokenHandler->retrieveAndStoreToken();
  }

}
