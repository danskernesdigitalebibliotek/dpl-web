<?php

/**
 * @file
 * Deploy hooks for dpl_consumers module.
 */

declare(strict_types=1);

use Drupal\dpl_consumers\DplGraphqlConsumersConstants;
use Drupal\user\Entity\User;

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

/**
 * Create a user used for draft-mode.
 */
function dpl_consumers_create_user(): void {
  $user = User::create([
    'name' => DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_USER_NAME,
    'status' => 1,
  ]);

  $user->addRole(DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_ROLE_ID);
  $user->save();
}

/**
 * Create a consumer.
 */
function dpl_consumers_create_consumer(): void {
  $consumer = \Drupal::entityTypeManager()->getStorage('consumer')->create([
    'label' => DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_CONSUMER_LABEL,
    'id' => DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_CONSUMER_ID,
    'client_id' => DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_CLIENT_ID,
    'third_party' => FALSE,
  ]);

  $consumer->save();
}
