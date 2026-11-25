<?php

declare(strict_types=1);

namespace Drupal\dpl_footer\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\State\StateInterface;
use Drupal\Core\Theme\ThemeManagerInterface;

/**
 * Theme hooks for dpl_footer module.
 */
class ThemeHooks {

  public function __construct(
    protected ThemeManagerInterface $themeManager,
    protected StateInterface $state,
  ) {}

  /**
   * Add the footer settings to the page in the novel theme.
   *
   * @param array<mixed> $variables
   *   The page variables.
   */
  #[Hook('preprocess_page')]
  public function addFooterSettings(array &$variables): void {
    // We could put this in the novel.theme file, but that would
    // result in a dependency between this module.
    if ('novel' != $this->themeManager->getActiveTheme()->getName()) {
      return;
    }

    // Setting a cache tag so we can clear caches when the footer is updated.
    $variables['#cache']['tags'][] = 'dpl_footer';

    $variables['footer_settings'] = $this->state->get('dpl_footer_values');
  }

}
