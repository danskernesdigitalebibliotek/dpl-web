<?php

namespace Drupal\dpl_update\Services;

use Drupal\Core\Config\CachedStorage;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\FileStorage;
use Drupal\Core\DestructableInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use function Safe\preg_match;

/**
 * Maintainer service for keeping ignored config in check.
 *
 * Config saves are collected during the request with markForCheck(), and
 * once the request ends (see DestructableInterface), any collected config
 * that is auto-ignored but identical to the codebase gets removed from the
 * ignore list.
 *
 * This way the clean-up runs a single time per request, regardless of how
 * many config objects get saved - a config import can save hundreds.
 */
class ConfigIgnore implements DestructableInterface {

  /**
   * Config names saved during this request, pending an unused-ignore check.
   *
   * @var array<string>
   */
  protected array $pendingChecks = [];

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
  ) {}

  /**
   * Register a saved config name, to be checked for unused ignores.
   *
   * The actual check and clean-up runs once, at the end of the request,
   * in destruct().
   */
  public function markForCheck(string $name): void {
    $this->pendingChecks[$name] = $name;
  }

  /**
   * {@inheritDoc}
   *
   * Clean up unused ignores for the config that was saved in this request.
   */
  public function destruct(): void {
    if (empty($this->pendingChecks)) {
      return;
    }

    $names = array_values($this->pendingChecks);
    $this->pendingChecks = [];

    $this->cleanUnusedIgnores($names);
  }

  /**
   * Items that are ignored as part of config_ignore_auto.
   *
   * Read freshly from config on every call: other config-save subscribers
   * (notably config_ignore_auto itself) can add items during the same
   * request, and working on a stale snapshot would overwrite their changes.
   *
   * @return array<string>
   *   The ignored items.
   */
  public function getAutoIgnoredItems(): array {
    return (array) $this->configFactory
      ->get('config_ignore_auto.settings')
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
    $whitelist = $this->configFactory
      ->get('config_ignore.settings')
      ->get('ignored_config_entities');
    // Depending on which mode we're using, config_ignore might store the
    // whitelist in an .import instead.
    $whitelist_import = $whitelist['import'] ?? NULL;
    $whitelist = (is_array($whitelist_import)) ? $whitelist['import'] : $whitelist;
    $whitelist = $whitelist + $this->configFactory
      ->get('config_ignore_auto.settings')
      ->get('whitelist_config_entities');

    return array_filter($this->getAutoIgnoredItems(), function ($item) use ($whitelist) {
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
   * @param array<string>|null $candidates
   *   If set, only ignored items in this list of config names are checked.
   *   Used to keep the end-of-request clean-up proportional to what was
   *   actually saved, instead of scanning the full ignore list.
   *
   * @return array<string>
   *   The ignored items.
   */
  public function getUnusedAutoIgnores(?array $candidates = NULL): array {
    $items = $this->getAutoIgnoredItems();

    if ($candidates !== NULL) {
      $items = array_intersect($items, $candidates);
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
   *
   * @param array<string>|null $candidates
   *   If set, only ignored items in this list of config names are checked.
   */
  public function cleanUnusedIgnores(?array $candidates = NULL): string {
    $settings = $this->configFactory->getEditable('config_ignore_auto.settings');
    $items = (array) $settings->get('ignored_config_entities');

    if (empty($items)) {
      return 'No auto-ignored config to clean-up.';
    }

    $unused_items = $this->getUnusedAutoIgnores($candidates);

    if (empty($unused_items)) {
      // Nothing to remove. Saving anyway would trigger a pointless database
      // write, cache invalidation and config-save event dispatch, so make
      // sure to only save (and log) when something actually changed.
      return 'Removed 0 items from config_ignore_auto.settings.ignored_config_entities';
    }

    $filtered_items = array_values(array_diff($items, $unused_items));

    $settings->set('ignored_config_entities', $filtered_items);
    $settings->save();

    $change_count = count($items) - count($filtered_items);

    $message = "Removed $change_count items from config_ignore_auto.settings.ignored_config_entities";
    $this->logger->info($message);
    return $message;
  }

}
