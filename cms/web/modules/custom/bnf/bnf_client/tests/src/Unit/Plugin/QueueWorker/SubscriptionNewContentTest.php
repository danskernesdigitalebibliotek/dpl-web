<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf_client\Unit\Plugin\QueueWorker;

use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Entity\Subscription;
use Drupal\bnf_client\Plugin\QueueWorker\SubscriptionNewContent;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueInterface;
use Drupal\node\NodeInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Tests SubscriptionNewContent queue worker.
 *
 * @group bnf_client
 * @coversDefaultClass \Drupal\bnf_client\Plugin\QueueWorker\SubscriptionNewContent
 */
class SubscriptionNewContentTest extends UnitTestCase {

  /**
   * The queue worker under test.
   */
  protected SubscriptionNewContent $queueWorker;

  /**
   * Mock subscription storage.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $subscriptionStorage;

  /**
   * Mock node storage.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $nodeStorage;

  /**
   * Mock BNF importer.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf\Services\BnfImporter>
   */
  protected ObjectProphecy $importer;

  /**
   * Mock node update queue.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Queue\QueueInterface>
   */
  protected ObjectProphecy $nodeQueue;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->subscriptionStorage = $this->prophesize(EntityStorageInterface::class);
    $this->nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $this->importer = $this->prophesize(BnfImporter::class);
    $this->nodeQueue = $this->prophesize(QueueInterface::class);

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('bnf_subscription')
      ->willReturn($this->subscriptionStorage->reveal());
    $entityTypeManager->getStorage('node')
      ->willReturn($this->nodeStorage->reveal());

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('base_url')->willReturn('https://example.com/');

    $configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $configFactory->get('bnf_client.settings')->willReturn($config->reveal());

    $queueFactory = $this->prophesize(QueueFactory::class);
    $queueFactory->get('bnf_client_node_update')
      ->willReturn($this->nodeQueue->reveal());

