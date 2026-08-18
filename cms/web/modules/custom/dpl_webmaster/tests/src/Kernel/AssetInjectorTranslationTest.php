<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_webmaster\Kernel;

use Drupal\Core\Config\TypedConfigManagerInterface;
use Drupal\Core\TypedData\TraversableTypedDataInterface;
use Drupal\Core\TypedData\TypedDataInterface;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests that asset injector configuration is not translatable.
 *
 * Translations of the CSS/JS webmasters inject makes the frontend use the
 * translated - and thus outdated - copy of the assets, so dpl_webmaster marks
 * the configuration untranslatable.
 *
 * @see \Drupal\dpl_webmaster\Hook\AssetInjectorHooks::configSchemaInfoAlter()
 */
class AssetInjectorTranslationTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'asset_injector',
    'drupal_typed',
    'dpl_webmaster',
  ];

  /**
   * CSS assets have no translatable elements.
   */
  public function testCssAssetsAreUntranslatable(): void {
    $this->assertSame([], $this->translatableElements('asset_injector.css.test', [
      'id' => 'test',
      'label' => 'Test CSS',
      'code' => 'body { color: red; }',
      'media' => 'all',
      'preprocess' => TRUE,
      'conditions' => [
        'request_path' => [
          'id' => 'request_path',
          'negate' => FALSE,
          'pages' => '/test',
        ],
      ],
      'contexts' => [],
      'conditions_require_all' => FALSE,
    ]));
  }

  /**
   * JS assets have no translatable elements.
   */
  public function testJsAssetsAreUntranslatable(): void {
    $this->assertSame([], $this->translatableElements('asset_injector.js.test', [
      'id' => 'test',
      'label' => 'Test JS',
      'code' => 'console.log("test");',
      'noscript' => '<p>JavaScript is required.</p>',
      'noscriptRegion' => ['content'],
      'jquery' => FALSE,
      'header' => FALSE,
      'preprocess' => TRUE,
      'conditions' => [],
      'contexts' => [],
      'conditions_require_all' => FALSE,
    ]));
  }

  /**
   * Elements that are translatable are still reported as such.
   *
   * A control for the two tests above: without it they would also pass if
   * translatable elements went undetected altogether.
   */
  public function testTranslatableElementsAreDetected(): void {
    $this->assertSame(['name', 'slogan'], $this->translatableElements('system.site', [
      'name' => 'Test site',
      'slogan' => 'Testing, testing',
    ]));
  }

  /**
   * Assets saved after this was put in place are untranslatable as well.
   *
   * The alter applies to the wildcard schema types of the entities, so it
   * covers whatever webmasters add or edit later, not just the assets that
   * existed when it was deployed.
   */
  public function testAssetsSavedLaterAreUntranslatable(): void {
    $storage = $this->container->get('entity_type.manager')
      ->getStorage('asset_injector_css');

    $asset = $storage->create([
      'id' => 'webmaster_addition',
      'label' => 'Webmaster addition',
      'code' => 'body { color: blue; }',
      'media' => 'all',
      'preprocess' => TRUE,
    ]);
    $asset->save();

    $name = 'asset_injector.css.webmaster_addition';
    $this->assertSame([], $this->translatableElements($name, $this->config($name)->getRawData()));
  }

  /**
   * Returns the paths of the translatable elements of configuration data.
   *
   * @param string $name
   *   The name of the configuration object the data belongs to.
   * @param mixed[] $data
   *   The configuration data.
   *
   * @return string[]
   *   Dot separated paths of the translatable elements.
   */
  protected function translatableElements(string $name, array $data): array {
    $typedConfig = $this->container->get('config.typed');
    assert($typedConfig instanceof TypedConfigManagerInterface);

    return $this->findTranslatable($typedConfig->createFromNameAndData($name, $data));
  }

  /**
   * Recursively finds the translatable elements of a configuration element.
   *
   * This is how both interface translation and configuration translation
   * determine what to translate.
   *
   * @param \Drupal\Core\TypedData\TypedDataInterface $element
   *   The configuration element to search.
   * @param string $path
   *   The path of the element, used by the recursion.
   *
   * @return string[]
   *   Dot separated paths of the translatable elements.
   *
   * @see \Drupal\config_translation\ConfigMapperManager::findTranslatable()
   * @see \Drupal\locale\LocaleConfigManager::getTranslatableData()
   */
  protected function findTranslatable(TypedDataInterface $element, string $path = ''): array {
    if ($element instanceof TraversableTypedDataInterface) {
      $translatable = [];
      foreach ($element as $key => $child) {
        $childPath = ($path === '') ? (string) $key : $path . '.' . $key;
        $translatable = array_merge($translatable, $this->findTranslatable($child, $childPath));
      }

      return $translatable;
    }

    return empty($element->getDataDefinition()['translatable']) ? [] : [$path];
  }

}
