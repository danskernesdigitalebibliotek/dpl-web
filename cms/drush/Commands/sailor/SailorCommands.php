<?php

declare(strict_types=1);

namespace Drush\Commands\sailor;

use Consolidation\AnnotatedCommand\CommandData;
use Consolidation\AnnotatedCommand\Hooks\HookManager;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drush\Attributes as Cli;
use Drush\Boot\DrupalBootLevels;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Spawnia\Sailor\Console\IntrospectCommand;
use Spawnia\Sailor\Console\CodegenCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\Input;
use Symfony\Component\Console\Input\ArrayInput;
use function Safe\chdir;
use function Safe\getcwd;

/**
 * Drush commands for running Sailor.
 */
class SailorCommands extends DrushCommands {

  use AutowireTrait;

  public function __construct(protected ModuleHandlerInterface $moduleHandler) {
  }

  /**
   * Validate that the module exists.
   */
  #[Cli\Hook(type: HookManager::ARGUMENT_VALIDATOR)]
  public function validate(CommandData $commandData): void {
    // `getModule()` will throw on unknown modules.
    $this->moduleHandler->getModule($commandData->input()->getArgument('module'));
  }

  /**
   * Run sailor inspect.
   */
  #[Cli\Command(name: 'sailor:introspect')]
  #[Cli\Argument(name: 'module', description: 'Name of module to run introspection on.')]
  #[Cli\Bootstrap(level: DrupalBootLevels::FULL)]
  public function introspect(string $module): void {
    $this->runInModuleDir($module, new IntrospectCommand(), new ArrayInput([]));
  }

  /**
   * Run sailor codegen.
   */
  #[Cli\Command(name: 'sailor:codegen')]
  #[Cli\Argument(name: 'module', description: 'Name of module to run codegen on.')]
  public function codegen(string $module): void {
    $this->runInModuleDir($module, new CodegenCommand(), new ArrayInput([]));
  }

  /**
   * Run command with module directory as current directory.
   */
  protected function runInModuleDir(string $module, Command $command, Input $input): void {
    $origDir = getcwd();
    chdir($this->moduleHandler->getModule($module)->getPath());
    $command->run($input, $this->output());

    chdir($origDir);
  }

}
