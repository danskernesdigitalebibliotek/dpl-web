<?php

declare(strict_types=1);

namespace Drupal\media_twentythree;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\media\OEmbed\Provider;
use Drupal\media\OEmbed\ProviderRepositoryInterface;

/**
 * Drupal Core oEmbed provider repository decorator which adds TwentyThree.
 *
 * TwentyThree is a whitelabel platform served from a custom domain per
 * customer, so it is not on the official list of oEmbed providers. Instead we
 * build the provider from the host names configured in
 * media_twentythree.settings, with an endpoint for each.
 */
final class ProviderRepositoryDecorator implements ProviderRepositoryInterface {

  // This name must match the value exposed from the TwentyThree oEmbed
  // endpoint under "provider_name".
  const TWENTY_THREE_PROVIDER_NAME = "TwentyThree";

  /**
   * Constructs a ProviderRepositoryDecorator object.
   */
  public function __construct(
    private ProviderRepositoryInterface $mediaOembedProviderRepository,
    private ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * {@inheritDoc}
   */
  public function getAll(): array {
    $providers = $this->mediaOembedProviderRepository->getAll();
    $provider = $this->getProvider();
    if ($provider) {
      $providers[self::TWENTY_THREE_PROVIDER_NAME] = $provider;
    }
    return $providers;
  }

  /**
   * {@inheritDoc}
   */
  public function get($provider_name): Provider {
    if ($provider_name == self::TWENTY_THREE_PROVIDER_NAME) {
      $provider = $this->getProvider();
      if ($provider) {
        return $provider;
      }
    }
    return $this->mediaOembedProviderRepository->get($provider_name);
  }

  /**
   * Build an oEmbed provider for TwentyThree.
   *
   * @return \Drupal\media\OEmbed\Provider|null
   *   The provider, or NULL if no hosts are configured, as a provider must
   *   have at least one endpoint.
   */
  private function getProvider(): ?Provider {
    /** @var string[] $hosts */
    $hosts = $this->configFactory->get('media_twentythree.settings')->get('allowed_hosts') ?? [];
    if (!$hosts) {
      return NULL;
    }

    // Every TwentyThree site serves its oEmbed endpoint at /oembed, and the
    // endpoint handles all its URLs (videos, channels and tags).
    // @see https://www.twentythree.com/help/manage-oembed
    $endpoints = array_map(fn (string $host) => [
      'url' => "https://{$host}/oembed",
      'schemes' => [
        "https://{$host}/*",
        "http://{$host}/*",
      ],
      'formats' => ['json'],
      'discovery' => TRUE,
    ], $hosts);

    return new Provider(
      self::TWENTY_THREE_PROVIDER_NAME,
      "https://www.twentythree.com/",
      $endpoints,
    );
  }

}
