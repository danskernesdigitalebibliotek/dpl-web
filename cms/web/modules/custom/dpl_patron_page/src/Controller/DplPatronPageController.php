<?php

namespace Drupal\dpl_patron_page\Controller;

use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Render patron page react app.
 */
class DplPatronPageController extends ControllerBase {

  /**
   * DplPatronPageController constructor.
   *
   * @param \Drupal\Core\Block\BlockManagerInterface $blockManager
   *   Drupal block manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   Drupal renderer service.
   */
  public function __construct(
    private BlockManagerInterface $blockManager,
    private RendererInterface $renderer
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
    );
  }

  /**
   * Demo react rendering.
   *
   * @return mixed[]
   *   Render array.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function createPage(): array {
    // You can hard code configuration, or you load from settings.
    $config = [];

    /** @var \Drupal\dpl_patron_page\Plugin\Block\PatronPageBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_patron_page_block', $config);
    // Some blocks might implement access check.
    $access_result = $plugin_block->access($this->currentUser());


    // Return empty render array if user doesn't have access.
    // $access_result can be boolean or an AccessResult class.
    if (is_object($access_result) && $access_result->isForbidden() || is_bool($access_result) && !$access_result) {
      // You might need to add some cache tags/contexts.
      return [];
    }
    
    // Add the cache tags/contexts.
    $render = $plugin_block->build();
    $this->renderer->addCacheableDependency($render, $plugin_block);

    return $render;
  }

}
