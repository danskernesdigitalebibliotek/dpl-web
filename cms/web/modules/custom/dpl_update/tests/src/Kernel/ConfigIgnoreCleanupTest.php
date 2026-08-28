<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_update\Kernel;

use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\Core\Config\ConfigEvents;
use Drupal\Core\DrupalKernel;
use Drupal\dpl_update\Services\ConfigIgnore;
use Drupal\KernelTests\KernelTestBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tests the end-of-request clean-up of unused config_ignore_auto ignores.
 *
 * When a webmaster overrides config, config_ignore_auto adds it to its
 * ignore list. If the config is later reverted to match the codebase, the
 * ignore entry serves no purpose, and must be removed while the config still
 * matches - otherwise a later release that changes the config would make the
 * entry look like a genuine override, blocking updates of that config
 * forever.
 *
 * The saved config names are collected per save (ConfigSubscriber), and the
 * clean-up runs once at the end of the request (ConfigIgnore::destruct()),
 * so bulk operations like config imports do not pay for a clean-up pass -
 * or a config write - per saved object.
 */
class ConfigIgnoreCleanupTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   *
   * The config_ignore and config_ignore_auto modules are deliberately not
   * enabled: the service only reads their settings as plain config, and
   * enabling them would make their own config-save subscribers interfere
   * with the behaviour under test.
   */
  protected static $modules = ['dpl_update', 'drupal_typed'];

  /**
   * {@inheritdoc}
   *
   * The config_ignore_auto.settings config is written without its module
   * (and thereby schema) being installed - see $modules above - and the
   * dpl_reverted.settings-style configs the tests save are made-up names
   * that no module can declare schema for.
   */
  // phpcs:ignore DrupalPractice.Objects.StrictSchemaDisabled.StrictConfigSchema
  protected $strictConfigSchema = FALSE;

  /**
   * The service under test.
   */
  protected function configIgnore(): ConfigIgnore {
    $service = $this->container->get('dpl_update.config_ignore');
    assert($service instanceof ConfigIgnore);
    return $service;
  }

  /**
   * The current value of the auto-ignore list.
   *
   * @return array<string>
   *   The ignored config names.
   */
  protected function ignoredConfigEntities(): array {
    return (array) $this->config('config_ignore_auto.settings')
      ->get('ignored_config_entities');
  }

  /**
   * A reverted override is cleaned from the ignore list on kernel terminate.
   *
   * Also covers that genuine overrides and ahead-of-time entries (config
   * that exists in neither storage yet) survive the clean-up, and that the
   * clean-up actually runs through the needs_destruction service tag.
   */
  public function testRevertedOverrideIsCleanedUpOnTerminate(): void {
    $sync_storage = $this->container->get('config.storage.sync');

    // A config that a webmaster overrides and then reverts back to the
    // codebase value.
    $sync_storage->write('dpl_reverted.settings', ['title' => 'From codebase']);
    $this->config('dpl_reverted.settings')->set('title', 'Webmaster override')->save();

    // A config that stays genuinely overridden.
    $sync_storage->write('dpl_overridden.settings', ['title' => 'From codebase']);
    $this->config('dpl_overridden.settings')->set('title', 'Webmaster override')->save();

    $this->config('config_ignore_auto.settings')
      ->set('ignored_config_entities', [
        'dpl_reverted.settings',
        'dpl_overridden.settings',
        'dpl_future.settings',
      ])
      ->set('whitelist_config_entities', [])
      ->save();

    // The webmaster reverts the first config to match the codebase again.
    $this->config('dpl_reverted.settings')->set('title', 'From codebase')->save();

    // The needs_destruction tag must have registered the service for
    // end-of-request destruction.
    $this->assertContains(
      'dpl_update.config_ignore',
      $this->container->getParameter('kernel.destructable_services'),
    );

    // End the request. DrupalKernel::terminate() calls destruct() on every
    // initialized service registered above, which must run the clean-up.
    $kernel = $this->container->get('kernel');
    assert($kernel instanceof DrupalKernel);
    $kernel->terminate(Request::create('/'), new Response());

    // Only the reverted config gets removed: the still-overridden entry and
    // the ahead-of-time entry (existing in neither storage) must survive.
    $this->assertSame(
      ['dpl_overridden.settings', 'dpl_future.settings'],
      $this->ignoredConfigEntities(),
    );
  }

  /**
   * The end-of-request clean-up only checks config saved in the request.
   *
   * An unused ignore entry whose config was not touched is left alone by
   * destruct(), but is still removed by the full pass that deploy hooks run.
   */
  public function testCleanupOnlyChecksSavedConfig(): void {
    // An unused ignore entry: active and sync are identical. Written
    // directly to the storages so no config-save event fires for it.
    $data = ['title' => 'From codebase'];
    $this->container->get('config.storage.sync')->write('dpl_untouched.settings', $data);
    $this->container->get('config.storage')->write('dpl_untouched.settings', $data);

    $this->config('config_ignore_auto.settings')
      ->set('ignored_config_entities', ['dpl_untouched.settings'])
      ->set('whitelist_config_entities', [])
      ->save();

    // Save something unrelated, and end the request.
    $this->config('dpl_unrelated.settings')->set('title', 'Anything')->save();
    $this->configIgnore()->destruct();

    $this->assertSame(
      ['dpl_untouched.settings'],
      $this->ignoredConfigEntities(),
      'destruct() must not touch ignore entries for config that was not saved during the request.',
    );

    // The full pass - as run by deploy hooks - does remove it.
    $message = $this->configIgnore()->cleanUnusedIgnores();

    $this->assertSame(
      'Removed 1 items from config_ignore_auto.settings.ignored_config_entities',
      $message,
    );
    $this->assertSame([], $this->ignoredConfigEntities());
  }

  /**
   * When there is nothing to remove, the settings must not be re-saved.
   *
   * Re-saving an unchanged config_ignore_auto.settings costs a database
   * write, a cache invalidation and a config-save event dispatch - per
   * saved config object. On bulk operations (drush deploy, module install)
   * this used to add several seconds and a flood of "Removed 0 items" log
   * lines.
   */
  public function testNothingToRemoveCausesNoSave(): void {
    $this->config('config_ignore_auto.settings')
      ->set('ignored_config_entities', ['dpl_future.settings'])
      ->set('whitelist_config_entities', [])
      ->save();

    $ignore_settings_saves = 0;
    $this->container->get('event_dispatcher')->addListener(
      ConfigEvents::SAVE,
      function (ConfigCrudEvent $event) use (&$ignore_settings_saves): void {
        if ($event->getConfig()->getName() === 'config_ignore_auto.settings') {
          $ignore_settings_saves++;
        }
      },
    );

    $this->config('dpl_unrelated.settings')->set('title', 'Anything')->save();
    $this->configIgnore()->destruct();

    $message = $this->configIgnore()->cleanUnusedIgnores();

    $this->assertSame(
      'Removed 0 items from config_ignore_auto.settings.ignored_config_entities',
      $message,
    );
    $this->assertSame(0, $ignore_settings_saves);
    $this->assertSame(['dpl_future.settings'], $this->ignoredConfigEntities());
  }

}
