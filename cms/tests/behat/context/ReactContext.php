<?php

namespace Dpl\Tests\Behat\Context;

use Behat\MinkExtension\Context\MinkAwareContext;
use Drupal\DrupalExtension\MinkAwareTrait;
use function Safe\preg_match as preg_match;
use function Safe\sprintf as sprintf;

// Ignore short comment requirement. @Given and @Then should provide the same.
// phpcs:disable Drupal.Commenting.DocComment.MissingShort

/**
 * Behat context for managing React components.
 *
 * React components provides user interfaces for interacting with many library
 * systems.
 */
class ReactContext implements MinkAwareContext {
  use MinkAwareTrait;

  /**
   * @Then I should have a :type token
   */
  public function assertToken(string $type): void {
    $this->visitPath('/dpl-react/user-tokens');
    $session = $this->getSession();
    if ($session->getStatusCode() !== 200) {
      throw new \RuntimeException(
        "Unable to retrieve user tokens from {$session->getCurrentUrl()}",
        $session->getStatusCode()
      );
    }
    // Look for code which will set the token in the response. We cannot parse
    // the response directly to get the value.
    if (!preg_match("/setToken\(\"$type\", \"\w+\"\)/",
      $session->getPage()->getContent())) {
      throw new \RuntimeException(sprintf(
        'Tokens at %s do not contain expected type "%s"',
        $session->getCurrentUrl(),
        $type,
      ));
    }
  }

}
