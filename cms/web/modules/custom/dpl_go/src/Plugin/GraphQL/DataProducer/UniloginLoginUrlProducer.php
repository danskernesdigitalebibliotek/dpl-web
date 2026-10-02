<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\dpl_login\Unilogin;

/**
 * Resolves the Go login url for Unilogin.
 *
 * Unilogin logins go through Adgangsplatformen with Unilogin forced, and land
 * on the same Go login route as other Adgangsplatformen logins.
 *
 * @DataProducer(
 *   id = "go_unilogin_login_url",
 *   name = "Unilogin Url Producer",
 *   description = "Provides the Unilogin login url for Go.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class UniloginLoginUrlProducer extends AdgangsplatformenLoginUrlProducer {

  /**
   * {@inheritdoc}
   */
  protected function getLoginQuery(): array {
    return parent::getLoginQuery() + ['idp' => Unilogin::IDP];
  }

}
