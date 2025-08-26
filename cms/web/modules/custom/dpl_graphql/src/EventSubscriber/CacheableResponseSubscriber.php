<?php

namespace Drupal\dpl_graphql\EventSubscriber;

use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use function Safe\preg_match;

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
    protected EntityTypeManagerInterface $entityTypeManager,
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
  public function onRespond(ResponseEvent $event): void {
    if (!$event->isMainRequest()) {
      return;
    }

    // Is this a GraphQL request at all?
    $request = $event->getRequest();
    $is_graphql_request = $request->attributes->get('_graphql');
    if (!$is_graphql_request) {
      return;
    }

    // Check if the user has permission to view the cache tags.
    if (!$this->currentUser->hasPermission('get dpl graphql cache tags')) {
      return;
    }

    // Only set any headers when this is a cacheable response.
    $response = $event->getResponse();
    if ($response instanceof CacheableJsonResponse) {

      // Get the cache tags from the response.
      $tags = $response->getCacheableMetadata()->getCacheTags();

      // Add UUID-based cache tags for nodes.
      $uuid_tags = $this->addUuidCacheTags($tags);
      $all_tags = array_merge($tags, $uuid_tags);

      sort($all_tags);
      $response->headers->set('x-dpl-graphql-cache-tags', implode(' ', $all_tags));
    }
  }

  /**
   * Add UUID-based cache tags for nodes found in existing cache tags.
   *
   * @param array<string> $tags
   *   The existing cache tags.
   *
   * @return array<string>
   *   Array of UUID-based cache tags.
   */
  protected function addUuidCacheTags(array $tags): array {
    $uuid_tags = [];
    $node_ids = [];

    // Extract node IDs from existing cache tags.
    foreach ($tags as $tag) {
      // Look for node cache tags in the format 'node:123' or 'node_list'.
      if (preg_match('/^node:(\d+)$/', $tag, $matches)) {
        $node_ids[] = $matches[1];
      }
    }

    // If we found node IDs, load the nodes and add UUID cache tags.
    if (!empty($node_ids)) {
      try {
        $node_storage = $this->entityTypeManager->getStorage('node');
        $nodes = $node_storage->loadMultiple($node_ids);

        foreach ($nodes as $node) {
          $uuid = $node->uuid();
          if ($uuid) {
            $uuid_tags[] = 'node_uuid:' . $uuid;
          }
        }
      }
      catch (\Exception $e) {
        // Log the error but don't break the response.
        $this->logger->error('Error loading nodes for UUID cache tags: @message', [
          '@message' => $e->getMessage(),
        ]);
      }
    }

    return $uuid_tags;
  }

}
