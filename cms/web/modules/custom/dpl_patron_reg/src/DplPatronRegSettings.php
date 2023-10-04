<?php

namespace Drupal\dpl_patron_reg;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles patron registration settings.
 */
class DplPatronRegSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for the instant patron registration settings.
   */
  public function getConfigKey(): string {
    return 'dpl_patron_reg.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

}
