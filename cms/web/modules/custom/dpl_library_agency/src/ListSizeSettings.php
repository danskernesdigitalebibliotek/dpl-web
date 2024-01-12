<?php

namespace Drupal\dpl_library_agency;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles list size settings.
 */
class ListSizeSettings extends DplReactConfigBase {

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->loadConfig()->get();
  }

  /**
   * Gets the configuration key for list size settings.
   */
  public function getConfigKey(): string {
    return 'dpl_library_agency.list_size_settings';
  }

}
