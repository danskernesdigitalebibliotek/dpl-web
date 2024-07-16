<?php

namespace Drupal\dpl_something_similar\Controller;

use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Render something similar react app.
 */
class DplSomethingSimilarController extends ControllerBase {

  /**
   * DplSomethingSimilarController constructor.
   *
   * @param \Drupal\Core\Block\BlockManagerInterface $blockManager
   *   Drupal block manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   Drupal renderer service.
   */
  public function __construct(
    private BlockManagerInterface $blockManager,
    private RendererInterface $renderer,
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
   * Display page with the something similar component.
   *
   * @return mixed[]
   *   Render array.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function list(): array {
    $config = [];

    /** @var \Drupal\dpl_something_similar\Plugin\Block\SomethingSimilarBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_something_similar_block', $config);

    $access_result = $plugin_block->access($this->currentUser());
    if (is_object($access_result) && $access_result->isForbidden() || is_bool($access_result) && !$access_result) {
      throw new AccessDeniedHttpException();
    }

    // Add the cache tags/contexts.
    $render = $plugin_block->build();
    $this->renderer->addCacheableDependency($render, $plugin_block);

    return $render;
  }

}
