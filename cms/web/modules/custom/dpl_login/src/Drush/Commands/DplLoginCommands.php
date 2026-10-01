<?php

namespace Drupal\dpl_login\Drush\Commands;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\KeyValueStore\KeyValueExpirableFactory;
use Drupal\dpl_login\RegisteredUserTokensProvider;
use Drupal\dpl_login\UnregisteredUserTokensProvider;
use Drush\Attributes\Command;
use Drush\Attributes\Argument;
use Drush\Attributes\Usage;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Safe\DateTimeImmutable;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * A Drush commandfile.
 */
class DplLoginCommands extends DrushCommands {
  use AutowireTrait;

  /**
   * Constructs a DplLoginCommands object.
   */
  public function __construct(
    #[Autowire(service: 'keyvalue.expirable')]
    private KeyValueExpirableFactory $storageFactory,
    private TimeInterface $datetime,
  ) {
    parent::__construct();
  }

  /**
   * Forcefully expire a user token.
   *
   * Covers both the registered and the unregistered user token, as a user can
   * hold either - and UserTokens::getCurrent() prefers the unregistered one,
   * so leaving it alone would keep handing out a live token.
   *
   * Only alters Drupal idea of when the token expires, it doesn't change the
   * token at adgangsplatformen.
   *
   * Primarily for testing.
   */
  #[Command(name: 'dpl_login:token-expire')]
  #[Argument(name: 'uid', description: 'User uid.')]
  #[Usage(name: 'dpl_login:token-expire 10', description: 'Expire tokens for user 10.')]
  public function token(string $uid): void {
    $providers = [
      'Unregistered user token' => UnregisteredUserTokensProvider::class,
      'Registered user token' => RegisteredUserTokensProvider::class,
    ];

    $expired = FALSE;
    foreach ($providers as $label => $provider) {
      $expired = $this->expireToken($provider, $uid, $label) || $expired;
    }

    if (!$expired) {
      $this->io()->error(dt('Could not find any tokens for user.'));
    }
  }

  /**
   * Expire the token held by a single token provider, if there is one.
   *
   * @param string $provider
   *   Class name of the token provider owning the temp store.
   * @param string $uid
   *   User uid.
   * @param string $label
   *   Human readable name of the token, for the command output.
   *
   * @return bool
   *   TRUE if a token was found and expired.
   */
  protected function expireToken(string $provider, string $uid, string $label): bool {
    // As the tokens are stored in private temp store, we have to dig it out
    // ourselves.
    $collection = 'tempstore.private.' . $provider;
    $key = $uid . ':access_token';
    $token = $this->storageFactory->get($collection)->get($key);

    if (!$token) {
      return FALSE;
    }

    $expire = new DateTimeImmutable('@' . $token->data->expire);
    $this->io()->info($label . ' - existing expire: ' . $expire->format('c'));

    $newExpire = new DateTimeImmutable('@' . $this->datetime->getCurrentTime());

    $this->io()->info($label . ' - new expire: ' . $newExpire->format('c'));

    $token->data->expire = $newExpire->getTimestamp();

    $this->storageFactory->get($collection)->set($key, $token);

    return TRUE;
  }

}
