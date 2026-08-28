<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\SchemaExtension;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ThemeSettingsProvider;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Theme\ThemeInitializationInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Brand settings extension.
 *
 * @SchemaExtension(
 *   id = "dpl_app_brand_settings",
 *   name = "Brand settings extension",
 *   description = "Exposes brand settings via GraphQL",
 *   schema = "graphql_compose"
 * )
 */
class BrandSettingsExtension extends SdlSchemaExtensionPluginBase {

  /**
   * Constructs a new BrandSettingsExtension.
   */
  public function __construct(
    array $configuration,
    string $plugin_id,
    mixed $plugin_definition,
    ModuleHandlerInterface $moduleHandler,
    protected ThemeInitializationInterface $themeInitialization,
    protected ConfigFactoryInterface $configFactory,
    protected FileUrlGeneratorInterface $fileUrlGenerator,
    protected ThemeSettingsProvider $themeSettingsProvider,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $moduleHandler);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('module_handler'),
      $container->get('theme.initialization'),
      $container->get('config.factory'),
      $container->get('file_url_generator'),
      $container->get(ThemeSettingsProvider::class)
    );
  }

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('Query', 'getAppBrandSettings',
      $builder->callback(function () {
        return [];
      })
    );

    $registry->addFieldResolver('BrandSettings', 'logoUrl',
      $builder->callback(function () {
        $default_theme = $this->configFactory->get('system.theme')->get('default');

        $logo_path = $this->themeSettingsProvider->getSetting('logo.path', $default_theme);

        if (!$logo_path) {
          $logo_setting = $this->themeSettingsProvider->getSetting('logo', $default_theme);
          if (is_array($logo_setting) && !empty($logo_setting['logo'])) {
            $logo_path = $logo_setting['logo'];
          }
          elseif (is_string($logo_setting) && !empty($logo_setting)) {
            $logo_path = $logo_setting;
          }
        }

        if ($logo_path) {
          return $this->fileUrlGenerator->generateAbsoluteString($logo_path);
        }

        // Fallback to active theme default logo.
        $logo = $this->themeInitialization->getActiveThemeByName($default_theme)->getLogo();
        return $this->fileUrlGenerator->generateAbsoluteString($logo);
      })
    );
  }

}
