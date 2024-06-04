<?php

namespace Drupal\dpl_loans\Controller;

use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Render loan list react app.
 */
class DplLoansController extends ControllerBase {

  /**
   * DplLoansController constructor.
   *
   * @param \Drupal\Core\Block\BlockManagerInterface $blockManager
   *   Drupal block manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   Drupal renderer service.
   * @param \Drupal\dpl_react\DplReactConfigInterface $loansSettings
   *   Loans settings.
   */
  public function __construct(
    private BlockManagerInterface $blockManager,
    private RendererInterface $renderer,
    private DplReactConfigInterface $loansSettings
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
      \Drupal::service('dpl_loans.settings')
    );
  }

  /**
   * Display page with the loan list.
   *
   * @return mixed[]
   *   Render array.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function list(): array {
    $config = [];

    /** @var \Drupal\dpl_loans\Plugin\Block\LoanListBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_loans_list_block', $config);

    $access_result = $plugin_block->access($this->currentUser());
    if (is_object($access_result) && $access_result->isForbidden() || is_bool($access_result) && !$access_result) {
      throw new AccessDeniedHttpException();
    }

    // Add the cache tags/contexts.
    $render = $plugin_block->build();
    $this->renderer->addCacheableDependency($render, $plugin_block);
    $this->renderer->addCacheableDependency($render, $this->loansSettings);

    return $render;
  }

}
