<?php

namespace Drupal\dpl_event\EventSubscriber;

use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Handles redirections for event instances.
 *
 * @package Drupal\dpl_event\EventSubscriber
 */
class EventInstanceEditRedirect implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::REQUEST => 'checkEventInstanceEditRedirect',
    ];
  }

  /**
   * Redirects the visit to an event instance edit form to the event series.
   *
   * Edit form if there is only one instance.
   *
   * This is necessary because if an editior wants to edit an event instance,
   * but that instance is the only one in the series, they should edit the event
   * series instead of the instance. Because of this, we automatically
   * redirect them to the event series edit form.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The request event.
   */
  public function checkEventInstanceEditRedirect(RequestEvent $event): void {
    $request = $event->getRequest();
    $route_name = $request->attributes->get('_route');
    $eventInstance = $request->attributes->get('eventinstance');

    if ($route_name !== 'entity.eventinstance.edit_form' || !$eventInstance instanceof EventInstance) {
      return;
    }

    $eventSeries = $eventInstance->getEventSeries();
    if ($eventSeries instanceof EventSeries && $eventSeries->getInstanceCount() === 1) {
      $response = new RedirectResponse($eventSeries->toUrl('edit-form')->toString());
      $event->setResponse($response);
    }
  }

}
