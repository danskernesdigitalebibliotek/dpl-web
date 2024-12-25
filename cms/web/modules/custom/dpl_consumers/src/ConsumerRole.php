<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers;

use Drupal\user\Entity\Role;

/**
 * DPL consumer role.
 *
 * This class is responsible for loading and deleting consumer related roles.
 */
class ConsumerRole {

  /**
   * Summary of __construct.
   *
   * @param string $id
   *   Role id.
   */
  public function __construct(
    public string $id,
  ) {}

  /**
   * Load a consumer role.
   */
  public function load(): Role | NULL {
    if (!$role = Role::load($this->id)) {
      throw new \RuntimeException(sprintf('Failed to load role: %s', $this->id));
    }

    return $role;
  }

  /**
   * Delete a consumer role.
   */
  public function delete() {
    if ($role = $this->load()) {
      $role->delete();
    }
  }

}
