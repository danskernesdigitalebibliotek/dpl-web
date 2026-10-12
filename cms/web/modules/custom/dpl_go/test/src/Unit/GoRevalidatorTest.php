<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
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
   * The revalidate url the Go next_site returns.
   */
  private const REVALIDATE_URL = 'https://go.example/cache/revalidate';

  /**
   * The shared secret the Go next_site returns.
   */
  private const REVALIDATE_SECRET = 's3cret';

  /**
   * An entity type manager whose "go" next_site returns a url and secret.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityTypeManagerInterface>
   */
  private ObjectProphecy $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $site = $this->prophesize(NextSiteInterface::class);
    $site->getRevalidateUrl()->willReturn(self::REVALIDATE_URL);
    $site->getRevalidateSecret()->willReturn(self::REVALIDATE_SECRET);

    $storage = $this->prophesize(EntityStorageInterface::class);
    $storage->load('go')->willReturn($site->reveal());

    $this->entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $this->entityTypeManager->getStorage('next_site')->willReturn($storage->reveal());
  }

  /**
   * Tags are sent, comma-joined, with the secret, to the revalidate url.
   */
  public function testRevalidateTagsSendsRequest(): void {
    $client = $this->prophesize(ClientInterface::class);
    $client->request('GET', self::REVALIDATE_URL, [
      'query' => [
        'tags' => 'dpl-cms-config,other',
        'secret' => self::REVALIDATE_SECRET,
      ],
      'timeout' => 5,
    ])->shouldBeCalledOnce()->willReturn(new Response(200));

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $this->unusedLoggerFactory(),
    );

    $this->assertTrue($revalidator->revalidateTags('dpl-cms-config', 'other'));
  }

  /**
   * A path is sent to the revalidate url with the secret.
   */
  public function testRevalidatePathsSendsRequest(): void {
    $client = $this->prophesize(ClientInterface::class);
    $client->request('GET', self::REVALIDATE_URL, [
      'query' => [
        'path' => '/',
        'secret' => self::REVALIDATE_SECRET,
      ],
      'timeout' => 5,
    ])->shouldBeCalledOnce()->willReturn(new Response(200));

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $this->unusedLoggerFactory(),
    );

    $this->assertTrue($revalidator->revalidatePaths('/'));
  }

  /**
   * With nothing to drop, no request is made.
   */
  public function testEmptyTagsSendNothing(): void {
    $client = $this->prophesize(ClientInterface::class);
    $client->request(Argument::cetera())->shouldNotBeCalled();

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage(Argument::any())->shouldNotBeCalled();

    $revalidator = new GoRevalidator(
      $client->reveal(),
      $entityTypeManager->reveal(),
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
   * A logger factory the test does not expect to be used.
   *
   * @return \Drupal\Core\Logger\LoggerChannelFactoryInterface
   *   A revealed mock with no predictions.
   */
  private function unusedLoggerFactory(): LoggerChannelFactoryInterface {
    return $this->prophesize(LoggerChannelFactoryInterface::class)->reveal();
  }

}
