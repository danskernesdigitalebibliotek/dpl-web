<?php

namespace Dpl\Tests\Behat\Context;

use VPX\WiremockExtension\Context\WiremockAware;
use VPX\WiremockExtension\Context\WiremockAwareInterface;
use WireMock\Client\WireMock;

// Ignore short comment requirement. @Given and @Then should provide the same.
// phpcs:disable Drupal.Commenting.DocComment.MissingShort

/**
 * Behat content for dealing with Mapp.
 *
 * Adgangsplatformen is the single signon solution used by the Danish Public
 * Libraries.
 */
class MappContext implements WiremockAwareInterface {
  use WiremockAware;

  /**
   * @Then the visit should be tracked for customer :customerId
   */
  public function assertTrackingRequestSent(string $customerId): void {
    // Tracking a visit means that the Mapp JavaScript will make a request to
    // the Mapp server with the customer id.
    $this->getWiremock()->verify(
      WireMock::getRequestedFor(WireMock::urlPathMatching("^/resp/api/get/$customerId.*"))
    );
  }

}
