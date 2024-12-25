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
  protected ConsumerRole $role;

  /**
   * Constructor.
   */
  public function __construct(
    protected LoggerInterface $logger,
  ) {}

  /**
   * Set needed components for the handler.
   */
  public function setComponents(Consumer $consumer, ConsumerUser $user, ConsumerRole $role): self {
    $this->consumer = $consumer;
    $this->user = $user;
    $this->role = $role;

    return $this;
  }

  /**
   * Create consumer and user connected to the consumer.
   */
  public function create(): void {
    $role = $this->role->load();
    $user = $this->user->create($role);
    $consumer = $this->consumer->create($user, $role);
    $this->logger->info('Created consumer: @consumer, user: @user, role: @role', [
      '@consumer' => $consumer->label(),
      '@user' => $user->getAccountName(),
      '@role' => $role->label(),
    ]);
  }

}
