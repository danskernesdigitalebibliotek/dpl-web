<?php

namespace Drupal\dpl_favorites_list_material_component\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
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
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $data = [
      // Urls.
      'favorites-list-material-component-go-to-list-url' => Url::fromRoute('dpl_favorites_list.list', [], ['absolute' => TRUE])->toString(),

      // Texts.
      'favorites-list-material-component-go-to-list-text' => $this->t("Go to My list", [], ['context' => 'Favorites list material component']),
      'favorites-list-material-component-title-text' => $this->t("Your list", [], ['context' => 'Favorites list material component']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'favorites-list-material-component',
      '#data' => $data,
    ];
  }

}
