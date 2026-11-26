<?php

declare(strict_types=1);

namespace Drupal\media_twentythree\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\media_twentythree\ProviderRepositoryDecorator;

/**
 * Media hooks for media_twentythree module.
 */
class MediaHooks {

  public function __construct(
    protected LoggerChannelFactoryInterface $loggerFactory,
  ) {}

  /**
   * Add TwentyThree as a provider for the oEmbed video media source.
   *
   * @param mixed[] $sources
   *   Information about media sources.
   */
  #[Hook('media_source_info_alter')]
  public function addTwentyThreeProvider(array &$sources): void {
    if (empty($sources["oembed:video"])) {
      $this->loggerFactory->get('media_twentythree')->warning('Unable to locate oEmbed video media source');
    }

    // Add TwentyThree to the list of supported providers for the native video
    // media type alongside YouTube and Vimeo.
    $sources["oembed:video"]["providers"][] = ProviderRepositoryDecorator::TWENTY_THREE_PROVIDER_NAME;
  }

}
