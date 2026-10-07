<?php

declare(strict_types=1);

namespace Drupal\dpl_po\Commands;

use Drupal\dpl_po\Gettext\PoCombiner;
use Drupal\dpl_po\Gettext\PoFile;
use Drupal\dpl_po\Gettext\PoMessage;
use Drush\Attributes\Argument;
use Drush\Attributes\Command;
use Drush\Attributes\Help;
use Drush\Attributes\Usage;
use Drush\Commands\DrushCommands;
use function Safe\file_get_contents;
use function Safe\file_put_contents;

/**
 * Drush command for updating the combined translation file.
 */
class CombineCommands extends DrushCommands {

  /**
   * Class constructor.
   */
  public function __construct(
    protected string $appRoot,
    protected PoCombiner $combiner,
  ) {
    parent::__construct();
  }

  /**
   * Update the combined .po file with the messages of the given .po files.
   *
   * @param string $destination
   *   Path of the combined .po file, relative to the Drupal root. It is read
   *   if it exists and overwritten.
   * @param string[] $sources
   *   Paths of the .po files to combine, relative to the Drupal root. The
   *   result holds exactly their messages; the first file to hold a message
   *   wins.
   */
  #[Command(name: 'dpl_po:combine')]
  #[Help(description: 'Update the combined .po file with the messages of the given .po files, keeping the order it has.')]
  #[Argument(name: 'destination', description: 'Path of the combined .po file, relative to the Drupal root.')]
  #[Argument(name: 'sources', description: 'Paths of the .po files to combine, relative to the Drupal root.')]
  #[Usage(
    name: 'drush dpl_po:combine profiles/dpl_cms/translations/da.combined.po profiles/dpl_cms/translations/da.po profiles/dpl_cms/translations/da.config.po',
    description: 'Bring the combined Danish file up to date with the scanned and the configuration strings.'
  )]
  public function combine(string $destination, array $sources): void {
    if ($sources === []) {
      throw new \RuntimeException('Give at least one .po file to combine.');
    }

    $path = $this->appRoot . '/' . $destination;
    $committed = is_file($path) ? $this->read($destination) : [];

    $scanned = [];
    foreach ($sources as $source) {
      $scanned = [...$scanned, ...$this->read($source)];
    }

    $combined = $this->combiner->combine($committed, $scanned);
    file_put_contents($path, PoFile::render($combined));

    $messages = array_filter($combined, fn (PoMessage $message): bool => !$message->isHeader());
    $this->io()->success(sprintf('Wrote %d messages to %s.', count($messages), $destination));
  }

  /**
   * Read the messages of a .po file.
   *
   * @param string $file
   *   Path of the file, relative to the Drupal root.
   *
   * @return \Drupal\dpl_po\Gettext\PoMessage[]
   *   Its messages.
   */
  protected function read(string $file): array {
    $path = $this->appRoot . '/' . $file;
    if (!is_file($path)) {
      throw new \RuntimeException(sprintf('Cannot read "%s".', $file));
    }
    try {
      return PoFile::parse(file_get_contents($path));
    }
    catch (\RuntimeException $e) {
      throw new \RuntimeException(sprintf('%s: %s', $file, $e->getMessage()), 0, $e);
    }
  }

}
