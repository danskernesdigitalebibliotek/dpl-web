<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Drush\Commands;

use Drupal\bnf_client\BnfScheduler;
use Drush\Attributes\Command;
use Drush\Attributes\Help;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * Commands for scheduling.
 */
class SchedulerCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructor.
   */
  public function __construct(protected BnfScheduler $scheduler) {
  }

  /**
   * Update all subscriptions.
   */
  #[Command(name: 'bnf:scheduler:all-subscriptions')]
  #[Help(description: 'Schedule updating of all subscriptions')]
  public function updateAllSubscriptions(): void {
    $this->scheduler->queueAllSubscriptionsUpdate();
  }

  /**
   * Update all nodes.
   */
  #[Command(name: 'bnf:scheduler:all-nodes')]
  #[Help(description: 'Schedule updating of all nodes')]
  public function updateAllNodes(): void {
    $this->scheduler->queueAllNodesUpdate();
  }

}
