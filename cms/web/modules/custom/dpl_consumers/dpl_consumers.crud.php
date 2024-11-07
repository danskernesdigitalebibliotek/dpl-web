<?php

/**
 * @file
 * Contains functions to create and delete users and consumers.
 */

use Drupal\dpl_consumers\DplGraphqlConsumersConstants;
use Drupal\user\Entity\User;

/**
 * Create a user with the GraphQL consumer role.
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

/**
 * Delete the user.
 */
function dpl_consumers_delete_user(): void {
  try {
    // Delete the user.
    $user = \Drupal::entityTypeManager()
      ->getStorage('user')
      ->loadByProperties(['name' => DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_USER_NAME]);

    if (!empty($user)) {
      $user = reset($user);
      $user->delete();
    }
  }
  catch (\Exception $e) {
    // We just log here in the deletion. It's not critical if it fails.
    \Drupal::logger('dpl_consumers')->error($e->getMessage());
  }
}

/**
 * Delete the consumer.
 */
function dpl_consumers_delete_consumer(): void {
  try {
    // Delete the consumer.
    $consumer = \Drupal::entityTypeManager()
      ->getStorage('consumer')
      ->loadByProperties(['label' => DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_CONSUMER_LABEL]);

    if (!empty($consumer)) {
      $consumer = reset($consumer);
      $consumer->delete();
    }
  }
  catch (\Exception $e) {
    \Drupal::logger('dpl_consumers')->error($e->getMessage());
  }
}
