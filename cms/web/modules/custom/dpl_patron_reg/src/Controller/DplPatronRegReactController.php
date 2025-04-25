<?php

declare(strict_types=1);

namespace Drupal\dpl_patron_reg\Controller;

use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\dpl_patron_reg\DplPatronRegSettings;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Patron registration Controller.
 */
class DplPatronRegReactController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected BlockManagerInterface $blockManager,
    protected RendererInterface $renderer,
    protected DplPatronRegSettings $patronRegSettings,
  ) {}

  /**
   * Load the user registration react application.
   *
   * @return mixed[]
   *   Render array with registration block.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function userRegistrationReactAppLoad(): array {
    /** @var \Drupal\dpl_patron_reg\Plugin\Block\PatronRegistrationBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_patron_reg_block', []);

    // @todo create service for access check.
    // Some blocks might implement access check.
    $access_result = $plugin_block->access($this->currentUser());
    if (is_object($access_result) && $access_result->isForbidden() || is_bool($access_result) && !$access_result) {
      throw new AccessDeniedHttpException();
    }

    // Add the cache tags/contexts.
    $render = $plugin_block->build();
    $this->renderer->addCacheableDependency($render, $plugin_block);
    $this->renderer->addCacheableDependency($render, $this->patronRegSettings);

    return $render;
  }

}
