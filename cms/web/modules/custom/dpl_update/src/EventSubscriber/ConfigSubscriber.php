<?php

namespace Drupal\dpl_update\EventSubscriber;

use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\Core\Config\ConfigEvents;
use Drupal\dpl_update\Services\ConfigIgnore;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * When saving config, clean any pointless items in config_ignore_auto.
 *
 * Pointless meaning that the config in the database matches the codebase.
 *
 * The saved config names are only collected here - the actual clean-up runs
 * once, at the end of the request, in ConfigIgnore::destruct(). Running it
 * on every save would make bulk operations (config import, module install)
 * pay for a full clean-up pass per saved config object.
 */
class ConfigSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritDoc}
   */
  public function __construct(
    #[Autowire(service: 'dpl_update.config_ignore')]
    protected ConfigIgnore $configCleaner,
  ) {}

  /**
   * {@inheritdoc}
   *
   * @return array<mixed>
   *   The event names to listen for, and the methods that should be executed.
   */
  public static function getSubscribedEvents(): array {
    return [
      ConfigEvents::SAVE => 'configSave',
    ];
  }

  /**
   * React to a config object being saved.
   *
   * @param \Drupal\Core\Config\ConfigCrudEvent $event
   *   Config crud event.
   */
  public function configSave(ConfigCrudEvent $event): void {
    $name = $event->getConfig()->getName();

    if ($name !== 'config_ignore_auto.settings') {
      $this->configCleaner->markForCheck($name);
    }
  }

}
