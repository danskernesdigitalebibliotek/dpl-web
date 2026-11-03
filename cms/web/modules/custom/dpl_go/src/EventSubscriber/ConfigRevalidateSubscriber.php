<?php

declare(strict_types=1);

namespace Drupal\dpl_go\EventSubscriber;

use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\Core\Config\ConfigEvents;
use Drupal\dpl_go\GoRevalidator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Revalidates Go's cached CMS configuration when a feature flag changes.
 *
 * Go caches the goConfiguration it reads from the CMS behind the Next cache
 * tag "dpl-cms-config" with a ~15 minute TTL (see
 * go/lib/config/dpl-cms/dplCmsConfig.ts). Without a nudge a flag an editor just
 * flipped only reaches Go when that TTL expires. This maps a saved config
 * object to the Go cache tags it backs and asks GoRevalidator to drop them.
 */
class ConfigRevalidateSubscriber implements EventSubscriberInterface {

  /**
   * Go cache tags to drop, keyed by the config object that backs them.
   *
   * Add an entry when a new flag or setting is exposed to Go through
   * goConfiguration.
   *
   * @var array<string, string[]>
   */
  protected const CONFIG_TAGS = [
    'dpl_biblio.settings' => [GoRevalidator::CONFIG_CACHE_TAG],
  ];

  public function __construct(
    protected GoRevalidator $revalidator,
  ) {}

  /**
   * {@inheritdoc}
   *
   * @return array<string, string>
   *   The event names to listen for, mapped to the handling method.
   */
  public static function getSubscribedEvents(): array {
    return [
      ConfigEvents::SAVE => 'onConfigSave',
    ];
  }

  /**
   * Revalidate the Go cache tags a saved config object backs.
   *
   * @param \Drupal\Core\Config\ConfigCrudEvent $event
   *   The config save event.
   */
  public function onConfigSave(ConfigCrudEvent $event): void {
    $tags = static::CONFIG_TAGS[$event->getConfig()->getName()] ?? [];
    if ($tags) {
      $this->revalidator->revalidateTags(...$tags);
    }
  }

}
