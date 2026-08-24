<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_webmaster\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\locale\StringStorageInterface;

/**
 * Tests the clean-up of leftover asset injector translation strings.
 *
 * The nightly configuration translation import registered the CSS/JS of the
 * assets as translatable strings. They are harmless now that the assets are
 * untranslatable, but they still clutter up the translation tables.
 *
 * @see dpl_webmaster_update_10105()
 */
class AssetInjectorStringCleanupTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'locale',
    'drupal_typed',
    'dpl_webmaster',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installSchema('locale', [
      'locales_source',
      'locales_target',
      'locales_location',
    ]);
    $this->container->get('module_handler')->loadInclude('dpl_webmaster', 'install');
  }

  /**
   * Only strings that the assets alone brought in are deleted.
   */
  public function testLeftoverAssetStringsAreDeleted(): void {
    $storage = $this->localeStorage();

    // CSS that only ever existed as an asset - translation included, as the
    // import did translate assets for a while.
    $assetOnly = $storage->createString(['source' => 'body { color: red; }'])
      ->addLocation('configuration', 'asset_injector.css.webmaster')
      ->save();
    $storage->createTranslation([
      'lid' => $assetOnly->getId(),
      'language' => 'da',
      'translation' => 'body { color: blue; }',
    ])->save();

    // An asset label which is a genuine interface string as well.
    $shared = $storage->createString(['source' => 'Print'])
      ->addLocation('configuration', 'asset_injector.css.webmaster')
      ->addLocation('code', 'modules/custom/dpl_print/dpl_print.module')
      ->save();

    // A string the assets never had anything to do with.
    $unrelated = $storage->createString(['source' => 'Reserve'])
      ->addLocation('code', 'modules/custom/dpl_loans/dpl_loans.module')
      ->save();

    $feedback = dpl_webmaster_update_10105();

    // The asset string is gone, and so is its translation.
    $this->assertNull($storage->findString(['lid' => $assetOnly->getId()]));
    $this->assertSame([], $storage->getTranslations(['lid' => $assetOnly->getId()]));
    $this->assertSame([], $this->locationTypes($assetOnly->getId()));

    // The shared string is kept, but the asset is no longer a source of it.
    $this->assertNotNull($storage->findString(['lid' => $shared->getId()]));
    $this->assertSame(['code'], $this->locationTypes($shared->getId()));

    // And the unrelated string was left alone entirely.
    $this->assertNotNull($storage->findString(['lid' => $unrelated->getId()]));
    $this->assertSame(['code'], $this->locationTypes($unrelated->getId()));

    $this->assertStringContainsString('Deleted 1 asset injector strings', $feedback);
    $this->assertStringContainsString('source of 1 strings', $feedback);
  }

  /**
   * Nothing to clean up is reported rather than attempted.
   */
  public function testCleanUpWithoutAssetStrings(): void {
    $this->localeStorage()->createString(['source' => 'Reserve'])
      ->addLocation('code', 'modules/custom/dpl_loans/dpl_loans.module')
      ->save();

    $this->assertSame(
      'No asset injector strings in the translation tables',
      dpl_webmaster_update_10105()
    );
  }

  /**
   * The locale string storage.
   */
  protected function localeStorage(): StringStorageInterface {
    $storage = $this->container->get('locale.storage');
    assert($storage instanceof StringStorageInterface);

    return $storage;
  }

  /**
   * Returns the location types a string is registered from.
   *
   * @param string|int $lid
   *   The ID of the string.
   *
   * @return string[]
   *   The location types, deduplicated.
   */
  protected function locationTypes(string|int $lid): array {
    $locations = $this->localeStorage()->getLocations(['sid' => $lid]);

    return array_values(array_unique(array_column($locations, 'type')));
  }

}
