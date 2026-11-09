<?php

namespace Drupal\media_twentythree;

use Drupal\Component\Utility\Html;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\media\OEmbed\UrlResolver;
use Psr\Http\Client\ClientExceptionInterface;
use Safe\Exceptions\UrlException;
use function Safe\parse_url;

/**
 * Url resolver with support for public discovery of resource urls.
 *
 * Replaces the class of the core media.oembed.url_resolver service, as core
 * calls discoverResourceUrl() on itself when no provider matches a URL.
 *
 * @see \Drupal\media_twentythree\MediaTwentythreeServiceProvider
 */
class DiscoveryUrlResolver extends UrlResolver {

  /**
   * The config factory.
   */
  protected ConfigFactoryInterface $configFactory;

  /**
   * Sets the config factory.
   *
   * Setter injection keeps us independent of the arguments of the core
   * constructor.
   */
  public function setConfigFactory(ConfigFactoryInterface $config_factory): void {
    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritDoc}
   *
   * Core only runs discovery for hosts matching the
   * media_oembed_discovery_trusted_host_patterns setting. TwentyThree is
   * served from a custom domain per customer, so libraries configure their
   * hosts in media_twentythree.settings instead, and we run discovery for
   * those ourselves. Everything else is left to core.
   */
  public function discoverResourceUrl($url) {
    try {
      $host = parse_url($url, PHP_URL_HOST);
    }
    catch (UrlException) {
      $host = NULL;
    }

    if (!is_string($host) || !in_array(mb_strtolower($host), $this->allowedHosts(), TRUE)) {
      return parent::discoverResourceUrl($url);
    }

    // The rest mirrors the parent implementation.
    try {
      $response = $this->httpClient->get($url);
    }
    catch (ClientExceptionInterface) {
      return FALSE;
    }

    // Only care about HTML responses.
    $response_type = strtolower($response->getHeaderLine('Content-Type'));
    if (!str_contains($response_type, 'text/html')) {
      return FALSE;
    }

    $document = Html::load((string) $response->getBody());
    $xpath = new \DOMXPath($document);

    $resource_url = $this->findUrl($xpath, 'json') ?: $this->findUrl($xpath, 'xml');

    // findUrl() is documented as returning bool|string, though it never
    // returns TRUE.
    return is_string($resource_url) ? $resource_url : FALSE;
  }

  /**
   * The hosts TwentyThree videos may be discovered from.
   *
   * @return string[]
   *   Lower case host names.
   */
  protected function allowedHosts(): array {
    return $this->configFactory->get('media_twentythree.settings')->get('allowed_hosts') ?? [];
  }

}
