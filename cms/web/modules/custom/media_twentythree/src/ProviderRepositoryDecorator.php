<?php

declare(strict_types=1);

namespace Drupal\media_twentythree;

use Drupal\media\OEmbed\Provider;
use Drupal\media\OEmbed\ProviderRepositoryInterface;

/**
 * Drupal Core oEmbed provider repository decorator which adds TwentyThree.
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
  ) {}

  /**
   * {@inheritDoc}
   */
  public function getAll(): array {
    $providers = $this->mediaOembedProviderRepository->getAll();
    $providers[self::TWENTY_THREE_PROVIDER_NAME] = $this->getProvider();
    return $providers;
  }

  /**
   * {@inheritDoc}
   */
  public function get($provider_name): Provider {
    if ($provider_name == self::TWENTY_THREE_PROVIDER_NAME) {
      return $this->getProvider();
    }
    return $this->mediaOembedProviderRepository->get($provider_name);
  }

  /**
   * Build an oEmbed provider for TwentyThree.
   */
  private function getProvider(): Provider {
    return new Provider(
      self::TWENTY_THREE_PROVIDER_NAME,
      "https://www.twentythree.com/",
      [
        [
          // oEmbed providers require an endpoint to be defined. Here it is a
          // dummy value as we cannot provide a fixed set of endpoints due to
          // the nature of the TwentyThree product.
          // @see media_twentythree_oembed_resource_url_alter()
          'url' => "https://www.twentythree.com/oembed",
        ],
      ]
    );
  }

}
