<?php

namespace Drupal\dpl_patron_reg\EventSubscriber;

use Drupal\Core\Path\CurrentPathStack;
use Drupal\Core\Path\PathMatcherInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Url;
use Drupal\dpl_patron_reg\DplPatronRegSettings;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Event subscriber subscribing to KernelEvents::REQUEST.
 */
class DplPatronRegEventSubscriber implements EventSubscriberInterface {

  /**
   * Default constructor.
   *
   * @param \Drupal\Core\Session\AccountProxyInterface $account
   *   Current user account.
   * @param \Drupal\path_alias\AliasManagerInterface $aliasManager
   *   Core path alias manager.
   * @param \Drupal\Core\Path\CurrentPathStack $currentPath
   *   Current path stack.
   * @param \Drupal\Core\Path\PathMatcherInterface $pathMatcher
   *   Core path manager.
   * @param \Drupal\dpl_patron_reg\DplPatronRegSettings $patronRegSettings
   *   Patron registration settings.
   */
  public function __construct(
    private readonly AccountProxyInterface $account,
    private readonly AliasManagerInterface $aliasManager,
    private readonly CurrentPathStack $currentPath,
    private readonly PathMatcherInterface $pathMatcher,
    private readonly DplPatronRegSettings $patronRegSettings,
  ) {
  }

  /**
   * Redirects the user to the profile page if they are already logged in.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The request event.
   */
  public function dplPatronRegCheckUserRole(RequestEvent $event): void {

    $page = $this->patronRegSettings->getPatronRegistrationPageUrl();
    $path = $this->currentPath->getPath();
    $path = $path === '/' ? $path : rtrim($path, '/');
    $path_alias = mb_strtolower($this->aliasManager->getAliasByPath($path));
    $shouldRedirect = $this->pathMatcher->matchPath($path_alias, $page) || (($path != $path_alias) && $this->pathMatcher->matchPath($path, $page));

    if ($shouldRedirect && !$this->account->isAnonymous()) {
      /** @var \Drupal\Core\GeneratedUrl $url */
      $url = Url::fromRoute('dpl_patron_page.profile')->toString(TRUE);
      $response = new TrustedRedirectResponse($url->getGeneratedUrl());
      $event->setResponse($response);
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    $events[KernelEvents::REQUEST][] = ['dplPatronRegCheckUserRole'];
    return $events;
  }

}
