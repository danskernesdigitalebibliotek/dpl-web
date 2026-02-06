<?php

namespace Drupal\dpl_admin\Plugin\views\access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\views\Plugin\views\access\AccessPluginBase;
use Psr\Container\ContainerInterface;
use Symfony\Component\Routing\Route;

/**
 * A custom access handler, that returns Allowed if bnf_server is enabled.
 *
 * This is necessary as we have views and content that should only be available
 * on the BNF server.
 *
 * @ingroup views_access_plugins
 *
 * @ViewsAccess(
 *   id = "bnf_server_access",
 *   title = @Translation("Allowed if bnf_server is enabled.")
 * )
 */
class BnfServerEnabledAccess extends AccessPluginBase {

  /**
   * The module handler.
   */
  protected ModuleHandlerInterface $moduleHandler;

  /**
   * {@inheritDoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ModuleHandlerInterface $module_handler) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('module_handler'),
    );
  }

  /**
   * {@inheritDoc}
   */
  public function access(AccountInterface $account): bool {
    return $this->moduleHandler->moduleExists('bnf_server');
  }

  /**
   * {@inheritDoc}
   */
  public function accessRoute(AccountInterface $account): AccessResult {
    return AccessResult::allowedIf($this->access($account));
  }

  /**
   * {@inheritDoc}
   */
  public function alterRouteDefinition(Route $route): void {
    $route->setRequirement('_custom_access', 'dpl_admin.bnf_server_access:accessRoute');
  }

}
