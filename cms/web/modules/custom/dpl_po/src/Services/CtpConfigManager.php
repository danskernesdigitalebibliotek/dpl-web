<?php

namespace Drupal\dpl_po\Services;

use Drupal\Component\Gettext\PoItem;
use Drupal\config_translation_po\Services\CtpConfigManager as OrgCtpConfigManager;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Extended CtpConfigManager in order to handle untranslated strings properly.
 *
 * @package Drupal\config_translation_po\Services
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
        if (!empty($value) || is_null($value)) {
          $translated[$key] = $value;
        }
      }
      else {
        if (locale_is_translatable($langcode)) {
          $value = $this->translateString($name, $langcode, $item->getUntranslatedString(), $item->getOption('context'));
        }
        if (empty($value)) {
          // If there is no translation, set value to NULL
          // so we can handle it properly in the next step.
          $value = NULL;
        }
        if (!empty($value) || !is_null($value)) {
          $translated[$key] = $value;
        }
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

    if ($source instanceof TranslatableMarkup) {
      $source = $source->getUntranslatedString();
    }
    $excludes = $this->getExludes();
    if (empty($source) || in_array($source, $excludes)) {
      return;
    }
    $context = implode(':', $comment);
    $po_item = new PoItem();
    $po_item->setLangcode($this->langcode);
    $po_item->setContext($context);
    $po_item->setSource($source);
    $po_item->setTranslation($this->langcode !== 'system' ? $data : '');
    $this->translatableElements[$context] = $po_item;
  }

}
