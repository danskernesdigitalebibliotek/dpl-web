<?php

namespace Drupal\dpl_login;

use Drupal\dpl_login\Adgangsplatformen\Config;

/**
 * Provider for accessing the agency id for the current library organisation.
 *
 * The agency id is also referred to as the ISIL nummber or library number
 * (biblioteksnummer). Example: 710100 is the agency id for the Copenhagen City
 * Libraries.
 *
 * It is sometimes prefixed by a country code e.g. DK-710100 but this should
 * not be the case here.
 *
 * The provider is located within the DPL Login module because with the
 * integration with Adgangsplatformen most of such information should be
 * contained within libary and patron tokens. Some legacy systems might still
 * require this info. This class provides a single point of entry.
 */
class LibraryAgencyIdProvider {

  /**
   * Constructor.
   */
  public function __construct(
    private Config $config
  ) {}

  /**
   * Return the agency id for the current library.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function getAgencyId(): string {
    return $this->config->getAgencyId();
  }

}
