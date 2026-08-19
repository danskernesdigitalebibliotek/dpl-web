<?php

declare(strict_types=1);

namespace Drupal\dpl_webmaster\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Hooks for the asset injector.
 */
class AssetInjectorHooks {

  /**
   * Prefix of all configuration provided by the asset_injector module.
   */
  protected const CONFIG_PREFIX = 'asset_injector.';

  /**
   * Make asset injector configuration untranslatable.
   *
   * Asset injector entities contain CSS/JS written by webmasters, but their
   * schema describes the code as `text` and the name as `label`, types which
   * Drupal considers translatable. So the code was registered as translatable
   * configuration, and the nightly translation import created Danish
   * "translations" of the assets. Danish being the default language of the
   * sites, the frontend then used the translated copy, which was never updated
   * when the webmaster edited the asset.
   *
   * Marking every element of the entities untranslatable keeps them out of the
   * translation system entirely: locale doesn't register the code as a
   * translatable string, config_translation denies access to translating the
   * entities as their mapper has nothing translatable, and the PO export
   * skips them.
   *
   * @param array<string, array<mixed, mixed>> $definitions
   *   Configuration schema definitions, keyed by schema type name.
   */
  #[Hook('config_schema_info_alter')]
  public function configSchemaInfoAlter(array &$definitions): void {
    // Only existing definitions are altered. Adding or removing definitions
    // here throws a ConfigSchemaAlterException.
    foreach ($definitions as $name => &$definition) {
      if (str_starts_with($name, self::CONFIG_PREFIX)) {
        $this->makeUntranslatable($definition);
      }
    }
  }

  /**
   * Recursively marks a configuration schema definition as untranslatable.
   *
   * @param array<mixed, mixed> $definition
   *   The definition to alter in place.
   */
  protected function makeUntranslatable(array &$definition): void {
    // The definition of an element takes precedence over the definition of the
    // type it uses, so this overrides `translatable: true` on the types the
    // elements are based on - `label` and `text` in this case.
    // @see \Drupal\Core\Config\TypedConfigManager::buildDataDefinition()
    $definition['translatable'] = FALSE;

    // Mappings and sequences are never translatable themselves, only the
    // elements they contain are, so descend into them.
    if (isset($definition['mapping']) && is_array($definition['mapping'])) {
      foreach ($definition['mapping'] as &$element) {
        if (is_array($element)) {
          $this->makeUntranslatable($element);
        }
      }
    }

    if (isset($definition['sequence']) && is_array($definition['sequence'])) {
      $this->makeUntranslatable($definition['sequence']);
    }
  }

}
