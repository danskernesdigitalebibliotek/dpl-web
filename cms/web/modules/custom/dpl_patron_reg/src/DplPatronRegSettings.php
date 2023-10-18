<?php

namespace Drupal\dpl_patron_reg;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles patron registration settings.
 */
class DplPatronRegSettings extends DplReactConfigBase {

  const AGE_LIMIT = '18';
  const REDIRECT_ON_USER_CREATED_URL = '';
  const INFORMATION_VALUE = '';
  const INFORMATION_FORMAT = 'plain_text';

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
