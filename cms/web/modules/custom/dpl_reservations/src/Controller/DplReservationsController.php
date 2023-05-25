<?php

namespace Drupal\dpl_reservations\Controller;

use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Render reservation list react app.
 */
class DplReservationsController extends ControllerBase {

  /**
   * DplReservationsController constructor.
   *
   * @param \Drupal\Core\Block\BlockManagerInterface $blockManager
   *   Drupal block manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   Drupal renderer service.
   * @param \Drupal\dpl_react\DplReactConfigInterface $reservationListSettings
   *   Reservation list configuration.
   */
  public function __construct(
    private BlockManagerInterface $blockManager,
    private RendererInterface $renderer,
    private DplReactConfigInterface $reservationListSettings
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
      \Drupal::service('dpl_reservations.settings'),
    );
  }

  /**
   * Build the reservation list page.
   *
   * @return mixed[]
   *   Render array.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function list(): array {
    // You can hard code configuration, or you load from settings.
    $config = [];

    /** @var \Drupal\dpl_reservations\Plugin\Block\ReservationListBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_reservations_list_block', $config);

    // Some blocks might implement access check.
    $access_result = $plugin_block->access($this->currentUser());

    if (is_object($access_result) && $access_result->isForbidden() || is_bool($access_result) && !$access_result) {
      throw new AccessDeniedHttpException();
    }

    // Add the cache tags/contexts.
    $render = $plugin_block->build();
    $this->renderer->addCacheableDependency($render, $plugin_block);
    $this->renderer->addCacheableDependency($render, $this->reservationListSettings);

    return $render;
  }

}
