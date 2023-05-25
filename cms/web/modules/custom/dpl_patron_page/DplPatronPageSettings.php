<?php

namespace Drupal\dpl_patron_page;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles reservations settings.
 */
class DplPatronPageSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for reservation settings.
   */
  public function getConfigKey(): string {
    return 'patron_page.settings';
  }

}
