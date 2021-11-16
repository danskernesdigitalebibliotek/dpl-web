<?php

// phpcs:disable Drupal.Commenting.DocComment.MissingShort
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

use Behat\MinkExtension\Context\MinkAwareContext;
use Drupal\DrupalExtension\MinkAwareTrait;
use VPX\WiremockExtension\Context\WiremockAware;
use VPX\WiremockExtension\Context\WiremockAwareInterface;
use WireMock\Client\WireMock;

/**
 * Behat content for dealing with Adgangsplatformen.
 *
 * Adgangsplatformen is the single signon solution used by the Danish Public
 * Libraries.
 */
class AdgangsplatformenContext implements MinkAwareContext, WiremockAwareInterface {
  use WiremockAware, MinkAwareTrait;

  /**
   * @Given I am authenticated on Adgangsplatformen
   */
  public function assertLoggedInOnAdgangsplatformen(): void {
    // Mock requests which are made clientside and serverside during an OAuth2/
    // OpenID Connect login flow.
    // Values resembling actual data which might be returned from
    // Adgangsplatformen.
    $authorization_code = "7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc";
    $access_token = "447131b0a03fe0421204c54e5c21a60d70030fd1";
    $user_guid = "19a4ae39-be07-4db9-a8b7-8bbb29f03da6";

    // The browser will be redirected here when logging in.
    // If the user is not logged in on Adgangsplatformen a login form would be
    // shown. A redirect would be issued if the login is successful.
    // If the user is already logged in the redirect is issued immediately.
    $this->getWiremock()->stubFor(
      WireMock::get(
        WireMock::urlPathEqualTo("/oauth/authorize")
      )
        ->withQueryParam("response_type", WireMock::equalTo("code"))
        ->willReturn(
          // Use templating to transfer state from request to response.
          // Otherwise the client will not accept the redirect.
          WireMock::temporaryRedirect(
            "http://varnish:8080/adgangsplatformen/callback?code=$authorization_code&state={{request.query.[state]}}"
          )
            ->withTransformers("response-template")
        )
    );

    // The server will call this when processing the callback from
    // Adgangsplatformen to retrieve an access token form the authorization
    // code.
    $this->getWiremock()->stubFor(
      WireMock::post(
        WireMock::urlPathEqualTo("/oauth/token/")
      )
        ->withMultipartRequestBody(
          Wiremock::aMultipart()
            ->withMultipartBody(WireMock::containing("grant_type=authorization_code"))
            ->withMultipartBody(WireMock::containing("code=$authorization_code"))
        )
        ->willReturn(WireMock::aResponse()
          ->withBody(json_encode([
            "access_token" => $access_token,
            "token_type" => "Bearer",
            "expires_in" => 2591999,
          ]) ?: "")
        )
    );

    // The server will call this when processing the callback to retrieve user
    // information corresponding to the access token.
    $this->getWiremock()->stubFor(
      WireMock::get(
        WireMock::urlPathEqualTo("/userinfo/")
      )
        ->withHeader("Authorization", WireMock::equalTo("Bearer $access_token"))
        ->willReturn(WireMock::aResponse()
          ->withBody(json_encode([
            'attributes' => [
              'uniqueId' => $user_guid,
            ],
          ]) ?: "")
        )
    );

  }

  /**
   * @Given I log in with Adgangsplatformen
   */
  public function assertLogInWithAdgangsplatformen(): void {
    // This is a crude way to start a log in process with Adgangsplatformen
    // based on the default configuration of the OpenID Connect module.
    // It should be refactored when user profile handling is implemented.
    $this->getSession()->visit($this->locatePath("/user/login"));
    $this->getSession()->getPage()->pressButton("Log in with Adgangsplatformen");
  }

  /**
   * @Then I am authenticated as a patron
   */
  public function assertLoggedInAsPatron(): bool {
    // @todo Determine if user has patron role.
    // We do not have a proper way to determine that the user is actually
    // authenticated as a patron. For now we simply check whether the user is
    // logged in. If that is the case then the /user route will redirect to
    // the user/id route.
    $this->getSession()->visit($this->locatePath('/user'));
    return (bool) preg_match("/user\/\d+/", $this->getSession()->getCurrentUrl());
  }

}
