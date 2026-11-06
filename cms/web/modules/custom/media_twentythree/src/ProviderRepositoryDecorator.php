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
          // TwentyThree runs on each customer's own domain, so the domains in
          // use have to be listed here.
          'url' => 'https://video.kk.dk/oembed',
          'schemes' => [
            'https://video.kk.dk/*',
            'https://www.video.kk.dk/*',
            'http://video.kk.dk/*',
            'http://www.video.kk.dk/*',
          ],
        ],
      ]
    );
  }

}
