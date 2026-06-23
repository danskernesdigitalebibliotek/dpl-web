<?php

namespace Drupal\media_videotool\Drush\Commands;

use Drupal\media_videotool\VideoTool;
use Drush\Attributes\Command;
use Drush\Attributes\Argument;
use Drush\Attributes\Usage;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for VideoTool integration.
 */
class VideoToolCommands extends DrushCommands {
  use AutowireTrait;

  /**
   * Constructs a VideoToolCommands object.
   */
  public function __construct(
    protected VideoTool $videotool,
  ) {
    parent::__construct();
  }

  /**
   * Query the VideoTool API for the streaming URL of a video URL.
   */
  #[Command(name: 'media-videotool:streaming-url')]
  #[Argument(name: 'url', description: 'The VideoTool video URL.')]
  #[Argument(name: 'ttl', description: 'Lifetime of URL.')]
  #[Usage(name: 'drush media-videotool:streaming-url https://media.videotool.dk/?vn=557_2023103014511477700668916683 3600', description: 'Get streaming URL.')]
  public function query(string $url, int $ttl): void {
    $url = $this->videotool->getVideoStreamUrl($url, $ttl);

    if (!$url) {
      $this->io()->error(dt('Failed to fetch streaming URL VideoTool API. Ensure credentials are set and the URL is valid.'));
      return;
    }

    $this->output()->writeln($url);
  }

}
