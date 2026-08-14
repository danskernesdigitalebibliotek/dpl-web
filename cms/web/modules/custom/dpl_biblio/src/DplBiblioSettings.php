<?php

namespace Drupal\dpl_biblio;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles Biblio adapter settings.
 */
class DplBiblioSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for Biblio adapter settings.
   */
  public function getConfigKey(): string {
    return 'dpl_biblio.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    $config = $this->loadConfig();

    return [
      'base_url' => $config->get('base_url'),
      'enabled' => (bool) $config->get('enabled'),
    ];
  }

  /**
   * Get the base url of the Biblio adapter.
   */
  public function getBaseUrl(): ?string {
    return $this->loadConfig()->get('base_url');
  }

  /**
   * Whether the Biblio adapter should be used instead of Publizon.
   */
  public function isEnabled(): bool {
    return (bool) $this->loadConfig()->get('enabled');
  }

}
