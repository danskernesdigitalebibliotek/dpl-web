<?php

declare(strict_types=1);

namespace Drupal\dpl_go\EventSubscriber;

use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\Core\Config\ConfigEvents;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\next\Entity\NextSiteInterface;
use GuzzleHttp\ClientInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Drops Go's cached CMS configuration when a Go feature flag changes.
 *
 * Go caches the goConfiguration it reads from the CMS behind the Next cache
 * tag "dpl-cms-config" with a ~15 minute TTL (see
 * go/lib/config/dpl-cms/dplCmsConfig.ts). Without a nudge a flag an editor
 * just flipped only reaches Go when that TTL expires. When one of the config
 * objects that feed goConfiguration is saved, we ping Go's revalidate route so
 * the tag is dropped at once and the next request reads the new value.
 */
class ConfigRevalidateSubscriber implements EventSubscriberInterface {

  /**
   * The Next cache tag Go stores its CMS configuration under.
   *
   * Keep in sync with the cacheTag() calls in
   * go/lib/config/dpl-cms/dplCmsConfig.ts.
   */
  protected const CONFIG_CACHE_TAG = 'dpl-cms-config';

  /**
   * Config objects whose save should revalidate Go's configuration.
   *
   * These feed the goConfiguration GraphQL query. Add a config name here when
   * a new flag or setting is exposed to Go.
   *
   * @var string[]
   */
  protected const WATCHED_CONFIG = [
    'dpl_biblio.settings',
  ];

  public function __construct(
    #[Autowire(service: 'http_client')]
    protected ClientInterface $httpClient,
    protected EntityTypeManagerInterface $entityTypeManager,
    #[Autowire(service: 'logger.factory')]
    protected LoggerChannelFactoryInterface $loggerFactory,
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
   * Revalidate Go's configuration when a watched config object is saved.
   *
   * @param \Drupal\Core\Config\ConfigCrudEvent $event
   *   The config save event.
   */
  public function onConfigSave(ConfigCrudEvent $event): void {
    if (!in_array($event->getConfig()->getName(), static::WATCHED_CONFIG, TRUE)) {
      return;
    }

    try {
      $site = $this->entityTypeManager->getStorage('next_site')->load('go');
      if (!$site instanceof NextSiteInterface) {
        return;
      }

      $url = $site->getRevalidateUrl();
      $secret = $site->getRevalidateSecret();
      if (!$url || !$secret) {
        return;
      }

      $this->httpClient->request('GET', $url, [
        'query' => [
          'tags' => static::CONFIG_CACHE_TAG,
          'secret' => $secret,
        ],
        'timeout' => 5,
      ]);
    }
    catch (\Throwable $e) {
      // Pinging Go must never break saving config: the flag is stored either
      // way, and Go self-heals when its cache TTL expires. An unreachable Go
      // (e.g. mid-deploy) or an environment without the next module lands here.
      $this->loggerFactory->get('dpl_go')->warning(
        'Could not revalidate Go configuration after %config changed: @message',
        [
          '%config' => $event->getConfig()->getName(),
          '@message' => $e->getMessage(),
        ]
      );
    }
  }

}
