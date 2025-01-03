<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for DPL consumers.
 */
final class DplConsumersCommands extends DrushCommands {

  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * Constructor.
   */
  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct();
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * Function is used for setting the consumer secret.
   *
   * The secret is stored as an environment variable.
   * This command makes sure it is transferred to the database.
   *
   * @param string $client_id
   *   Client id of the consumer.
   *
   * @command dpl_consumers:set-consumer-secret
   * @aliases dpl-scs
   * @usage dpl_consumers:set-consumer-secret [client_id of the consumer]
   *
   * @throws \Exception
   */
  public function setConsumerSecret(string $client_id): string {
    $consumers = $this->getConsumers($client_id);
    try {

      $consumer = $consumers[$client_id];
      if (!$consumer) {
        throw new \Exception('Could not find consumer.');
      }
      if (!$consumer->secret) {
        throw new \Exception('Consumer secret not found.');
      }
      if (!$consumer_entity = $consumer->load()) {
        throw new \Exception('Could not load consumer entity.');
      }
      $consumer_entity->save();
      return 'Consumer secret set successfully.';
    }
    catch (\Exception $e) {
      throw new \Exception($e->getMessage());
    }
  }

  /**
   * Function is used for printing out the consumer credentials to the console.
   *
   * @param string $client_id
   *   Client id of the consumer.
   *
   * @command dpl_consumers:consumer-credentials
   * @aliases dpl-gcc
   * @usage dpl_consumers:consumer-credentials [client_id of the consumer]
   *
   * @throws \Exception
   */
  public function getConsumerCredentials(string $client_id): void {
    $consumers = $this->getConsumers($client_id);
    $consumer = $consumers[$client_id];
    $this->output()->writeln(sprintf('Consumer UUID: %s', $consumer->uuid));
  }

  /**
   * Get consumers.
   *
   * @param string $client_id
   *   Client id of the consumer.
   *
   * @return mixed[]
   *   An array of consumer keyed by client id.
   *
   * @throws \Exception
   */
  protected function getConsumers(string $client_id): array {
    $consumers = dpl_consumers_get_known_consumers();
    if (!in_array($client_id, array_keys($consumers), TRUE)) {
      throw new \Exception(sprintf('GraphQL consumer %s is not known.', $client_id));
    }

    return $consumers;
  }

}
