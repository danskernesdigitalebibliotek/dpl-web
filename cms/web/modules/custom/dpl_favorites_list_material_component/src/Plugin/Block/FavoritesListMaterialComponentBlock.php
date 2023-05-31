<?php

namespace Drupal\dpl_favorites_list_material_component\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user Favorites list material component.
 *
 * @Block(
 *   id = "dpl_favorites_list_material_component_block",
 *   admin_label = "Favorites list material component"
 * )
 */
class FavoritesListMaterialComponentBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

  /**
   * FavoritesListMaterialComponentBlock constructor.
   *
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
    $this->configFactory = $configFactory;
  }

  /**
   * {@inheritDoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The service container.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param int $plugin_definition
   *   The plugin implementation definition.
   *
   * @return \Drupal\dpl_favorites_list_material_component\Plugin\Block\FavoritesListMaterialComponentBlock|static
   *   Favorites list material component block.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $favoritesListMaterialComponentSettings = $this->configFactory->get('favorites_list_material_component.settings');

    $data = [
      // Urls.
      'dpl-cms-base-url' => DplReactAppsController::dplCmsBaseUrl(),
      'favorites-list-material-component-go-to-list-url' => $favoritesListMaterialComponentSettings->get('favorites_list_url'),
      // Texts.
      'add-to-favorites-aria-label-text' => $this->t("Add @title to favorites list", [], ['context' => 'Favorites list material component (aria)']),
      'favorites-list-material-component-go-to-list-text' => $this->t("Go to My list", [], ['context' => 'Favorites list material component']),
      'favorites-list-material-component-title-text' => $this->t("Your list", [], ['context' => 'Favorites list material component']),
      'material-and-author-text' => $this->t("and", [], ['context' => 'Favorites list material component']),
      'material-by-author-text' => $this->t("By", [], ['context' => 'Favorites list material component']),
      'remove-from-favorites-aria-label-text' => $this->t("Remove @title from favorites list", [], ['context' => 'Favorites list material component (aria)']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'favorites-list-material-component',
      '#data' => $data,
    ];
  }

}
