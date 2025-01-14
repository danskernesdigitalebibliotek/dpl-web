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
   * Used for setting the consumer secret and password.
   *
   * The secret and password is stored as environment variables.
   * This command makes sure they are transferred to the database.
   *
   * @param string $clientId
   *   Client id of the consumer.
   *
   * @command dpl_consumers:set-consumer-env-credentials
   * @aliases dpl-scec
   * @usage dpl_consumers:set-consumer-env-credentials [client_id of the consumer]
   *
   * @throws \Exception
   */
  public function setConsumerEnvCredentials(string $clientId): string {
    $consumers = $this->getConsumers($clientId);

    $consumer = $consumers[$clientId];
    $consumer->save();
    return 'Consumer secret set successfully.';
  }

  /**
   * Used for printing out the consumer UUID to the console.
   *
   * @param string $clientId
   *   Client id of the consumer.
   *
   * @command dpl_consumers:get-consumer-uuid
   * @aliases dpl-gcu
   * @usage dpl_consumers:get-consumer-uuid [client_id of the consumer]
   *
   * @throws \Exception
   */
  public function getConsumerUuid(string $clientId): void {
    $consumers = $this->getConsumers($clientId);
    $consumer = $consumers[$clientId];
    $this->output()->writeln(sprintf('Consumer UUID: %s', $consumer->uuid->value));
  }

  /**
   * Get consumers.
   *
   * @param string $clientId
   *   Client id of the consumer.
   *
   * @return mixed[]
   *   An array of consumer keyed by client id.
   *
   * @throws \Exception
   */
  protected function getConsumers(string $clientId): array {
    $consumers = dpl_consumers_get_known_consumers();
    if (!in_array($clientId, array_keys($consumers), TRUE)) {
      throw new \Exception(sprintf('GraphQL consumer %s is not known.', $clientId));
    }

    return $consumers;
  }

}
