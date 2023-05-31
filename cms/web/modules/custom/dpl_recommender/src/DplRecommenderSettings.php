<?php

namespace Drupal\dpl_recommender;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles recommender settings.
 */
class DplRecommenderSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for recommender settings.
   */
  public function getConfigKey(): string {
    return 'dpl_recommender.settings';
  }

}
