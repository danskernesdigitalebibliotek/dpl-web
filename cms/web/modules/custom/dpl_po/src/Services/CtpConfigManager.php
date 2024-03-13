<?php

namespace Drupal\dpl_po\Services;

use Drupal\config_translation_po\Services\CtpConfigManager as OrgCtpConfigManager;

/**
 * Extended CtpConfigManager in order to handle untranslated strings properly.
 *
 * The class has been created to override the behavior of the original class.
 * The original class sets untranslated strings to the original value,
 * which is not correct.
 * Untranslated strings should be set to an empty string to make it possible
 * for external tools to know that this string has not been translated yet.
 *
 * We could also have solved this by creating a patch for the original class.
 * It is worthwhile to raise this issue with the original module maintainers
 * and keep an eye of the issue queue.
 *
 * Apparently this is where things went wrong:
 * https://git.drupalcode.org/project/config_translation_po/-/commit/f9f952730e548418586a6e543da82acaf5042a08
 */
class CtpConfigManager extends OrgCtpConfigManager {

  /**
   * {@inheritdoc}
   */
  protected function processTranslatableData($name, array $active, array $translatable, $langcode) {
    $translated = [];
    foreach ($translatable as $key => $item) {
      if (!isset($active[$key])) {
        continue;
      }
      if (is_array($item)) {
        // Only add this key if there was a translated value underneath.
        $value = $this->processTranslatableData($name, $active[$key], $item, $langcode);
        if (!empty($value)) {
          $translated[$key] = $value;
        }
      }
      else {
        if (locale_is_translatable($langcode)) {
          $value = $this->translateString($name, $langcode, $item->getUntranslatedString(), $item->getOption('context'));
        }
        // If there is no translation, set value to NULL
        // so we can handle it properly in the next step.
        $translated[$key] = !empty($value) ? $value : NULL;
      }
    }
    return $translated;
  }

  /**
   * {@inheritdoc}
   */
  protected function preparePoItem($source, ?string $data, array $comment) {
    // If the data is NULL, set it to an empty string.
    // to make it possible for external tools
    // to know that this string is translatable.
    if (is_null($data)) {
      $data = '';
    }
    parent::preparePoItem($source, $data, $comment);
  }

}
