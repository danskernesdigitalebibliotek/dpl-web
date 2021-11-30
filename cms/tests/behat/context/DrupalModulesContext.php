<?php

namespace Dpl\Tests\Behat\Context;

use Drupal\DrupalExtension\Context\RawDrupalContext;
use function Safe\preg_split as preg_split;

// Ignore short comment requirement. @Given and @Then should provide the same.
// phpcs:disable Drupal.Commenting.DocComment.MissingShort

/**
 * Behat context for managing modules.
 *
 * The Drupal API driver does not have a native way to do this so this fakes
 * the process through the UI.
 */
class DrupalModulesContext extends RawDrupalContext {

  /**
   * @Given I enable (the) module(s) :modules
   */
  public function enableModule(string $modules): void {
    $modules = preg_split('/\s*,\s*/', $modules);

    // Create a user which can enable the modules. This is the same approach as
    // \Drupal\DrupalExtension\Context\DrupalContext::assertLoggedInWithPermissions()
    // Create a temporary role with the necessary permissions.
    $permissions = ["access administration pages", "administer modules"];
    $role = $this->getDriver()->roleCreate($permissions);

    // Create user.
    $user = new \stdClass();
    $user->name = $this->getRandom()->name(8);
    $user->pass = $this->getRandom()->name(16);
    $user->role = $role;
    $user->mail = "{$user->name}@example.com";
    $user = $this->userCreate($user);
    assert($user instanceof \stdClass);

    // Assign the temporary role with given permissions.
    $this->getDriver()->userAddRole($user, $role);
    $this->roles[] = $role;

    // Log in with our temporary user.
    $this->login($user);

    // Now we can enable any modules not already enabled.
    $this->visitPath('/admin/modules');
    $page = $this->getSession()->getPage();

    // Check off any module not already enabled.
    array_map(function (string $module) use ($page) {
      if ($page->hasCheckedField("modules[$module][enable]")) {
        return;
      }
      $page->checkField("modules[$module][enable]");
    }, $modules);

    // Install the modules while passing though confirm forms and batch jobs.
    $page->pressButton('edit-submit');
    if ($page->has('named', ['id', 'system-modules-confirm-form'])) {
      $page->pressButton('edit-submit');
    }
    $this->getSession()->wait(180000, 'jQuery("#updateprogress").length === 0');

    // Log out to get a clean slate.
    $this->logout(TRUE);
  }

}
