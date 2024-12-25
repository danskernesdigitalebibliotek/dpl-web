<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers;

use Drupal\consumers\Entity\ConsumerInterface;
use Drupal\user\Entity\Role;
use Drupal\user\UserInterface;

/**
 * DPL consumer.
 *
 * This class is responsible for creating consumers.
 */
class Consumer {

  public function __construct(
    public string $clientId,
    public string | NULL $label = NULL,
    public string | NULL $secret = NULL,
  ) {}

  /**
   * Create a consumer.
   */
  public function create(UserInterface $user, Role $role): ConsumerInterface {
    if (!$this->label || !$this->clientId || !$this->secret) {
      throw new \RuntimeException('Label, client ID and secret are required to create a consumer.');
    }
    $consumer = \Drupal::entityTypeManager()->getStorage('consumer')->create([
      'label' => $this->label,
      'client_id' => $this->clientId,
      'secret' => $this->secret,
      'third_party' => FALSE,
      'user_id' => $user->id(),
      'roles' => [$role->id()],
    ]);

    $consumer->save();

    if (!($consumer instanceof ConsumerInterface)) {
      throw new \RuntimeException('Failed to create consumer.');
    }

    return $consumer;
  }

  /**
   * Load a consumer.
   */
  protected function load(): ConsumerInterface | NULL {
    $consumers = \Drupal::entityTypeManager()
      ->getStorage('consumer')
      ->loadByProperties(['client_id' => $this->clientId]);

    if (empty($consumers)) {
      return NULL;
    }

    $consumer = reset($consumers);

    if (!($consumer instanceof ConsumerInterface)) {
      return NULL;
    }

    return $consumer;
  }

  /**
   * Delete a consumer based on a client ID.
   */
  public function delete() {
    if ($consumer = $this->load()) {
      $consumer->delete();
    }
  }

}
