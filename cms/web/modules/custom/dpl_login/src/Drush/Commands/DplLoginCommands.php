<?php

namespace Drupal\dpl_login\Drush\Commands;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\KeyValueStore\KeyValueExpirableFactory;
use Drupal\dpl_login\RegisteredUserTokensProvider;
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
   * Forcefully expire a user library token.
   *
   * Only alters Drupal idea of when the token expires, it doesn't change the
   * token at adgangsplatformen.
   *
   * Primarily for testing.
   */
  #[Command(name: 'dpl_login:token-expire')]
  #[Argument(name: 'uid', description: 'User uid.')]
  #[Usage(name: 'dpl_login:token-expire 10', description: 'Expire token for user 10.')]
  public function token(string $uid): void {
    // As the tokens are stored in private temp store, we have to dig it out
    // ourselves.
    $collection = 'tempstore.private.' . RegisteredUserTokensProvider::class;
    $key = $uid . ':access_token';
    $token = $this->storageFactory->get($collection)->get($key);

    if (!$token) {
      $this->io()->error(dt('Could not find token for user.'));
      return;
    }

    $expire = new DateTimeImmutable('@' . $token->data->expire);
    $this->io()->info('Existing expire: ' . $expire->format('c'));

    $newExpire = new DateTimeImmutable('@' . $this->datetime->getCurrentTime());

    $this->io()->info('New expire: ' . $newExpire->format('c'));

    $token->data->expire = $newExpire->getTimestamp();

    $this->storageFactory->get($collection)->set($key, $token);
  }

}
