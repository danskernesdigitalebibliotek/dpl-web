<?php

declare(strict_types=1);

namespace Drupal\dpl_cookies\Hook;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\cookieinformation\VisibilityService;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Theme hooks for dpl_cookies module.
 */
class ThemeHooks {

  public function __construct(
    #[Autowire(service: 'cookieinformation.visibility_service')]
    protected VisibilityService $visibilityService,
    protected ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * Adds cookie consent attributes to media video fields.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_field__media__video')]
  public function addCookieConsentToMediaVideoFields(array &$variables): void {
    foreach ($variables['items'] as &$item) {
      if (isset($item['content']['#attributes']['src'])) {
        $this->deferUntilConsent($item['content']['#attributes'], $item['content']);
      }
    }
  }

  /**
   * Adds cookie consent attributes to VideoTool iframes.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_media_videotool_iframe')]
  public function addCookieConsentToVideoToolIframe(array &$variables): void {
    if (isset($variables['attributes']['src'])) {
      $this->deferUntilConsent($variables['attributes'], $variables);
    }
  }

  /**
   * Defers loading an iframe until the user has consented to marketing cookies.
   *
   * The iframe source is moved to data-consent-src, and the Cookie Information
   * script moves it back once the user has consented. Where that script is not
   * added to the page (popup disabled, administrators, admin routes, excluded
   * paths) nothing would ever move it back, so the iframe is left alone.
   *
   * @param array<string, mixed> $attributes
   *   The attributes of the iframe, including src.
   * @param array<mixed> $cacheable
   *   The render array, or preprocess variables, that the cacheability of the
   *   decision is added to.
   */
  protected function deferUntilConsent(array &$attributes, array &$cacheable): void {
    $this->consentScriptCacheability()
      ->merge(CacheableMetadata::createFromRenderArray($cacheable))
      ->applyTo($cacheable);

    if (!$this->visibilityService->checkAll()) {
      return;
    }

    $attributes['data-once'] = 'cookieinformation-iframe';
    $attributes['data-category-consent'] = 'cookie_cat_marketing';
    $attributes['data-consent-src'] = $attributes['src'];
    $attributes['src'] = '';
  }

  /**
   * Cacheability of whether the Cookie Information script is on the page.
   *
   * Mirrors the checks in VisibilityService::checkAll(). It is worth
   * considering upstreaming this to VisibilityService, next to the checks it
   * has to be kept in sync with.
   */
  protected function consentScriptCacheability(): CacheableMetadata {
    $config = $this->configFactory->get('cookieinformation.settings');

    $cacheability = CacheableMetadata::createFromObject($config)
      ->addCacheContexts(['user.permissions', 'user.is_super_user']);

    if ($config->get('exclude_admin')) {
      // Whether a route is an admin route is a property of the route, so the
      // route name is enough.
      $cacheability->addCacheContexts(['route.name']);
    }

    if ($config->get('exclude_paths')) {
      $cacheability->addCacheContexts(['url.path']);
    }

    return $cacheability;
  }

}
