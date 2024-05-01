<?php

namespace Drupal\dpl_event\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Provides an access checker for the event series tab.
 *
 * This access check ensures that the tab for editing event instances
 * is only available when there are more than one instance in the series.
 *
 * This is necessary because in the current setup, if an editor wants to edit
 * an event instance, but that instance is the only one in the series, they
 * should edit the event series instead of the instance. Because of this, it
 * does not make sense to show the tab for editing instances.
 */
class EventSeriesTabAccessCheck implements AccessInterface {

  /**
   * The entity type manager service.
   */
  public function __construct(
    private EntityTypeManagerInterface $entityTypeManager
  ) {}

  /**
   * Access callback for the event series edit instances tab.
   *
   * Checks if there are more than one instance in the event series and grants
   * or denies access based on this condition.
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route
   *   The route match interface to get route parameters.
   *
   * @return \Drupal\Core\Access\AccessResult
   *   The access result.
   */
  public function access(RouteMatchInterface $route): AccessResult {
    $eventSeriesId = $route->getParameter('eventseries');

    // Create cache metadata.
    $cache_metadata = new CacheableMetadata();
    $cache_metadata->setCacheTags(['eventinstance_list']);

    if (!$eventSeriesId) {
      return AccessResult::forbidden()->addCacheableDependency($cache_metadata);
    }

    $eventSeriesEntity = $this->entityTypeManager->getStorage('eventseries')->load($eventSeriesId);
    if (!$eventSeriesEntity instanceof EventSeries) {
      return AccessResult::forbidden()->addCacheableDependency($cache_metadata);
    }

    $instanceCount = $eventSeriesEntity->getInstanceCount();
    return AccessResult::allowedIf($instanceCount > 1)
      ->addCacheableDependency($cache_metadata);
  }

}
