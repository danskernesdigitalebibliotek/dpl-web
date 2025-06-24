<?php

use Drupal\Core\Extension\ModuleInstallerInterface;
use Drupal\drupal_typed\DrupalTyped;

/**
 * Uninstall unsupported patron modules for BNF server.
 *
 * We do this, to get the patron links in the header to not show up on
 * Delingstjenesten.
 */
function bnf_server_deploy_uninstall_patron(): string {
  $modules = [
    'dpl_patron_page', 'dpl_patron_menu', 'dpl_patron_reg',
  ];

  DrupalTyped::service(ModuleInstallerInterface::class, 'module_installer')->uninstall($modules);
  $modules_string = implode(', ', $modules);
  return "Uninstalled modules: {$modules_string}.";
}
