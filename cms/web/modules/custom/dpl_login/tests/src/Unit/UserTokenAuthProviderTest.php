<?php

namespace Drupal\Tests\dpl_login\Unit;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\dpl_login\UserTokenAuthProvider;
use Drupal\externalauth\ExternalAuthInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\Prophecy\ObjectProphecy;
use Symfony\Component\HttpFoundation\Request;

/**
 * Unit test for the user token authentication provider.
 *
 * @covers \Drupal\dpl_login\UserTokenAuthProvider
 */
class UserTokenAuthProviderTest extends UnitTestCase {

  /**
   * Mock OpenID Connect client used to look up user info from tokens.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<OpenIDConnectClientInterface>
   */
  private ObjectProphecy $openIdClient;

  /**
   * Mock module handler to allow alters of user info.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<ModuleHandlerInterface>
   */
  private ObjectProphecy $moduleInvoker;

  /**
   * Mock authmap to map user ids to user accounts.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<ExternalAuthInterface>
   */
  private ObjectProphecy $authMap;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->openIdClient = $this->prophesize(OpenIDConnectClientInterface::class);
    $this->moduleInvoker = $this->prophesize(ModuleHandlerInterface::class);
    $this->authMap = $this->prophesize(ExternalAuthInterface::class);
  }

  /**
   * Any request should not be handled by the provider.
   */
  public function testRegularRequestsDoesNotApply(): void {
    $provider = new UserTokenAuthProvider($this->openIdClient->reveal(), $this->moduleInvoker->reveal(), $this->authMap->reveal());
    $this->assertFalse($provider->applies(new Request()));
  }

  /**
   * A request with another type of authorization scheme should not be handled.
   */
  public function testRequestWithBasicAuthDoesNotApply(): void {
    $provider = new UserTokenAuthProvider($this->openIdClient->reveal(), $this->moduleInvoker->reveal(), $this->authMap->reveal());

    $request = new Request();
    $request->headers->set('Authorization', 'Basic abcd1234');

    $this->assertFalse($provider->applies($request));
  }

  /**
   * A request with a bearer token mapping to a known user should authenticate.
   */
  public function testKnownBearerTokenAuthenticatesUser(): void {
    $user = ($this->prophesize(AccountInterface::class))->reveal();
    $this->authMap->load('unique-patron-id', 'adgangsplatformen')->willReturn($user);
    $this->openIdClient->retrieveUserInfo('abcd1234')->willReturn([
      'sub' => 'unique-patron-id',
    ]);
    $this->openIdClient->getPluginId()->willReturn('adgangsplatformen');

    $provider = new UserTokenAuthProvider($this->openIdClient->reveal(), $this->moduleInvoker->reveal(), $this->authMap->reveal());

    $request = new Request();
    $request->headers->set('Authorization', 'Bearer abcd1234');

    $this->assertTrue($provider->applies($request));

    $authenticatedUser = $provider->authenticate($request);
    $this->assertEquals($user, $authenticatedUser);
  }

  /**
   * A request with an unknown bearer token should not authenticate.
   */
  public function testUnknownBearerTokenDoesNotAuthenticate(): void {
    $this->openIdClient->retrieveUserInfo('1234abcd')->willReturn([]);
    $provider = new UserTokenAuthProvider($this->openIdClient->reveal(), $this->moduleInvoker->reveal(), $this->authMap->reveal());

    $request = new Request();
    $request->headers->set('Authorization', 'Bearer 1234abcd');

    $this->assertNull($provider->authenticate($request));
  }

  /**
   * A request with a known bearer token mapping to an unknown user does not.
   */
  public function testUnknownPatronIdDoesNotAuthenticateUser(): void {
    $this->authMap->load('unknown-patron-id', 'adgangsplatformen')->willReturn(FALSE);
    $this->openIdClient->retrieveUserInfo('abcd1234')->willReturn([
      'sub' => 'unknown-patron-id',
    ]);
    $this->openIdClient->getPluginId()->willReturn('adgangsplatformen');

    $provider = new UserTokenAuthProvider($this->openIdClient->reveal(), $this->moduleInvoker->reveal(), $this->authMap->reveal());

    $request = new Request();
    $request->headers->set('Authorization', 'Bearer abcd1234');

    $this->assertNull($provider->authenticate($request));
  }

}
