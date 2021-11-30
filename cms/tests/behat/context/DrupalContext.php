<?php

namespace Dpl\Tests\Behat\Context;

use Behat\Mink\Exception\DriverException;
use Drupal\DrupalExtension\Context\RawDrupalContext;
use function Safe\preg_split as preg_split;

// Ignore short comment requirement. @Given and @Then should provide the same.
// phpcs:disable Drupal.Commenting.DocComment.MissingShort

/**
 * Behat context for managing Drupal.
 *
 * This allows us to manage Drupal in ways that existing Drupal contexts do not.
 */
class DrupalContext extends RawDrupalContext {

  /**
   * Create a user for test purposes.
   *
   * The RawDrupalContext will ensure that it gets deleted again.
   *
   * @param string[] $permissions
   *   The permissions to set for the user.
   */
  protected function createUserWithPermissions(array $permissions) : \stdClass {
    // Create a user with a set of permissions. This is the same approach as
    // \Drupal\DrupalExtension\Context\DrupalContext::assertLoggedInWithPermissions()
    // Create a temporary role with the necessary permissions.
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

    return $user;
  }

  /**
   * Wait for batch processes to finish.
   */
  protected function waitForBatchToFinish(): void {
    try {
      $this->getSession()->wait(180000, 'jQuery("#updateprogress").length === 0');
    }
    catch (DriverException $e) {
      // Do nothing. An exception might be thrown if jQuery is not available.
      // In that case we expect any batch job to be finished.
    }
  }

  /**
   * @Given I enable (the) module(s) :modules
   */
  public function enableModule(string $modules): void {
    $modules = preg_split('/\s*,\s*/', $modules);

    $user = $this->createUserWithPermissions([
      "access administration pages",
      "administer modules",
    ]);

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
    $this->waitForBatchToFinish();

    // Log out to get a clean slate.
    $this->logout(TRUE);
  }

  /**
   * @Given I run cron from the web UI
   *
   * This is useful when a cron implementation needs to use Wiremock. We only
   * have proxying set up for the FPM container - not CLI.
   */
  public function runCron(): void {
    $user = $this->createUserWithPermissions([
      "access administration pages",
      "administer site configuration",
      "access site reports",
    ]);

    // Log in with our temporary user.
    $this->login($user);

    // Now we can run cron.
    $this->visitPath('/admin/reports/status');
    $this->getSession()->getPage()->clickLink("Kør cron");
    $this->waitForBatchToFinish();

    $this->logout(TRUE);
  }

}
