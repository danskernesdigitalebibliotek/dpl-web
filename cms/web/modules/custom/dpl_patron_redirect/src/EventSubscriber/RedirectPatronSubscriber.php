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
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\UserTokens;
use Drupal\openid_connect\OpenIDConnectSession;
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
   * @param \Drupal\openid_connect\OpenIDConnectSession $session
   *   OpenID Connect session.
   * @param \Drupal\dpl_login\UserTokens $userTokens
   *   The user tokens of the current user.
   */
  public function __construct(
    private AliasManagerInterface $aliasManager,
    private PathMatcherInterface $pathMatcher,
    private CurrentPathStack $currentPath,
    ConfigFactoryInterface $configFactory,
    private AccountProxyInterface $account,
    private KillSwitch $killSwitch,
    private OpenIDConnectSession $session,
    private UserTokens $userTokens,
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
      $path = $this->getPatronPagePath();
      if ($path === NULL) {
        return;
      }

      // Set redirect Url after login. If you use the $request->getSession()
      // object this trick simply do not work and the redirect after login is
      // ignored.
      $this->session->saveTargetLinkUri($path);

      // Response built from the TrustedRedirectResponse class is not cached.
      // But the problem here is the page cache for anonymous requests, which
      // caches all responses, even redirects and no matter if they are
      // cacheable or not. This will kill that cache.
      $this->killSwitch->trigger();

      $this->redirectTo($event, 'dpl_login.login');
      return;
    }

    // Unilogin students are logged in to Drupal, but they are not patrons, so
    // the patron pages are of no use to them. Sending them to login would log
    // them out and, through single sign-on, straight back in, so send them to
    // the front page instead.
    if ($this->userTokens->getCurrent()?->type === AccessTokenType::UniloginUser
      && $this->getPatronPagePath() !== NULL) {
      $this->redirectTo($event, '<front>');
    }
  }

  /**
   * Get the current path, if it is one of the configured patron pages.
   *
   * @return string|null
   *   The current path, or NULL if it is not a patron page.
   */
  protected function getPatronPagePath(): ?string {
    $pages = mb_strtolower((string) $this->configuration->get('pages'));
    if (!$pages) {
      return NULL;
    }

    $path = $this->currentPath->getPath();
    $path = $path === '/' ? $path : rtrim($path, '/');
    $path_alias = mb_strtolower($this->aliasManager->getAliasByPath($path));
    $isPatronPage = $this->pathMatcher->matchPath($path_alias, $pages) || (($path != $path_alias) && $this->pathMatcher->matchPath($path, $pages));

    return $isPatronPage ? $path : NULL;
  }

  /**
   * Redirect the request to a route.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   Core http request event object.
   * @param string $route
   *   The route to redirect to.
   */
  protected function redirectTo(RequestEvent $event, string $route): void {
    /** @var \Drupal\Core\GeneratedUrl $url */
    $url = Url::fromRoute($route)->toString(TRUE);
    $event->setResponse(new TrustedRedirectResponse($url->getGeneratedUrl(), 307));
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
