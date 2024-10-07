<?php

namespace Drupal\dpl_event\EventSubscriber;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_event\ReoccurringDateFormatter;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Redirects requests for single instance event series to that instance.
 *
 * @package Drupal\dpl_event\EventSubscriber
 */
class EventSeriesRedirect implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    private EntityTypeManagerInterface $entityTypeManager,
    private ReoccurringDateFormatter $reoccurringDateFormatter,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::REQUEST => 'checkEventSeriesRedirect',
    ];
  }

  /**
   * Redirects the visit to an event series to the event instance if only 1.
   *
   * This is necessary because if a user visits an event series page, but there
   * is only one instance in the series, they should be redirected to the event
   * instance page instead of the series page since currently this contains
   * all the relevant information for that event.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The request event.
   */
  public function checkEventSeriesRedirect(RequestEvent $event): void {

    $request = $event->getRequest();
    $route_name = $request->attributes->get('_route');
    $event_series = $request->attributes->get('eventseries');

    if ($route_name !== 'entity.eventseries.canonical' || !$event_series instanceof EventSeries) {
      return;
    }

    $upcoming_ids = $this->reoccurringDateFormatter->getUpcomingEventIds($event_series);

    if (count($upcoming_ids) > 1) {
      return;
    }

    $event_instance_id = reset($upcoming_ids);
    $event_instance = $this->entityTypeManager->getStorage('eventinstance')->load($event_instance_id);

    if ($event_instance instanceof EventInstance) {
      $response = new RedirectResponse($event_instance->toUrl()->toString());
      $event->setResponse($response);
    }
  }

}
