<?php

namespace Drupal\dpl_graphql\EventSubscriber;

use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Cache\CacheableResponseInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Add cache tags headers on cacheable responses, for external caching systems.
 */
class CacheableResponseSubscriber implements EventSubscriberInterface {

  /**
   * Constructor.
   */
  public function __construct(
    protected AccountProxyInterface $currentUser,
    protected LoggerInterface $logger,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::RESPONSE][] = ['onRespond'];
    return $events;
  }

  /**
   * Add cache tags headers on cacheable responses.
   *
   * @param \Symfony\Component\HttpKernel\Event\ResponseEvent $event
   *   The event to process.
   */
  public function onRespond(ResponseEvent $event) {
    if (!$event->isMainRequest()) {
      return;
    }

    if (!$this->currentUser->hasPermission('get dpl graphql cache tags')) {
      return;
    }

    // Only set any headers when this is a cacheable response.
    $response = $event->getResponse();
    if ($response instanceof CacheableJsonResponse) {

      // Get the cache tags from the response and set them as a header.
      $tags = $response->getCacheableMetadata()->getCacheTags();
      sort($tags);
      $response->headers->set('x-dpl-graphql-cache-tags', implode(' ', $tags));
    }
  }

}
