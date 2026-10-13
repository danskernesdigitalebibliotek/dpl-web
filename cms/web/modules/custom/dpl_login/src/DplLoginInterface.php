<?php

namespace Drupal\dpl_login;

/**
 * Interface for dpl_login constants.
 */
interface DplLoginInterface {

  const ROLE_PATRON = 'patron';
  const ROLE_UNILOGIN_PATRON = 'unilogin_patron';
  const LOGGER_KEY = 'dpl_login';
  const LOGGER_KEY_UNREGISTERED_USER = 'dpl_login.unregistered_user';
  const PLUGIN_ID_ADGANGSPLATFORMEN = 'adgangsplatformen';

}
