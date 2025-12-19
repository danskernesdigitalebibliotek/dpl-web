<?php

namespace Drupal\dpl_update\Services;

use Drupal\Core\Config\CachedStorage;
use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\FileStorage;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use function Safe\preg_match;

/**
 * Maintainer service for keeping ignored config in check.
 */
class ConfigIgnore {

  /**
   * The settings for config_ignore_auto.
   */
  public Config $configAutoIgnoreSettings;

  /**
   * The settings for config_ignore.
   */
  public Config $configIgnoreSettings;

  /**
   * Items that are ignored as part of config_ignore_auto.
   *
   * @var array<string>
   */
  public array $autoIgnoredItems;

  /**
   * {@inheritDoc}
   */
  public function __construct(
    protected ConfigFactoryInterface $configFactory,
    // configSyncStorage looks up what exists as .yml files in the filesystem.
    #[Autowire(service: 'config.storage.sync')]
    protected FileStorage $configSyncStorage,
    // configStorage looks up what exists as loaded config within the database.
    #[Autowire(service: 'config.storage')]
    protected CachedStorage $configStorage,
    #[Autowire(service: 'logger.channel.dpl_update')]
    protected LoggerInterface $logger,
  ) {
    $this->configAutoIgnoreSettings = $this->configFactory
      ->getEditable('config_ignore_auto.settings');

    $this->configIgnoreSettings = $this->configFactory
      ->getEditable('config_ignore.settings');

    $this->autoIgnoredItems = (array) $this->configAutoIgnoreSettings
      ->get('ignored_config_entities');
  }

  /**
   * Get the ignored items in config_ignore_auto that is not white-listed.
   *
   * We have a white-list of item patterns in config_ignore, for config
   * that we expect any site (webmaster or not) to be able to override.
   * Things such as dpl_* settings.
   *
   * This method looks through the ignored items, set by config_ignore_auto
   * and finds any items that are NOT matching the allow-list patterns.
   *
   * @return array<string>
   *   The ignored items.
   */
  public function getWebmasterIgnores(): array {
    // Getting the whitelists from config_ignore and config_ignore_auto.
    $whitelist = $this->configIgnoreSettings->get('ignored_config_entities');
    // Depending on which mode we're using, config_ignore might store the
    // whitelist in an .import instead.
    $whitelist_import = $whitelist['import'] ?? NULL;
    $whitelist = (is_array($whitelist_import)) ? $whitelist['import'] : $whitelist;
    $whitelist = $whitelist + $this->configAutoIgnoreSettings->get('whitelist_config_entities');

    return array_filter($this->autoIgnoredItems, function ($item) use ($whitelist) {
      foreach ($whitelist as $pattern) {
        // Convert shell-wildcard to regexp pattern.
        $pattern = '/^' . strtr(preg_quote($pattern, '/'), ['\*' => '.*', '\?' => '.']) . '$/';
        if (preg_match($pattern, $item)) {
          // Item matches a whitelist pattern.
          return FALSE;
        }
      }

      // Item did NOT match any of the whitelist patterns.
      return TRUE;
    });
  }

  /**
   * Finds any overriding config_ignore_auto items that are not whitelisted.
   *
   * These items can no longer be updated by DPL releases, and therefore
   * is functionality no longer supported by DDF.
   *
   * This is displayed as a report on /admin/report/status and can also
   * be pulled from drush using:
   * drush php:eval "print_r(\Drupal::service('dpl_update.config_ignore')->getOverridenConfig());"
   *
   * @return array<string>
   *   Unsupported items that ignore and override config from the filesystem.
   */
  public function getOverridenConfig(): array {
    $items = $this->getWebmasterIgnores();
    $unsupported_items = [];

    // Loop through the non-whitelisted ignores, and check if it exists as part
    // of the DPL codebase.
    foreach ($items as $item) {
      if (!empty($this->configSyncStorage->read($item))) {
        $unsupported_items[] = $item;
      }
    }

    return $unsupported_items;
  }

  /**
   * Find auto-ignores that do not differ from codebase.
   *
   * @return array<string>
   *   The ignored items.
   */
  public function getUnusedAutoIgnores(): array {
    $items = $this->autoIgnoredItems;
    if (empty($items)) {
      return [];
    }

    $unused_items = [];

    foreach ($items as $item) {
      $item_sync = $this->configSyncStorage->read($item);
      $item_stored = $this->configStorage->read($item);

      // Sometimes, we want to add items ahead of time, for upcoming features
      // or add wildcard options. These items should not be removed.
      if (!$item_sync && !$item_stored) {
        continue;
      }

      if ($item_sync === $item_stored) {
        $unused_items[] = $item;
      }
    }

    return $unused_items;
  }

  /**
   * Find auto-ignores that do not differ from codebase, and remove them.
   */
  public function cleanUnusedIgnores(): string {
    $items = $this->autoIgnoredItems;

    if (empty($items)) {
      return 'No auto-ignored config to clean-up.';
    }

    $unused_items = $this->getUnusedAutoIgnores();

    $filtered_items = array_diff($items, $unused_items);
    $this->configAutoIgnoreSettings->set('ignored_config_entities', $filtered_items);
    $this->configAutoIgnoreSettings->save();

    $original_count = count($items);
    $new_count = count($filtered_items);
    $change_count = $original_count - $new_count;

    $message = "Removed $change_count items from config_ignore_auto.settings.ignored_config_entities";
    $this->logger->info($message);
    return $message;
  }

}
