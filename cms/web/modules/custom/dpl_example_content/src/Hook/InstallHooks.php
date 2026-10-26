<?php

declare(strict_types=1);

namespace Drupal\dpl_example_content\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\dpl_opening_hours\Model\OpeningHoursInstance;
use Drupal\dpl_opening_hours\Model\OpeningHoursRepository;
use Drupal\dpl_opening_hours\Model\Repetition\NoRepetition;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;
use Psr\Log\LoggerInterface;
use Safe\DateTimeImmutable;

/**
 * Install hooks for dpl_example_content module.
 */
class InstallHooks {

  /**
   * Logger for the dpl_example_content channel.
   */
  protected LoggerInterface $logger;

  public function __construct(
    protected OpeningHoursRepository $openingHoursRepository,
    protected EntityRepositoryInterface $entityRepository,
    protected ConfigFactoryInterface $configFactory,
    LoggerChannelFactoryInterface $loggerFactory,
  ) {
    $this->logger = $loggerFactory->get('dpl_example_content');
  }

  /**
   * Creates sample opening hours and sets the front page on install.
   *
   * @param string[] $modules
   *   The names of the modules that were installed.
   */
  #[Hook('modules_installed')]
  public function setupExampleSite(array $modules): void {
    if (!in_array('dpl_example_content', $modules)) {
      return;
    }

    // Hovedbiblioteket branch from DPL Example Content.
    $branch = $this->entityRepository->loadEntityByUuid('node', 'dac275e4-9b8c-4959-a13a-6b9fdbc1f6b0');
    if (!($branch instanceof NodeInterface)) {
      $this->logger->error("Unable to load branch from UUID");
      return;
    }
    // Åben category from DPL static content: Opening hours categories.
    $category_open = $this->entityRepository->loadEntityByUuid('taxonomy_term', '9c2f0d96-88e1-497c-bf82-e18eb9d5769c');
    if (!($category_open instanceof TermInterface)) {
      $this->logger->error("Unable to load category from UUID");
      return;
    }

    $now = new DateTimeImmutable();
    // Create a period from monday last week until the next week has passed.
    // This allows us to have opening hours to show and to navigate from and
    // to.
    $range = new \DatePeriod($now->modify("monday last week"), new \DateInterval("P1D"), 21);
    $num_instances = 0;
    foreach ($range->getIterator() as $date) {
      // Skip opening hours on a couple of days to mark the library as closed.
      if (rand(1, 10) === 1) {
        continue;
      }

      /** @var \DateTimeImmutable $date */
      $instance = new OpeningHoursInstance(
        NULL,
        $branch,
        $category_open,
        $date->setTime(rand(8, 10), 0),
        $date->setTime(rand(15, 20), 0),
        new NoRepetition()
      );
      $this->openingHoursRepository->insert($instance);
      $num_instances++;
    }

    $this->logger->info("Created {$num_instances} opening hours instances");

    // Set page.front link to /frontpage.
    $new_front_page = '/frontpage';
    $this->configFactory->getEditable('system.site')->set('page.front', $new_front_page)->save();
    $this->logger->info("Update frontpage link to {$new_front_page}, as part of example content installation.");
  }

}
