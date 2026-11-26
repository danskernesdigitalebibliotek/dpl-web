<?php

declare(strict_types=1);

namespace Drupal\dpl_react\Hook;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use function Safe\file_get_contents;

/**
 * Library hooks for dpl_react module.
 */
class LibraryHooks {

  public function __construct(
    protected LoggerChannelFactoryInterface $loggerFactory,
  ) {}

  /**
   * Set the version of the React app libraries from the dpl-react build.
   *
   * @param mixed[] $libraries
   *   An associative array of libraries registered by $extension.
   * @param string $extension
   *   Can either be 'core' or the machine name of the extension
   *   that registered the libraries.
   */
  #[Hook('library_info_alter')]
  public function setLibraryVersion(array &$libraries, string $extension): void {
    $library_info = NULL;
    if ($extension != 'dpl_react') {
      return;
    }

    $version_file = 'libraries/dpl-react/version.json';

    if (!file_exists($version_file)) {
      $this->loggerFactory->get('dpl_react')
        ->error('Version file in libraries/dpl-react is missing!');
      return;
    }

    // Check if a version json file exists and decode the json configuration.
    if ($library_info_json = file_get_contents($version_file)) {
      $library_info = Json::decode($library_info_json);
    }
    if (!$library_info || !isset($library_info['version'])) {
      return;
    }

    // Set the version from the assets on all libraries.
    foreach (array_keys($libraries) as $library) {
      $libraries[$library]['version'] = $library_info['version'];
    }
  }

}
