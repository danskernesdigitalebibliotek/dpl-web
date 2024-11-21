<?php

declare(strict_types=1);

namespace Drupal\dpl_consumers\Commands;

use Drupal\dpl_consumers\DplGraphqlConsumersConstants;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for DPL consumers.
 */
final class DplConsumersCommands extends DrushCommands {

  /**
   * Function is used for printing out the consumer credentials to the console.
   *
   * @command dpl_consumers:consumer-credentials
   */
  public function getConsumerCredentials(): void {
    $graphql_consumer_client_id = DplGraphqlConsumersConstants::GRAPHQL_CONSUMER_CLIENT_ID;
    $consumer_uuid = dpl_consumers_get_consumer_uuid($graphql_consumer_client_id);
    $this->output()->writeln('Consumer UUID: ' . $consumer_uuid);
  }

}
