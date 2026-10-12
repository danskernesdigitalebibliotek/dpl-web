<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\Core\Url;
use Drupal\dpl_go\GoRevalidator;
use Drupal\next\Entity\NextSiteInterface;
use Drupal\Tests\UnitTestCase;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Psr7\Response;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Test the Go revalidator service.
 *
 * @covers \Drupal\dpl_go\GoRevalidator
 */
class GoRevalidatorTest extends UnitTestCase {

  /**
   * The Go next_site, which builds the revalidate url (next module reuse).
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\next\Entity\NextSiteInterface>
   */
  private ObjectProphecy $site;

  /**
   * An entity type manager whose "next_site" storage returns the Go site.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityTypeManagerInterface>
   */
  private ObjectProphecy $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->site = $this->prophesize(NextSiteInterface::class);

    $storage = $this->prophesize(EntityStorageInterface::class);
    $storage->load('go')->willReturn($this->site->reveal());

    $this->entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $this->entityTypeManager->getStorage('next_site')->willReturn($storage->reveal());
  }

  /**
   * Tags are passed to buildRevalidateUrl and the built url is requested.
   */
  public function testRevalidateTagsSendsRequest(): void {
    $built = 'https://go.example/cache/revalidate?tags=dpl-cms-config,other&secret=s3cret';
    $this->stubRevalidateUrl(['tags' => 'dpl-cms-config,other'], $built);

    $client = $this->prophesize(ClientInterface::class);
    $client->request('GET', $built, ['timeout' => 5])
      ->shouldBeCalledOnce()
      ->willReturn(new Response(200));

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $this->unusedLoggerFactory(),
    );

    $this->assertTrue($revalidator->revalidateTags('dpl-cms-config', 'other'));
  }

  /**
   * A path is passed to buildRevalidateUrl and the built url is requested.
   */
  public function testRevalidatePathsSendsRequest(): void {
    $built = 'https://go.example/cache/revalidate?path=/&secret=s3cret';
    $this->stubRevalidateUrl(['path' => '/'], $built);

    $client = $this->prophesize(ClientInterface::class);
    $client->request('GET', $built, ['timeout' => 5])
      ->shouldBeCalledOnce()
      ->willReturn(new Response(200));

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $this->unusedLoggerFactory(),
    );

    $this->assertTrue($revalidator->revalidatePaths('/'));
  }

  /**
   * With nothing to drop, the site is never touched and no request is made.
   */
  public function testEmptyTagsSendNothing(): void {
    $this->site->buildRevalidateUrl(Argument::any())->shouldNotBeCalled();

    $client = $this->prophesize(ClientInterface::class);
    $client->request(Argument::cetera())->shouldNotBeCalled();

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $this->unusedLoggerFactory(),
    );

    $this->assertFalse($revalidator->revalidateTags());
  }

  /**
   * Without a configured "go" next_site, nothing is sent.
   */
  public function testNoGoSiteReturnsFalse(): void {
    $storage = $this->prophesize(EntityStorageInterface::class);
    $storage->load('go')->willReturn(NULL);

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('next_site')->willReturn($storage->reveal());

    $client = $this->prophesize(ClientInterface::class);
    $client->request(Argument::cetera())->shouldNotBeCalled();

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $entityTypeManager->reveal(),
      $this->unusedLoggerFactory(),
    );

    $this->assertFalse($revalidator->revalidateTags('dpl-cms-config'));
  }

  /**
   * An unreachable Go is logged, not thrown, and reported as not sent.
   */
  public function testSwallowsRequestErrors(): void {
    $this->stubRevalidateUrl(
      ['tags' => 'dpl-cms-config'],
      'https://go.example/cache/revalidate?tags=dpl-cms-config&secret=s3cret',
    );

    $client = $this->prophesize(ClientInterface::class);
    $client->request(Argument::cetera())->willThrow(new \RuntimeException('Go is down'));

    $channel = $this->prophesize(LoggerChannelInterface::class);
    $channel->warning(
      Argument::containingString('Could not revalidate Go'),
      Argument::type('array'),
    )->shouldBeCalledOnce();

    $loggerFactory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $loggerFactory->get('dpl_go')->willReturn($channel->reveal());

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $loggerFactory->reveal(),
    );

    $this->assertFalse($revalidator->revalidateTags('dpl-cms-config'));
  }

  /**
   * Stub the Go site to build the given url for the given revalidate query.
   *
   * @param array<string, string> $query
   *   The query the service passes to buildRevalidateUrl.
   * @param string $built
   *   The url string the built Url resolves to.
   */
  private function stubRevalidateUrl(array $query, string $built): void {
    $url = $this->prophesize(Url::class);
    $url->toString()->willReturn($built);
    $this->site->buildRevalidateUrl($query)->willReturn($url->reveal());
  }

  /**
   * A logger factory the test does not expect to be used.
   *
   * @return \Drupal\Core\Logger\LoggerChannelFactoryInterface
   *   A revealed mock with no predictions.
   */
  private function unusedLoggerFactory(): LoggerChannelFactoryInterface {
    return $this->prophesize(LoggerChannelFactoryInterface::class)->reveal();
  }

}
