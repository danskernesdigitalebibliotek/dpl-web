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
   * Read from the environment, not from Drupal config: the values are one
   * set for the whole platform, provisioned by WeDoBooks per environment
   * (stage/production) - never per library, so they are deliberately not
   * exposed anywhere a library can see or edit them. The browser still needs
   * them, so this is where they enter the page.
   *
   * Returns NULL unless every value is set: the SDK cannot start on a partial
   * configuration, and an environment without the values should fall back
   * rather than hand React something it will fail on.
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
   * TEMPORARY: whether new Publizon reservations are closed in the React apps.
   *
   * Biblio needs a period where the Publizon reservation queue stands still
   * so it can be migrated: a reservation made - or cancelled - after the
   * queue has been copied would be lost. Loans are unaffected, so a library
   * can keep lending through Publizon while its queue is being moved.
   *
   * Scoped to the React apps on purpose. GO freezes in its own period and
   * therefore gets its own flag; remove both once the migration is done.
   */
  public function arePublizonReservationsClosedInReact(): bool {
    return (bool) $this->loadConfig()->get('publizon_reservations_closed_react');
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
