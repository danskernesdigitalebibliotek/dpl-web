<?php

declare(strict_types=1);

namespace Drupal\bnf_example_content\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Psr\Log\LoggerInterface;

/**
 * Module install hooks.
 */
class ModuleHooks {

  public function __construct(
    protected LoggerInterface $logger,
    protected ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * Set front page when module is installed.
   *
   * @param string[] $modules
   *   The names of the modules that were installed.
   */
  #[Hook('modules_installed')]
  public function modulesInstalled(array $modules): void {
    // Only react to our own installation.
    if (!in_array('bnf_example_content', $modules)) {
      return;
    }

    // Set page.front link to /delingstjenesten, our front page stand-in.
    $configSite = $this->configFactory->getEditable('system.site');
    $frontPage = '/delingstjenesten';
    $configSite->set('page.front', $frontPage)->save();

    $this->logger->info("Update frontpage link to {$frontPage}, as part of Delingstjenesten dev content installation.");
  }

}
