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
    public string $id,
    public string $label,
    public string $clientId,
    public string $secret,
  ) {}

  /**
   * Create a consumer.
   */
  public function create(UserInterface $user, Role $role): ConsumerInterface {
    $consumer = \Drupal::entityTypeManager()->getStorage('consumer')->create([
      'label' => $this->label,
      'id' => $this->id,
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
  public static function load(string $client_id): ConsumerInterface | NULL {
    $consumers = \Drupal::entityTypeManager()
      ->getStorage('consumer')
      ->loadByProperties(['client_id' => $client_id]);

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
  public static function deleteByClientId(string $client_id) {
    if ($consumer = self::load($client_id)) {
      $consumer->delete();
    }
  }

}
