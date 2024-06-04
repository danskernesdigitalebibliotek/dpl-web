<?php

namespace Drupal\dpl_patron_redirect\EventSubscriber;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\Core\Path\CurrentPathStack;
use Drupal\Core\Path\PathMatcherInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Url;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Event subscriber subscribing to KernelEvents::REQUEST.
 */
class RedirectPatronSubscriber implements EventSubscriberInterface {

  /**
   * Module configuration.
   *
   * @var \Drupal\Core\Config\ImmutableConfig
   */
  private ImmutableConfig $configuration;

  /**
   * Default constructor.
   *
   * @param \Drupal\path_alias\AliasManagerInterface $aliasManager
   *   Core path alias manager.
   * @param \Drupal\Core\Path\PathMatcherInterface $pathMatcher
   *   Core path manager.
   * @param \Drupal\Core\Path\CurrentPathStack $currentPath
   *   Current path stack.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Core configuration factory.
   * @param \Drupal\Core\Session\AccountProxyInterface $account
   *   Current user account.
   * @param \Drupal\Core\PageCache\ResponsePolicy\KillSwitch $killSwitch
   *   Page cache kill switch to disable cache for these redirects.
   */
  public function __construct(
    private AliasManagerInterface $aliasManager,
    private PathMatcherInterface $pathMatcher,
    private CurrentPathStack $currentPath,
    ConfigFactoryInterface $configFactory,
    private AccountProxyInterface $account,
    private KillSwitch $killSwitch
  ) {
    $this->configuration = $configFactory->get('dpl_patron_redirect.settings');
  }

  /**
   * Check if user is logged in on configured path and redirect if needed.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   Core http request event object.
   */
  public function checkAuthStatus(RequestEvent $event): void {

    if ($this->account->isAnonymous()) {
      $pages = mb_strtolower($this->configuration->get('pages'));
      if (!$pages) {
        return;
      }

      $path = $this->currentPath->getPath();
      $path = $path === '/' ? $path : rtrim($path, '/');
      $path_alias = mb_strtolower($this->aliasManager->getAliasByPath($path));
      $shouldRedirect = $this->pathMatcher->matchPath($path_alias, $pages) || (($path != $path_alias) && $this->pathMatcher->matchPath($path, $pages));

      if ($shouldRedirect) {
        // Set redirect Url after login. If you use the $request->getSession()
        // object this trick simply do not work and the redirect after login is
        // ignored.
        $_SESSION['openid_connect_destination'] = $path;

        // Response built from the ThrustedRedirectReponse class is not cached.
        // But the problem here is the page cache for anonymous requests, which
        // caches all responses, even redirects and no matter if they are
        // cacheable or not. This will kill that cache.
        $this->killSwitch->trigger();

        /** @var \Drupal\Core\GeneratedUrl $url */
        $url = Url::fromRoute('dpl_login.login')->toString(TRUE);
        $response = new TrustedRedirectResponse($url->getGeneratedUrl(), 307);
        $event->setResponse($response);
      }
    }
  }

  /**
   * {@inheritdoc}
   *
   * @return mixed[]
   *   The event function to call for this subscriber.
   */
  public static function getSubscribedEvents(): array {
    $events[KernelEvents::REQUEST][] = ['checkAuthStatus'];
    return $events;
  }

}
