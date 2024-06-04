<?php

namespace Drupal\dpl_patron_page;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles reservations settings.
 */
class DplPatronPageSettings extends DplReactConfigBase {
  const DELETE_PATRON_URL = '';
  const ALWAYS_AVAILABLE_EREOLEN = '';
  const PINCODE_LENGTH_MAX = 4;
  const PINCODE_LENGTH_MIN = 4;

  /**
   * Gets the configuration key for reservation settings.
   */
  public function getConfigKey(): string {
    return 'dpl_patron_page.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

}
