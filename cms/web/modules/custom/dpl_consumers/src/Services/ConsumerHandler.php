<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers\Services;

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
   * Consumer used for guarding requests.
   *
   * @param \Drupal\dpl_consumers\Consumer $consumer
   */
  protected Consumer $consumer;
  /**
   * User tied to the consumer.
   *
   * @param \Drupal\dpl_consumers\ConsumerUser $user
   */
  protected ConsumerUser $user;
  /**
   * Role tied to the consumer user.
   *
   * @param \Drupal\dpl_consumers\ConsumerRole $role
   */
  protected ConsumerRole | NULL $role;

  /**
   * Constructor.
   */
  public function __construct(
    protected LoggerInterface $logger,
  ) {}

  /**
   * Set needed components for the handler.
   */
  public function setComponents(Consumer $consumer, ConsumerUser $user, ?ConsumerRole $role = NULL): self {
    $this->consumer = $consumer;
    $this->user = $user;
    $this->role = $role;

    return $this;
  }

  /**
   * Create consumer and user connected to the consumer.
   */
  public function create(): void {
    if (!$this->role) {
      throw new \RuntimeException('Role is required to create a consumer.');
    }
    if (!$role = $this->role->load()) {
      throw new \RuntimeException('Role could not be loaded.');
    }
    $user = $this->user->create($role);
    $consumer = $this->consumer->create($user, $role);
    $this->logger->info('Created consumer: @consumer, user: @user, role: @role', [
      '@consumer' => $consumer->label(),
      '@user' => $user->getAccountName(),
      '@role' => $role->label(),
    ]);
  }

  /**
   * Delete consumer and user connected to the consumer.
   */
  public function delete(): void {
    $this->user->delete();
    $this->consumer->delete();
    $this->logger->info('Deleted consumer: @consumer and user: @user', [
      '@consumer' => $this->consumer->clientId,
      '@user' => $this->user->userName,
    ]);
  }

}
