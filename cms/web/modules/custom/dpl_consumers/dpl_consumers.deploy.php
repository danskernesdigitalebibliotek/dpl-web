<?php

/**
 * @file
 * Deploy hooks for dpl_consumers module.
 */

declare(strict_types=1);

use Drupal\dpl_consumers\Consumer;
use Drupal\dpl_consumers\ConsumerRole;
use Drupal\dpl_consumers\ConsumerUser;

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
  // Delete consume and users that we want to handle differently.
  // We want to create consumers and consumer users
  // specifically for the two known consumers (BNF and Go) and connected users.
  (new Consumer("graphql_consumer"))->delete();
  (new ConsumerUser('GraphQL Consumer'))->delete();
  (new ConsumerUser('graphql_consumer'))->delete();

  // Check if we have the necessary secrets for new consumers and their users.
  if (!$bnf_consumer_secret = getenv('BNF_GRAPHQL_CONSUMER_SECRET')) {
    throw new \Exception('BNF_GRAPHQL_CONSUMER_SECRET not found.');
  }
  if (!$go_consumer_secret = getenv('GO_GRAPHQL_CONSUMER_SECRET')) {
    throw new \Exception('GO_GRAPHQL_CONSUMER_SECRET not found.');
  }
  if (!$bnf_consumer_user_password = getenv('BNF_GRAPHQL_CONSUMER_USER_PASSWORD')) {
    throw new \Exception('BNF_GRAPHQL_CONSUMER_USER_PASSWORD not found.');
  }
  if (!$go_consumer_user_password = getenv('GO_GRAPHQL_CONSUMER_USER_PASSWORD')) {
    throw new \Exception('GO_GRAPHQL_CONSUMER_USER_PASSWORD not found.');
  }

  // Create new consumers (BNF and Go) and their users and roles.
  /** @var \Drupal\dpl_consumers\Services\ConsumerHandler $handler */
  $consumer_handler = \Drupal::service('dpl_consumers.consumer_handler');
  $consumers = [
    [
      'consumer' => new Consumer('bnf_graphql', 'BNF GraphQL', $bnf_consumer_secret),
      'user' => new ConsumerUser('bnf_graphql', $bnf_consumer_user_password),
      'role' => new ConsumerRole('bnf_graphql_client'),
    ],
    [
      'consumer' => new Consumer('go_graphql', 'GO GraphQL', $go_consumer_secret),
      'user' => new ConsumerUser('go_graphql', $go_consumer_user_password),
      'role' => new ConsumerRole('go_graphql_client'),
    ],
  ];

  foreach ($consumers as $consumer) {
    $consumer_handler->setComponents($consumer['consumer'], $consumer['user'], $consumer['role'])->create();
  }
}
