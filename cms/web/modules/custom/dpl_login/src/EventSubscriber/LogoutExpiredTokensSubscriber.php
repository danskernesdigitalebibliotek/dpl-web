<?php

declare(strict_types=1);

namespace Drupal\dpl_login\EventSubscriber;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\Session\AccountInterface;
use Drupal\dpl_login\User;
use Drupal\dpl_login\UserTokens;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Logs out users when the token expires.
 *
 * Currently the frontend doesn't deal with expired tokens, and if we don't
 * check the user can end up in a limbo where it looks like they're logged in,
 * but nothing works.
 */
class LogoutExpiredTokensSubscriber implements EventSubscriberInterface {

  use AutowireTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected AccountInterface $currentUser,
    protected UserTokens $userTokens,
    protected TimeInterface $dateTime,
    protected User $user,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    $events = [];

    $events[KernelEvents::REQUEST][] = ['logoutExpired', 100];

    return $events;
  }

  /**
   * Log out the user if the token has expired.
   */
  public function logoutExpired(RequestEvent $event): void {
    if (!$this->currentUser->isAuthenticated()) {
      return;
    }

    $token = $this->userTokens->getCurrent();

    if (!$token) {
      return;
    }

    if ($token->expire <= $this->dateTime->getRequestTime()) {
      $this->user->logout();
    }
  }

}
