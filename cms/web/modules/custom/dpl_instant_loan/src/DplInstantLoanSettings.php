<?php

namespace Drupal\dpl_instant_loan;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles instant loan settings.
 */
class DplInstantLoanSettings extends DplReactConfigBase {

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    // Class to match configuration type
    // https://github.com/reload/dpl-react/blob/66d01476f9d272b7fea4e83f575550cce4b93bbd/src/core/utils/types/instant-loan.ts
    $reactConfig = new class {

      /**
       * @param bool $enabled
       *   Whether instant loan functionality is enabled or not.
       * @param string|null $threshold
       *   The number of items that must be available before instant loans are
       *   shown.
       * @param string[]|null $matchStrings
       *   Strings to match against material group texts to identify items
       *   available for instant loan.
       */
      public function __construct(
        public bool $enabled = FALSE,
        public ?string $threshold = NULL,
        public ?array $matchStrings = NULL,
      ) {}

    };

    $drupalConfig = $this->loadConfig();
    $reactConfig = new $reactConfig();

    $reactConfig->enabled = (bool) $drupalConfig->get('enabled');
    if ($reactConfig->enabled) {
      $reactConfig->threshold = (string) $drupalConfig->get('threshold');
      $reactConfig->matchStrings = (array) $drupalConfig->get('match_strings');
    }

    return (array) $reactConfig;
  }

  /**
   * Gets the configuration key for the instant loan settings.
   */
  public function getConfigKey(): string {
    return 'dpl_instant_loan.settings';
  }

}
