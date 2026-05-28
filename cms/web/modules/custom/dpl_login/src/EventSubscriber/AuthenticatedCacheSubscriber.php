<?php

declare(strict_types=1);

namespace Drupal\dpl_login\EventSubscriber;

use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Sets Cache-Control: no-store on all authenticated responses.
 *
 * This prevents browsers from serving stale authenticated content from the HTTP
 * disk cache when a user navigates back after logging out. Without this header
 * the browser may restore pages that contain user-specific UI such as the
 * authenticated menu modal.
 */
class AuthenticatedCacheSubscriber implements EventSubscriberInterface {

  use AutowireTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected AccountInterface $currentUser,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::RESPONSE => 'onResponse',
    ];
  }

  /**
   * Add no-store cache header to all authenticated responses.
   */
  public function onResponse(ResponseEvent $event): void {
    if (!$this->currentUser->isAuthenticated()) {
      return;
    }

    $event->getResponse()->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

}
