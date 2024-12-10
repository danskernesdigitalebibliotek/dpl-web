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
 * Redirect to AND from eventseries, depending on the situation.
 *
 * - If accessing an eventseries with a single active instance, redirect to
 *   that instance
 * - If failing to access an unpublished eventinstance, redirect to the
 *   parent series.
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
      KernelEvents::REQUEST => [
        ['checkEventSeriesRedirect'],
      ],
      // Only target users that end up on an unpublished eventinstance page,
      // without being allowed to see it.
      KernelEvents::EXCEPTION => [
        ['checkEventInstanceRedirect'],
      ],
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

    // Only redirect, if we can find a single eventinstance - otherwise, we
    // want to stay on the series display.
    if (count($upcoming_ids) != 1) {
      return;
    }

    $event_instance_id = reset($upcoming_ids);
    $event_instance = $this->entityTypeManager->getStorage('eventinstance')->load($event_instance_id);

    if ($event_instance instanceof EventInstance) {
      $response = new RedirectResponse($event_instance->toUrl()->toString());
      $event->setResponse($response);
    }
  }

  /**
   * Redirect unpublished eventinstances to eventseries.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The response event.
   */
  public function checkEventInstanceRedirect(RequestEvent $event): void {
    $request = $event->getRequest();

    if ($request->attributes->get('_route') !== 'entity.eventinstance.canonical') {
      return;
    }

    $event_instance = $request->attributes->get('eventinstance');

    if (!($event_instance instanceof EventInstance) || $event_instance->isPublished()) {
      return;
    }

    // At this stage, we know we're on an unpublished eventinstance.
    // Look up the eventseries, and redirect to it.
    $event_series = $event_instance->getEventSeries();

    $response = new RedirectResponse($event_series->toUrl()->toString());
    $event->setResponse($response);
  }

}
