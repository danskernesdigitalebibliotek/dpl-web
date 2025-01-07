<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers\Services;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_consumers\Consumer;
use Drupal\dpl_consumers\ConsumerRole;
use Drupal\dpl_consumers\ConsumerUser;
use Psr\Log\LoggerInterface;

/**
 * DPL consumer handler.
 *
 * This class is responsible for creating consumers and users.
 */
class ConsumerHandler {

  /**
   * Constructor.
   */
  public function __construct(
    protected LoggerInterface $logger,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Create consumer and user connected to the consumer.
   *
   * @param \Drupal\dpl_consumers\Consumer $consumer
   *   The consumer to create.
   * @param \Drupal\dpl_consumers\ConsumerUser $user
   *   The user to connect the consumer to.
   * @param \Drupal\dpl_consumers\ConsumerRole $role
   *   The role to connect the consumer to.
   */
  public function create(Consumer $consumer, ConsumerUser $user, ConsumerRole $role): void {
    $createdUser = $user->create($role);
    $createdConsumer = $consumer->create($user, $role);
    $this->logger->info('Created consumer: @consumer, user: @user, role: @role', [
      '@consumer' => $createdConsumer->label(),
      '@user' => $createdUser->getAccountName(),
      '@role' => $role->load()->label(),
    ]);
  }

  /**
   * Delete consumer and user connected to the consumer.
   *
   * @param \Drupal\dpl_consumers\Consumer $consumer
   *   The consumer to delete.
   * @param \Drupal\dpl_consumers\ConsumerUser $user
   *   The user to delete.
   */
  public function delete(Consumer $consumer, ConsumerUser $user): void {
    $user->delete();
    $consumer->delete();
    $this->logger->info('Deleted consumer: @consumer and user: @user', [
      '@consumer' => $consumer->clientId,
      '@user' => $user->userName,
    ]);
  }

  /**
   * Get consumer.
   *
   * @param string $clientId
   *   The client ID of the consumer.
   */
  public function getConsumer(string $clientId): Consumer {
    return new Consumer($clientId, $this->entityTypeManager);
  }

  /**
   * Get consumer user.
   *
   * @param string $userName
   *   The user name of the consumer user.
   */
  public function getConsumerUser(string $userName): ConsumerUser {
    return new ConsumerUser($userName, $this->entityTypeManager);
  }

}
