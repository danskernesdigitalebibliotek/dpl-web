<?php

namespace Drupal\dpl_cms\Commands;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleInstallerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drush\Commands\DrushCommands;

/**
 * A Drush commandfile.
 */
class DplCmsCommands extends DrushCommands {
  use StringTranslationTrait;

  /**
   * Class constructor.
   */
  public function __construct(
    protected ConfigFactoryInterface $configFactory,
    private ModuleInstallerInterface $moduleInstaller,
  ) {}

  /**
   * Create static content on site.
   *
   * @command dpl_cms:create-static-content
   * @usage drush dpl_cms:create-static-content
   *   Creates static content on site if has not been created already.
   */
  public function createStaticContent() {
    $config = $this->configFactory->getEditable('dpl_cms.settings');
    $conf_key = 'static_pages_created';
    $static_content_module = 'dpl_static_content';

    if ($config->get($conf_key)) {
      $this->io()->warning($this->t('Leaving... Static pages have already been created.'));
      return;
    }

    try {
      $this->moduleInstaller->install([$static_content_module]);
    }
    catch (\Exception $e) {
      $this->io()->error($this->t('Could not install the module @module: @error', [
        '@module' => $static_content_module,
        '@error' => $e->getMessage(),
      ]));
      $config->set($conf_key, TRUE)->save();
      return;
    }

    $config->set($conf_key, TRUE)->save();
    $this->io()->success($this->t('Static pages were sucessfully created. 🎉'));
  }

}
