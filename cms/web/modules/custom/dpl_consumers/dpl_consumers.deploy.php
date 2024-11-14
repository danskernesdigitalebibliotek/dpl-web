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
 * an install_hook, as we run into problems with the password_policy
 * module not being installed when we try to create the user. Doing
 * it this way instead, we make sure that everything is ready for the
 * user and consumer creation.
 *
 * We make sure to delete already existing user and consumers before
 * as we don't want to create duplicates.
 */
function dpl_consumers_deploy_1(): void {
  dpl_consumers_delete_user();
  dpl_consumers_delete_consumer();
  dpl_consumers_create_user();
  dpl_consumers_create_consumer();
}
