<?php

declare(strict_types=1);

namespace Drupal\dpl_patron_menu\Hook;

use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\AdminContext;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Theme hooks for dpl_patron_menu module.
 */
class ThemeHooks {

  public function __construct(
    protected AdminContext $adminContext,
    protected RouteMatchInterface $routeMatch,
    protected BlockManagerInterface $blockManager,
    protected AccountInterface $currentUser,
  ) {}

  /**
   * Add the patron menu to non-admin pages.
   *
   * @param mixed[] $variables
   *   Theme variables.
   */
  #[Hook('preprocess_page')]
  public function addPatronMenu(array &$variables): void {
    // If the current route is an admin route, don't render the patron menu.
    if ($this->adminContext->isAdminRoute($this->routeMatch->getRouteObject())) {
      return;
    }

    /** @var \Drupal\dpl_patron_menu\Plugin\Block\PatronMenuBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_patron_menu_block', []);

    // @todo create service for access check.
    $access_result = $plugin_block->access($this->currentUser);
    if (!$access_result) {
      throw new AccessDeniedHttpException();
    }

    $variables['patron'] = [
      'menu' => $plugin_block->build(),
    ];
  }

}
