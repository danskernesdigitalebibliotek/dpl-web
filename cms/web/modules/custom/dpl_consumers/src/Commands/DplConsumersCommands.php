<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_consumers\DplGraphqlConsumersConstants;
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
   * @command dpl_consumers:set-consumer-secret
   *
   * @throws \Exception
   */
  public function setConsumerSecret(): string {
    try {
      /** @var \Drupal\Core\Entity\EntityStorageInterface $consumer */
      $consumer = $this->entityTypeManager
        ->getStorage('consumer')
        ->loadByProperties(['client_id' => DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_CLIENT_ID]);

      $consumer = reset($consumer);

      $secret = getenv('GRAPHQL_CONSUMER_SECRET');
      if (!empty($secret)) {
        $consumer->secret = $secret;
        $consumer->save();

        return 'Consumer secret set successfully.';
      }
      else {
        throw new \Exception('Consumer secret was not found.');
      }
    }
    catch (\Exception $e) {
      throw new \Exception($e->getMessage());
    }
  }

  /**
   * Function is used for printing out the consumer credentials to the console.
   *
   * @command dpl_consumers:consumer-credentials
   *
   * @throws \Exception
   */
  public function getConsumerCredentials(): void {
    $graphql_consumer_client_id = DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_CLIENT_ID;
    $consumer_uuid = dpl_consumers_get_consumer_uuid($graphql_consumer_client_id);
    $this->output()->writeln('Consumer UUID: ' . $consumer_uuid);
  }

}
