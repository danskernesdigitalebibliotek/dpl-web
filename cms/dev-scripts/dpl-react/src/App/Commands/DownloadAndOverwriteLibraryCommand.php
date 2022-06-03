<?php

namespace Console\App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;

/**
 * This a command to be used with console.
 * It downloads dpl-react assets from Github and replaces the dpl-react library with that.
 */
class DownloadAndOverwriteLibraryCommand extends Command {

  /**
   * Implements Command::configure().
   */
  protected function configure() {
    $this->setName('download-and-overwrite-library')
      ->setDescription('Downloads the DPL React library and replaces existing library')
      ->setHelp('Specify the download link (Github assets url).')
      ->addArgument('download-link', InputArgument::REQUIRED, 'Github assets url')
      ->addOption('library-path', NULL, InputArgument::OPTIONAL, 'Specify the relative path to the library', 'web/libraries/dpl-react');
  }

  /**
   * Implements Command::execute().
   */
  protected function execute(InputInterface $input, OutputInterface $output) {
    $zipFile = "dist.zip";
    $zipResource = fopen($zipFile, "w");
    $curlHandle = curl_init();
    $libraryPath = $input->getOption('library-path');

    // If we do not have the library directory for some reason make sure that it is there.
    if (!is_dir($libraryPath)) {
      mkdir($libraryPath, 0777, TRUE);
    }

    curl_setopt_array($curlHandle, [
      CURLOPT_URL => $input->getArgument('download-link'),
      CURLOPT_FAILONERROR => TRUE,
      CURLOPT_HEADER => 0,
      CURLOPT_FOLLOWLOCATION => TRUE,
      CURLOPT_AUTOREFERER => TRUE,
      CURLOPT_TIMEOUT => 10,
      CURLOPT_SSL_VERIFYHOST => 0,
      CURLOPT_SSL_VERIFYPEER => 0,
      CURLOPT_FILE => $zipResource
    ]);

    if (!$page = curl_exec($curlHandle)) {
      curl_close($curlHandle);
      throw Exception(sprintf("%s", curl_error($curlHandle)));
    }

    curl_close($curlHandle);

    $zip = new \ZipArchive();
    if (!$zip->open($zipFile)) {
      throw Exception("Unable to open the Zip File");
    }

    $zip->extractTo($libraryPath);
    $zip->close();

    unlink($zipFile);
    return 0;
  }

}
