<?php

namespace Drupal\dpl_event\EventSubscriber;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Redirects requests for eventseries entities.
 *
 * @package Drupal\dpl_event\EventSubscriber
 */
class EventsRedirect implements EventSubscriberInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a new EventsRedirect object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::REQUEST => [
        ['checkEventSeriesRedirect'],
        ['checkEditInstanceRedirect'],
      ],
    ];
  }

  /**
   * Redirects the visit to an event series to the event instance.
   *
   * If there is only one instance in the series.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The request event.
   */
  public function checkEventSeriesRedirect(RequestEvent $event): void {

    $request = $event->getRequest();
    $route_name = $request->attributes->get('_route');
    $eventSeries = $request->attributes->get('eventseries');

    if ($route_name !== 'entity.eventseries.canonical' ||
      !$eventSeries instanceof EventSeries ||
      $eventSeries->getInstanceCount() > 1) {
      return;
    }

    $eventInstance = $eventSeries->get('event_instances')->referencedEntities();
    if (empty($eventInstance)) {
      return;
    }
    $eventInstance = reset($eventInstance);
    if ($eventInstance instanceof EventInstance) {
      return;
    }

    $response = new RedirectResponse($eventInstance->toUrl()->toString());
    $event->setResponse($response);
  }

  /**
   * Redirects the visit to an event instance edit form to the event series.
   *
   * Edit form, if there is only one instance in the series.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The request event.
   */
  public function checkEditInstanceRedirect(RequestEvent $event): void {
    $request = $event->getRequest();
    $route_name = $request->attributes->get('_route');
    $eventInstance = $request->attributes->get('eventinstance');

    if ($route_name !== 'entity.eventinstance.edit_form' || !$eventInstance instanceof EventInstance) {
      return;
    }

    $eventSeries = $eventInstance->getEventSeries();
    if (!$eventSeries instanceof EventSeries || $eventSeries->getInstanceCount() > 1) {
      return;
    }

    $response = new RedirectResponse($eventSeries->toUrl('edit-form')->toString());
    $event->setResponse($response);
  }

}
