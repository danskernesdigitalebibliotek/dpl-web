<?php

namespace Console\App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;

/**
 * This a command to be used with console.
 * It takes care of constructing a url for downloading dpl-react assets from Github.
 */
class ConstructDplReactAssetsUrlCommand extends Command {

  /**
   * Implements Command::confgure().
   */
  protected function configure() {
    $this->setName('construct-assets-url')
      ->setDescription('Constructs assets url depending on given branch name')
      ->setHelp('Specify branch name and optional arguments and a full url to the github assets will be returned.')
      ->addArgument('branch', InputArgument::REQUIRED, 'Specify branch name.')
      ->addOption('release-prefix', NULL, InputArgument::OPTIONAL, 'Specify release prefix (eg.: release-).', 'release-')
      ->addOption('github-url', NULL, InputArgument::OPTIONAL, 'The beginning of the Github url', 'https://github.com/danskernesdigitalebibliotek/dpl-react/releases/download')
      ->addOption('filename', NULL, InputArgument::OPTIONAL, 'The file name in the end of the url', 'dist.zip');
  }

 /**
   * Implements Command::execute().
   */
  protected function execute(InputInterface $input, OutputInterface $output) {
    $urlFragments = [
      $input->getOption('github-url'),
      $input->getOption('release-prefix') . urlencode($input->getArgument('branch')),
      $input->getOption('filename'),
    ];

    $output->writeln(implode('/', $urlFragments));
    return 1;
  }

}
