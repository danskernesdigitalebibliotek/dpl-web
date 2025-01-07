<?php

/**
 * @file
 * Deploy hooks for dpl_consumers module.
 */

declare(strict_types=1);

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
function dpl_consumers_deploy_10001(): void {
  // Noop. We don't need to do anything here.
  // Since we have changed our minds.
  // @see dpl_consumers_deploy_10002().
}

/**
 * Expand the users, roles, consumers so they can handle both BNF and GO.
 *
 * So we delete previous entities and create new ones.
 */
function dpl_consumers_deploy_10002(): void {
  /** @var \Drupal\dpl_consumers\Services\ConsumerHandler $consumer_handler */
  $consumer_handler = \Drupal::service('dpl_consumers.consumer_handler');

  // Delete consume and users that we want to handle differently.
  // We want to create consumers and consumer users
  // specifically for the two known consumers (BNF and Go) and connected users.
  $consumer_handler->getConsumer('graphql_consumer')->delete();
  $consumer_handler->getConsumerUser('GraphQL Consumer')->delete();
  $consumer_handler->getConsumerUser('graphql_consumer')->delete();

  // Create new consumers (BNF and Go) and their users and roles.
  foreach (dpl_consumers_known_consumers_settings() as $consumer) {
    $consumer_handler->create($consumer['consumer'], $consumer['user'], $consumer['role']);
  }
}
