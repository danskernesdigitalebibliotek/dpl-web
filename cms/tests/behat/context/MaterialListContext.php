<?php

namespace Dpl\Tests\Behat\Context;

use VPX\WiremockExtension\Context\WiremockAware;
use VPX\WiremockExtension\Context\WiremockAwareInterface;
use WireMock\Client\WireMock;

// Ignore short comment requirement. @Given and @Then should provide the same.
// phpcs:disable Drupal.Commenting.DocComment.MissingShort

/**
 * Behat content for dealing with the material list service.
 *
 * @see https://github.com/danskernesdigitalebibliotek/ddb-material-list
 */
class MaterialListContext implements WiremockAwareInterface {
  use WiremockAware;

  /**
   * @Given my checklist is empty
   */
  public function assertMaterialListIsEmpty(): void {
    // Any request to determine whether a material is on a list will return 404
    // meaning that it is not.
    $this->getWiremock()->stubFor(
      WireMock::head(
        WireMock::urlPathMatching("^/list/default/[\d\-\w\:]+")
      )
        ->willReturn(
          WireMock::notFound()
        )
    );
    // Any material can be added to a list.
    $this->getWiremock()->stubFor(
      WireMock::put(
        WireMock::urlPathMatching("^/list/default/[\d\-\w\:]++")
      )
        ->willReturn(
          WireMock::created()
        )
    );
  }

  /**
   * @Then the material should be added to my checklist
   */
  public function assertMaterialIsAddedToList(): void {
    $this->getWiremock()->verify(
      WireMock::putRequestedFor(
        WireMock::urlPathMatching("^/list/default/.+")
      )
    );
  }

}
