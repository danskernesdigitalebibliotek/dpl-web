<?php

namespace Drupal\dpl_event\EventSubscriber;

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
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::REQUEST => 'checkEventSeriesRedirect',
    ];
  }

  /**
   * Redirects the visit to an event series to the event instance if there is.
   *
   * Only one instance.
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
    $eventSeries = $request->attributes->get('eventseries');

    if ($route_name !== 'entity.eventseries.canonical' || !$eventSeries instanceof EventSeries || $eventSeries->getInstanceCount() > 1) {
      return;
    }

    $eventInstances = $eventSeries->get('event_instances')->referencedEntities();
    if (count($eventInstances) === 1 && $eventInstances[0] instanceof EventInstance) {
      $response = new RedirectResponse($eventInstances[0]->toUrl()->toString());
      $event->setResponse($response);
    }
  }

}
