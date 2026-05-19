<?php

declare(strict_types=1);

namespace Drupal\dpl_login\EventSubscriber;

use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Sets Cache-Control: no-store on authenticated patron page responses.
 *
 * This prevents browsers from serving stale authenticated content from the HTTP
 * disk cache when a user navigates back after logging out.
 */
class PatronPageCacheSubscriber implements EventSubscriberInterface {

  use AutowireTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected AccountInterface $currentUser,
    protected KillSwitch $killSwitch,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    $events = [];

    $events[KernelEvents::RESPONSE][] = ['onResponse'];

    return $events;
  }

  /**
   * Add no-store cache header to authenticated patron page responses.
   */
  public function onResponse(ResponseEvent $event): void {
    if (!$this->currentUser->isAuthenticated()) {
      return;
    }

    $path = $event->getRequest()->getPathInfo();
    if (!str_starts_with($path, '/user/me')) {
      return;
    }

    $event->getResponse()->headers->set('Cache-Control', 'no-store');
    $this->killSwitch->trigger();
  }

}
