<?php

declare(strict_types=1);

namespace Drupal\media_videotool\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Theme hooks for media_videotool module.
 */
class ThemeHooks {

  /**
   * Implements hook_theme().
   *
   * @return array<string, mixed>
   *   The theme hooks the module defines.
   */
  #[Hook('theme')]
  public function theme(): array {
    return [
      'media_videotool_iframe' => [
        'variables' => ['attributes' => []],
      ],
    ];
  }

}
