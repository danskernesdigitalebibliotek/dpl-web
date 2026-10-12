<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit\EventSubscriber;

use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\dpl_go\EventSubscriber\ConfigRevalidateSubscriber;
use Drupal\next\Entity\NextSiteInterface;
use Drupal\Tests\UnitTestCase;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Psr7\Response;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Test the config-save to Go-revalidate subscriber.
 *
 * @covers \Drupal\dpl_go\EventSubscriber\ConfigRevalidateSubscriber
 */
class ConfigRevalidateSubscriberTest extends UnitTestCase {

  /**
   * The revalidate url the Go next_site returns.
   */
  private const REVALIDATE_URL = 'https://go.example/cache/revalidate';

  /**
   * The shared secret the Go next_site returns.
   */
  private const REVALIDATE_SECRET = 's3cret';

  /**
   * The Go next_site entity returns a revalidate url and secret.
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
   * A saved Go config pings Go's revalidate route with the config cache tag.
   */
  public function testRevalidatesWatchedConfig(): void {
    $client = $this->prophesize(ClientInterface::class);
    $client->request('GET', self::REVALIDATE_URL, [
      'query' => [
        'tags' => 'dpl-cms-config',
        'secret' => self::REVALIDATE_SECRET,
      ],
      'timeout' => 5,
    ])->shouldBeCalledOnce()->willReturn(new Response(200));

    $logger = $this->prophesize(LoggerChannelFactoryInterface::class);

    $subscriber = new ConfigRevalidateSubscriber(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $logger->reveal(),
    );
    $subscriber->onConfigSave($this->configSaveEvent('dpl_biblio.settings'));
  }

  /**
   * An unrelated config save does not touch Go.
   */
  public function testIgnoresUnwatchedConfig(): void {
    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage(Argument::any())->shouldNotBeCalled();

    $client = $this->prophesize(ClientInterface::class);
    $client->request(Argument::cetera())->shouldNotBeCalled();

    $logger = $this->prophesize(LoggerChannelFactoryInterface::class);

    $subscriber = new ConfigRevalidateSubscriber(
      $client->reveal(),
      $entityTypeManager->reveal(),
      $logger->reveal(),
    );
    $subscriber->onConfigSave($this->configSaveEvent('system.site'));
  }

  /**
   * An unreachable Go is logged, not thrown - the config save must not break.
   */
  public function testSwallowsRequestErrors(): void {
    $client = $this->prophesize(ClientInterface::class);
    $client->request(Argument::cetera())->willThrow(new \RuntimeException('Go is down'));

    $channel = $this->prophesize(LoggerChannelInterface::class);
    $channel->warning(
      Argument::containingString('Could not revalidate Go configuration'),
      Argument::type('array'),
    )->shouldBeCalledOnce();

    $logger = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger->get('dpl_go')->willReturn($channel->reveal());

    $subscriber = new ConfigRevalidateSubscriber(
      $client->reveal(),
      $this->entityTypeManager->reveal(),
      $logger->reveal(),
    );
    $subscriber->onConfigSave($this->configSaveEvent('dpl_biblio.settings'));
  }

  /**
   * Build a config save event for a config object of the given name.
   *
   * @param string $name
   *   The saved config object's name.
   *
   * @return \Drupal\Core\Config\ConfigCrudEvent
   *   The event the subscriber receives.
   */
  private function configSaveEvent(string $name): ConfigCrudEvent {
    $config = $this->prophesize(Config::class);
    $config->getName()->willReturn($name);

    $event = $this->prophesize(ConfigCrudEvent::class);
    $event->getConfig()->willReturn($config->reveal());

    return $event->reveal();
  }

}
