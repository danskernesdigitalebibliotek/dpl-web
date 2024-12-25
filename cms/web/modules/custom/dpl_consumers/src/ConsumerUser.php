<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers;

use Drupal\user\Entity\User;
use Drupal\user\RoleInterface;
use Drupal\user\UserInterface;

/**
 * DPL consumer user.
 *
 * This class is responsible for creating, loading and deleting consumer related users.
 */
class ConsumerUser {

  /**
   * Summary of __construct.
   *
   * @param string $userName
   *   Adsdas.
   * @param string $password
   *   Adsdasf.
   */
  public function __construct(
    public string $userName,
    public string $password,
  ) {}

  /**
   *
   */
  public function create(RoleInterface $role): UserInterface {
    // Create role.
    $user = User::create([
      'name' => $this->userName,
      'pass' => $this->password,
      'status' => 1,
    ]);

    $user->addRole($role->id());
    $user->save();

    return $user;
  }

  /**
   *
   */
  public function load(): UserInterface | NULL {
    $users = \Drupal::entityTypeManager()
      ->getStorage('user')
      ->loadByProperties(['name' => $this->userName]);

    if (empty($users)) {
      return NULL;
    }

    $user = reset($users);

    if (!($user instanceof UserInterface)) {
      return NULL;
    }

    return $user;
  }

  /**
   *
   */
  public function delete() {
    if ($user = $this->load()) {
      $user->delete();
    }
  }

}
