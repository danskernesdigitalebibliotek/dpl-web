<?php

declare(strict_types=1);

namespace Drupal\dpl_react\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use function Safe\json_encode;

/**
 * Theme hooks for dpl_react module.
 */
class ThemeHooks {

  /**
   * Define the dpl_react_app theme hook for embedding React apps.
   *
   * @return array<string, mixed>
   *   The theme hooks the module defines.
   */
  #[Hook('theme')]
  public function theme(): array {
    return [
      'dpl_react_app' => [
        'variables' => [
          'name' => NULL,
          'data' => [],
          'attributes' => NULL,
        ],
      ],
    ];
  }

  /**
   * Turn React app data into data attributes and attach the app library.
   *
   * @param mixed[] $variables
   *   The variables for the theme hook.
   */
  #[Hook('preprocess_dpl_react_app')]
  public function prepareReactApp(array &$variables): void {
    $attributes = [];
    $attributes['data-dpl-app'] = $variables['name'];

    foreach ($variables['data'] as $prop => $value) {
      if (is_array($value)) {
        $value = json_encode($value);
      }
      $attributes['data-' . $prop] = $value;
    }

    $variables['attributes'] = array_merge(
      $variables['attributes'] ?? [],
      $attributes
    );

    $variables['#attached']['library'][] = sprintf('dpl_react/%s', $variables['name']);

    $variables['#cache']['tags'][] = 'dpl_react_app';
    $variables['#cache']['tags'][] = 'dpl_react_app:' . $variables['name'];

    // When changes to the interface language occurs then skip cache.
    $variables['#cache']['tags'][] = 'locale';
  }

  /**
   * Add a template suggestion per React app.
   *
   * @param mixed[] $variables
   *   The variables for the theme hook.
   *
   * @return string[]
   *   An array of suggestions.
   */
  #[Hook('theme_suggestions_dpl_react_app')]
  public function addAppSuggestion(array $variables): array {
    return ['dpl_react_app__' . str_replace('-', '_', $variables['name'])];
  }

}
