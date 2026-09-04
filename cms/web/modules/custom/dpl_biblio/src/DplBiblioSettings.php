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
   * Configuration the WeDoBooks SDK needs to run the reader and the player.
   *
   * Read from the environment, not Drupal config: WeDoBooks provisions one
   * set per environment for the whole platform, never per library, so no
   * library may see or edit it. NULL unless every value is set - the SDK
   * cannot start on a partial configuration, so React gets nothing rather
   * than blanks.
   *
   * @return array<string, string>|null
   *   The SDK configuration, keyed as the React apps expect it.
   */
  public function getSdkConfig(): ?array {
    $values = [
      'wedobooks-application-id' => (string) getenv('WEDOBOOKS_APPLICATION_ID'),
      'wedobooks-firebase-api-key' => (string) getenv('WEDOBOOKS_FIREBASE_API_KEY'),
      'wedobooks-firebase-project-id' => (string) getenv('WEDOBOOKS_FIREBASE_PROJECT_ID'),
      'wedobooks-firebase-app-id' => (string) getenv('WEDOBOOKS_FIREBASE_APP_ID'),
      'wedobooks-reader-api-key' => (string) getenv('WEDOBOOKS_READER_API_KEY'),
    ];

    return in_array('', $values, TRUE) ? NULL : $values;
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

  /**
   * TEMPORARY: whether unknown materials render as unavailable, not as errors.
   *
   * The catalogue lists digital materials WeDoBooks has not provisioned yet,
   * and the adapter answers 404 for those. Remove together with the flag once
   * the two agree on which materials exist.
   */
  public function shouldTolerateUnknownMaterials(): bool {
    return (bool) $this->loadConfig()->get('tolerate_unknown_materials');
  }

}
