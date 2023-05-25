<?php

namespace Drupal\dpl_favorites_list_material_component\Controller;

use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Render favorites list material component react app.
 */
class DplFavoritesListMaterialComponentController extends ControllerBase {

  /**
   * DplFavoritesListMaterialComponentController constructor.
   *
   * @param \Drupal\Core\Block\BlockManagerInterface $blockManager
   *   Drupal block manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   Drupal renderer service.
   * @param \Drupal\dpl_react\DplReactConfigInterface $favoritesListMaterialComponentSettings
   *   Favorites list material component settings.
   */
  public function __construct(
    private BlockManagerInterface $blockManager,
    private RendererInterface $renderer,
    private DplReactConfigInterface $favoritesListMaterialComponentSettings
  ) {
  }

  /**
   * {@inheritdoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The Drupal service container.
   *
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.block'),
      $container->get('renderer'),
      \Drupal::service('dpl_favorites_list_material_component.settings'),
    );
  }

  /**
   * Display page with the favorites list material component.
   *
   * @return mixed[]
   *   Render array.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function list(): array {
    $config = [];

    /** @var \Drupal\dpl_favorites_list_material_component\Plugin\Block\FavoritesListMaterialComponentBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_favorites_list_material_component_block', $config);

    $access_result = $plugin_block->access($this->currentUser());
    if (is_object($access_result) && $access_result->isForbidden() || is_bool($access_result) && !$access_result) {
      throw new AccessDeniedHttpException();
    }

    // Add the cache tags/contexts.
    $render = $plugin_block->build();
    $this->renderer->addCacheableDependency($render, $plugin_block);
    $this->renderer->addCacheableDependency($render, $this->favoritesListMaterialComponentSettings);

    return $render;
  }

}
