<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_metrics\Unit;

use Drupal\Core\Cache\Context\CacheContextsManager;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Site\Settings;
use Drupal\dpl_metrics\Access\MetricsAccessCheck;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Symfony\Component\HttpFoundation\Request;

/**
 * Unit tests for access to the metrics endpoint.
 */
class MetricsAccessCheckTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    // AccessResult attaches cache contexts, which needs a container even
    // though every result here is explicitly uncacheable.
    $cacheContexts = $this->prophesize(CacheContextsManager::class);
    $cacheContexts->assertValidTokens(Argument::any())->willReturn(TRUE);

    $container = new ContainerBuilder();
    $container->set('cache_contexts_manager', $cacheContexts->reveal());
    \Drupal::setContainer($container);
  }

  /**
   * A request carrying the configured bearer token is allowed.
   */
  public function testValidTokenIsAllowed(): void {
    new Settings(['dpl_metrics.token' => 'sekrit']);

    $result = (new MetricsAccessCheck())->access(
      $this->requestWithToken('Bearer sekrit'),
      $this->accountWithoutPermission(),
    );

    $this->assertTrue($result->isAllowed());
  }

  /**
   * The bearer prefix is optional.
   */
  public function testBareTokenIsAllowed(): void {
    new Settings(['dpl_metrics.token' => 'sekrit']);

    $result = (new MetricsAccessCheck())->access(
      $this->requestWithToken('sekrit'),
      $this->accountWithoutPermission(),
    );

    $this->assertTrue($result->isAllowed());
  }

  /**
   * A wrong token falls through to the permission check, which denies.
   */
  public function testWrongTokenIsForbidden(): void {
    new Settings(['dpl_metrics.token' => 'sekrit']);

    $result = (new MetricsAccessCheck())->access(
      $this->requestWithToken('Bearer guess'),
      $this->accountWithoutPermission(),
    );

    $this->assertFalse($result->isAllowed());
  }

  /**
   * With no token configured the endpoint is closed, not open.
   *
   * A site that installs the module without finishing setup must not end up
   * publishing its metrics.
   */
  public function testUnconfiguredTokenIsForbidden(): void {
    new Settings([]);

    $result = (new MetricsAccessCheck())->access(
      $this->requestWithToken('Bearer anything'),
      $this->accountWithoutPermission(),
    );

    $this->assertFalse($result->isAllowed());
  }

  /**
   * An empty configured token cannot be satisfied by an empty header.
   */
  public function testEmptyTokenCannotBeMatched(): void {
    new Settings(['dpl_metrics.token' => '']);

    $result = (new MetricsAccessCheck())->access(
      new Request(),
      $this->accountWithoutPermission(),
    );

    $this->assertFalse($result->isAllowed());
  }

  /**
   * An account holding the permission gets in without a token.
   */
  public function testPermissionGrantsAccess(): void {
    new Settings([]);

    $account = $this->prophesize(AccountInterface::class);
    $account->hasPermission('access dpl metrics')->willReturn(TRUE);

    $result = (new MetricsAccessCheck())->access(new Request(), $account->reveal());

    $this->assertTrue($result->isAllowed());
  }

  /**
   * Builds a request presenting the given authorization header.
   *
   * @param string $token
   *   The header value.
   *
   * @return \Symfony\Component\HttpFoundation\Request
   *   The request.
   */
  private function requestWithToken(string $token): Request {
    $request = new Request();
    $request->headers->set('Authorization', $token);

    return $request;
  }

  /**
   * Builds an account holding no permissions.
   *
   * @return \Drupal\Core\Session\AccountInterface
   *   The account.
   */
  private function accountWithoutPermission(): AccountInterface {
    $account = $this->prophesize(AccountInterface::class);
    $account->hasPermission('access dpl metrics')->willReturn(FALSE);

    return $account->reveal();
  }

}
