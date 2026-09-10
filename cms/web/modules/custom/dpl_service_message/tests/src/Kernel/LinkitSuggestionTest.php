<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_service_message\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\linkit\MatcherInterface;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\Tests\user\Traits\UserCreationTrait;

/**
 * Tests that service messages are not offered as link targets.
 *
 * A service message has no page of its own worth linking to, but Linkit's
 * node matcher suggests every bundle unless told otherwise - so editors
 * could link to one, which is what KB-59 reported.
 *
 * The exclusion is a condition added to Linkit's tagged suggestion query
 * (DplServiceMessageHooks::excludeFromLinkitSuggestions). This test drives
 * the real matcher rather than asserting on the query, so that it also fails
 * if Linkit ever renames the tag the hook is bound to - the failure mode a
 * hand-built query could not catch.
 */
class LinkitSuggestionTest extends KernelTestBase {

  use UserCreationTrait;

  /**
   * {@inheritdoc}
   *
   * The module's own dependencies have to be listed out: a kernel test does
   * not resolve them from the info.yml.
   */
  protected static $modules = [
    'system',
    'user',
    'field',
    'filter',
    'text',
    'options',
    'link',
    'node',
    'path_alias',
    'drupal_typed',
    'handy_cache_tags',
    'scheduler',
    'linkit',
    'dpl_service_message',
  ];

  /**
   * A title no other content in the test shares.
   */
  protected const MESSAGE_TITLE = 'Closed for stocktaking';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
    $this->installEntitySchema('path_alias');
    $this->installConfig(['field', 'filter', 'node']);

    // The site defines the bundle in config/sync rather than the module in
    // config/install, so the test has to create it.
    NodeType::create([
      'type' => ServiceMessageLoader::BUNDLE,
      'name' => 'Service message',
    ])->save();
    NodeType::create(['type' => 'page', 'name' => 'Page'])->save();

    $this->createServiceMessageFields();

    // Linkit runs its query with accessCheck(TRUE) and checks each result
    // again, so the acting user has to be able to see everything the matcher
    // could offer. Otherwise a message would stay hidden because of access
    // and the test would pass without the exclusion doing any work.
    $this->setUpCurrentUser([], ['access content', 'bypass node access']);
  }

  /**
   * Create the fields the module's save hooks read.
   *
   * Saving a service message runs label generation and the global-message
   * invariant, both of which read fields of the bundle - without them the
   * node cannot be saved at all.
   */
  protected function createServiceMessageFields(): void {
    $fields = [
      'field_svcmsg_heading' => 'string',
      'field_svcmsg_body' => 'text_long',
      'field_svcmsg_placement' => 'list_string',
    ];

    foreach ($fields as $name => $type) {
      FieldStorageConfig::create([
        'field_name' => $name,
        'entity_type' => 'node',
        'type' => $type,
      ])->save();

      FieldConfig::create([
        'field_name' => $name,
        'entity_type' => 'node',
        'bundle' => ServiceMessageLoader::BUNDLE,
      ])->save();
    }
  }

  /**
   * The Linkit node matcher, configured as the shipped profile has it.
   *
   * Two settings matter and neither is the plugin default, so both are set
   * explicitly rather than inherited:
   *
   * - `bundles` empty, which is what makes every bundle a candidate and
   *   therefore what the exclusion has to work against.
   * - `include_unpublished` TRUE, which the plugin defaults to FALSE. Set
   *   for fidelity with the profile, so the matcher under test is no more
   *   restrictive than the one editors actually use.
   *
   * @see linkit.linkit_profile.default.yml
   */
  protected function nodeMatcher(): MatcherInterface {
    $matcher = $this->container->get('plugin.manager.linkit.matcher')
      ->createInstance('entity:node', [
        'bundles' => [],
        'include_unpublished' => TRUE,
      ]);
    assert($matcher instanceof MatcherInterface);
    return $matcher;
  }

  /**
   * The labels Linkit suggests for a search string.
   *
   * @return array<string>
   *   The suggestion labels.
   */
  protected function suggestionLabels(string $search): array {
    $labels = [];

    foreach ($this->nodeMatcher()->execute($search)->getSuggestions() as $suggestion) {
      $labels[] = $suggestion->getLabel();
    }

    return $labels;
  }

  /**
   * Create a published service message with a known, searchable title.
   */
  protected function createServiceMessage(): Node {
    $node = Node::create([
      'type' => ServiceMessageLoader::BUNDLE,
      'title' => self::MESSAGE_TITLE,
      'status' => TRUE,
      'field_svcmsg_heading' => self::MESSAGE_TITLE,
      'field_svcmsg_placement' => ServiceMessagePlacement::InPage->value,
    ]);
    $node->save();

    return $node;
  }

  /**
   * A published service message is never suggested.
   */
  public function testPublishedServiceMessageIsNotSuggested(): void {
    $message = $this->createServiceMessage();

    // Guard the test itself: the title has to be one the matcher would find
    // if the bundle were not excluded.
    $this->assertSame(self::MESSAGE_TITLE, $message->label());
    $this->assertNotEmpty($this->nodesMatchingTitle('stocktaking'));

    $this->assertSame([], $this->suggestionLabels('stocktaking'));
  }

  /**
   * Other content is still suggested.
   *
   * The exclusion names one bundle rather than allow-listing the linkable
   * ones, so everything else - including a bundle the test invents - has to
   * keep working.
   */
  public function testOtherContentIsStillSuggested(): void {
    $this->createServiceMessage();

    Node::create([
      'type' => 'page',
      'title' => 'Stocktaking explained',
      'status' => TRUE,
    ])->save();

    $this->assertSame(
      ['Stocktaking explained'],
      $this->suggestionLabels('stocktaking'),
    );
  }

  /**
   * The node IDs whose title matches, ignoring Linkit entirely.
   *
   * Used to prove the content exists and would match, so that an empty
   * suggestion list means "excluded" rather than "nothing to find".
   *
   * @return array<int|string>
   *   The matching node IDs.
   */
  protected function nodesMatchingTitle(string $fragment): array {
    return $this->container->get('entity_type.manager')
      ->getStorage('node')
      ->getQuery()
      ->accessCheck(FALSE)
      ->condition('title', '%' . $fragment . '%', 'LIKE')
      ->execute();
  }

}
