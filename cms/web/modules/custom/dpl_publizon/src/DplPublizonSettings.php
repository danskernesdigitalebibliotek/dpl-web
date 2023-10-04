<?php

namespace Drupal\dpl_publizon;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles FBS settings.
 */
class DplPublizonSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for FBS settings.
   */
  public function getConfigKey(): string {
    return 'dpl_publizon.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

}
