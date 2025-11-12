<?php

namespace Drupal\dpl_update\EventSubscriber;

use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\Core\Config\ConfigEvents;
use Drupal\dpl_update\Services\ConfigIgnoreCleanup;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * When saving config, clean any pointless items in config_ignore_auto.
 *
 * Pointless meaning that the config in the database matches the codebase.
 */
class ConfigSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritDoc}
   */
  public function __construct(
    #[Autowire(service: 'dpl_update.config_ignore_cleanup')]
    protected ConfigIgnoreCleanup $configCleaner,
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
      $this->configCleaner->cleanUnusedIgnores();
    }
  }

}