    $this->queueWorker = new SubscriptionNewContent(
      [],
      'bnf_client_new_content',
      [],
      $entityTypeManager->reveal(),
      $configFactory->reveal(),
      $this->importer->reveal(),
      $queueFactory->reveal(),
    );
  }

  /**
   * Test that locally claimed nodes are not queued for update.
   *
   * @covers ::processItem
   * @covers ::isLocallyClaimed
   */
  public function testLocallyClaimedNodesAreNotQueued(): void {
    $subscriptionUuid = 'subscription-uuid-123';
    $claimedNodeUuid = 'claimed-node-uuid-456';

    // Create mock subscription.
    $subscription = $this->createMockSubscription($subscriptionUuid);
    $this->subscriptionStorage->load('sub-id-1')
      ->willReturn($subscription->reveal());

    // Importer returns the claimed node's UUID as new content.
    $this->importer->newContent($subscriptionUuid, 0, 'https://example.com/graphql')
      ->willReturn([
        'uuids' => [$claimedNodeUuid],
        'youngest' => 1000,
      ]);

    // Create mock node with LocallyClaimed state.
    $claimedNode = $this->createMockNode(BnfStateEnum::LocallyClaimed);
    $this->nodeStorage->loadByProperties(['uuid' => $claimedNodeUuid])
      ->willReturn([$claimedNode->reveal()]);

    // Process the subscription.
    $this->queueWorker->processItem(['id' => 'sub-id-1']);

    // Assert that no item was queued (locally claimed node was filtered out).
    $this->nodeQueue->createItem(Argument::any())->shouldNotHaveBeenCalled();
  }

  /**
   * Test that imported nodes are queued for update.
   *
   * @covers ::processItem
   * @covers ::isLocallyClaimed
   */
  public function testImportedNodesAreQueued(): void {
    $subscriptionUuid = 'subscription-uuid-123';
    $importedNodeUuid = 'imported-node-uuid-789';

    // Create mock subscription.
    $subscription = $this->createMockSubscription($subscriptionUuid);
    $this->subscriptionStorage->load('sub-id-1')
      ->willReturn($subscription->reveal());

    // Importer returns the imported node's UUID as new content.
    $this->importer->newContent($subscriptionUuid, 0, 'https://example.com/graphql')
      ->willReturn([
        'uuids' => [$importedNodeUuid],
        'youngest' => 1000,
      ]);

    // Create mock node with Imported state.
    $importedNode = $this->createMockNode(BnfStateEnum::Imported);
    $this->nodeStorage->loadByProperties(['uuid' => $importedNodeUuid])
      ->willReturn([$importedNode->reveal()]);

    // Process the subscription.
    $this->queueWorker->processItem(['id' => 'sub-id-1']);

    // Assert that the node was queued for update.
    $this->nodeQueue->createItem(Argument::that(function ($item) use ($importedNodeUuid) {
      return $item['uuid'] === $importedNodeUuid;
    }))->shouldHaveBeenCalledOnce();
  }

  /**
   * Test that new nodes (not yet imported) are queued.
   *
   * @covers ::processItem
   * @covers ::isLocallyClaimed
   */
  public function testNewNodesAreQueued(): void {
    $subscriptionUuid = 'subscription-uuid-123';
    $newNodeUuid = 'new-node-uuid-999';

    // Create mock subscription.
    $subscription = $this->createMockSubscription($subscriptionUuid);
    $this->subscriptionStorage->load('sub-id-1')
      ->willReturn($subscription->reveal());

    // Importer returns a new node's UUID that doesn't exist locally.
    $this->importer->newContent($subscriptionUuid, 0, 'https://example.com/graphql')
      ->willReturn([
        'uuids' => [$newNodeUuid],
        'youngest' => 1000,
      ]);

    // Node doesn't exist locally.
    $this->nodeStorage->loadByProperties(['uuid' => $newNodeUuid])
      ->willReturn([]);

    // Process the subscription.
    $this->queueWorker->processItem(['id' => 'sub-id-1']);

    // Assert that the new node was queued for import.
    $this->nodeQueue->createItem(Argument::that(function ($item) use ($newNodeUuid) {
      return $item['uuid'] === $newNodeUuid;
    }))->shouldHaveBeenCalledOnce();
  }

  /**
   * Create a mock subscription.
   *
   * @return \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf_client\Entity\Subscription>
   *   The mock subscription.
   */
  protected function createMockSubscription(string $subscriptionUuid): ObjectProphecy {
    $subscription = $this->prophesize(Subscription::class);
    $subscription->getSubscriptionUuid()->willReturn($subscriptionUuid);
    $subscription->getLast()->willReturn(0);
    $subscription->id()->willReturn('sub-id-1');
    $subscription->getCategories()->willReturn([]);
    $subscription->getTags()->willReturn([]);
    $subscription->setLast(Argument::any())->shouldBeCalled();
    $subscription->save()->shouldBeCalled();

    // Set the noCheck property.
    $subscription->noCheck = FALSE;

    return $subscription;
  }

  /**
   * Create a mock node with a specific BNF state.
   *
   * @return \Prophecy\Prophecy\ObjectProphecy<\Drupal\node\NodeInterface>
   *   The mock node.
   */
  protected function createMockNode(BnfStateEnum $bnfState): ObjectProphecy {
    // Create a mock that mimics EnumItemList behavior.
    $stateField = new class($bnfState) {

      public function __construct(private BnfStateEnum $state) {}

      /**
       * Check if the field is empty.
       */
      public function isEmpty(): bool {
        return FALSE;
      }

      /**
       * Get the enum values.
       *
       * @return \Drupal\bnf\BnfStateEnum[]
       *   The enum values.
       */
      public function enums(): array {
        return [$this->state];
      }

    };

    $node = $this->prophesize(NodeInterface::class);
    $node->hasField(BnfStateEnum::FIELD_NAME)->willReturn(TRUE);
    $node->get(BnfStateEnum::FIELD_NAME)->willReturn($stateField);

    return $node;
  }

}
