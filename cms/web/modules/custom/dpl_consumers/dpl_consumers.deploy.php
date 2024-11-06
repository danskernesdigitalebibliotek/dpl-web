<?php

/**
 * @file
 * Deploy hooks for dpl_consumers module.
 */

declare(strict_types=1);

require_once __DIR__ . '/dpl_consumers.crud.php';

/**
 * Run consumer creation on deploy.
 *
 * We run the user and consumer creation in a deploy_hook instead of
 * a install_hook, as we run into problems with the password_policy
 * module not being installed when we try to create the user. Doing
 * it this way instead, we make sure that everything is ready for the
 * user and consumer creation.
 */
function dpl_consumers_deploy_create_user(): void {
  dpl_consumers_create_user();
  dpl_consumers_create_consumer();
}
