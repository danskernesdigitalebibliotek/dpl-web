<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit\EventSubscriber;

use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\dpl_go\EventSubscriber\ConfigRevalidateSubscriber;
use Drupal\dpl_go\GoRevalidatorInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;

/**
 * Test the config-save to Go-revalidate subscriber.
 *
 * @covers \Drupal\dpl_go\EventSubscriber\ConfigRevalidateSubscriber
 */
class ConfigRevalidateSubscriberTest extends UnitTestCase {

  /**
   * A watched config save drops the Go cache tags it backs.
   */
  public function testWatchedConfigRevalidatesItsTags(): void {
    $revalidator = $this->prophesize(GoRevalidatorInterface::class);
    $revalidator->revalidateTags('dpl-cms-config')->shouldBeCalledOnce();

    $subscriber = new ConfigRevalidateSubscriber($revalidator->reveal());
    $subscriber->onConfigSave($this->configSaveEvent('dpl_biblio.settings'));
  }

  /**
   * An unrelated config save touches nothing in Go.
   */
  public function testUnwatchedConfigRevalidatesNothing(): void {
    $revalidator = $this->prophesize(GoRevalidatorInterface::class);
    $revalidator->revalidateTags(Argument::cetera())->shouldNotBeCalled();

    $subscriber = new ConfigRevalidateSubscriber($revalidator->reveal());
    $subscriber->onConfigSave($this->configSaveEvent('system.site'));
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
