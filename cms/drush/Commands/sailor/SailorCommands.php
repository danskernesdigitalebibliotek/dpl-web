<?php

declare(strict_types=1);

namespace Drush\Commands\sailor;

use Drush\Attributes as Cli;
use Drush\Commands\DrushCommands;
use Spawnia\Sailor\Console\IntrospectCommand;
use Spawnia\Sailor\Console\CodegenCommand;
use Symfony\Component\Console\Input\ArrayInput;

/**
 * Drush commands for running Sailor.
 */
class SailorCommands extends DrushCommands {

  /**
   * Run sailor inspect.
   */
  #[Cli\Command(name: 'sailor:introspect')]
  public function introspect(): void {
    $introspect = new IntrospectCommand();

    $input = new ArrayInput([]);
    $introspect->run($input, $this->output());
  }

  /**
   * Run sailor codegen.
   */
  #[Cli\Command(name: 'sailor:codegen')]
  public function codegen(): void {
    $introspect = new CodegenCommand();

    $input = new ArrayInput([]);
    $introspect->run($input, $this->output());
  }

}
