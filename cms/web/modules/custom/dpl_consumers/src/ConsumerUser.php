<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\user\Entity\User;
use Drupal\user\UserInterface;

/**
 * DPL consumer user.
 *
 * This class is responsible for creating, loading
 * and deleting consumer related users.
 */
class ConsumerUser {

  public function __construct(
    public string $userName,
    protected EntityTypeManagerInterface $entityTypeManager,
    public string | NULL $password = NULL,
  ) {}

  /**
   * Create a user.
   */
  public function create(ConsumerRole $role): UserInterface {
    if (!$this->password) {
      throw new \RuntimeException('Password is required to create a user.');
    }
    // Create user and connect role.
    $user = User::create([
      'name' => $this->userName,
      'pass' => $this->password,
      'status' => 1,
    ]);

    $user->addRole((string) $role->load()->id());
    $user->save();

    return $user;
  }

  /**
   * Load a user.
   */
  public function load(): UserInterface {
    $users = $this->entityTypeManager
      ->getStorage('user')
      ->loadByProperties(['name' => $this->userName]);

    if (empty($users)) {
      throw new \RuntimeException('Failed to load user.');
    }
    $user = reset($users);

    if (!($user instanceof UserInterface)) {
      throw new \RuntimeException('Failed to load user.');
    }

    return $user;
  }

  /**
   * Delete a user.
   */
  public function delete(): void {
    try {
      $user = $this->load();
    }
    catch (\Exception $e) {
      // Does not matter if loading fails.
      // We just do not try to delete the user then.
      return;
    }
    $user->delete();
  }

}
