<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_event\Kernel;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInner;
use Drupal\Core\Cache\CacheableResponseInterface;
use Drupal\KernelTests\KernelTestBase;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\dpl_event\Services\EventRestMapper;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\node\NodeInterface;
use Drupal\recurring_events\Entity\EventSeries;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests how the event endpoints treat events of unpublished branches.
 *
 * A branch node can be unpublished, e.g. while a library prepares a new
 * branch. The apps must not show such a branch, so an event belonging only to
 * unpublished branches must not be exposed, and an event must not reveal an
 * unpublished branch it shares with a published one.
 *
 * On our sites an instance gets its branches through field_inheritance. That
 * is set up by the site configuration rather than the module, so here the
 * instances get a plain reference field of the same name instead.
 *
 * The response mapping is stubbed, as in HappeningEventsResourceTest, so these
 * tests cover which events are returned and how the responses are cached.
 */
class EventsUnpublishedBranchesTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'datetime',
    'datetime_range',
    'dpl_event',
    'field',
    'field_inheritance',
    'node',
    'options',
    'recurring_events',
    'system',
    'text',
    'user',
    // Kernel tests do not resolve module dependencies, so everything dpl_event
    // depends on has to be listed as well.
    'drupal_typed',
    'dpl_rest_base',
    'enum_field',
    'job_scheduler',
    'rest',
    'serialization',
  ];

  /**
   * The endpoints listing events, by REST resource plugin id.
   *
   * @return array<string, array{string}>
   *   The plugin ids, keyed by data set name.
   */
  public static function eventEndpoints(): array {
    return [
      '/api/v1/events' => ['events'],
      '/api/v1/events/happening' => ['happening_events'],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
    $this->installEntitySchema('eventseries');
    $this->installEntitySchema('eventinstance');
    // Saving an event instance schedules its automatic unpublishing.
    $this->installEntitySchema('job_schedule');

    // Event series bundles register themselves for field inheritance, which
    // needs that module's own configuration in place first.
    $this->installConfig(['field_inheritance', 'recurring_events']);

    // Our sites create instances with our own plugin rather than with the
    // module default, so that is what these tests need to exercise.
    $this->config('recurring_events.eventseries.config')
      ->set('creator_plugin', 'dpl_event_eventinstance_creator')
      ->save();

    NodeType::create(['type' => 'branch', 'name' => 'Branch'])->save();

    FieldStorageConfig::create([
      'field_name' => 'branch',
      'entity_type' => 'eventinstance',
      'type' => 'entity_reference',
      'cardinality' => -1,
      'settings' => ['target_type' => 'node'],
    ])->save();
    FieldConfig::create([
      'field_name' => 'branch',
      'entity_type' => 'eventinstance',
      'bundle' => 'default',
    ])->save();

    // Stand in for the real mapping, and carry through just enough of each
    // event to tell them apart in the response.
    $mapper = $this->createMock(EventRestMapper::class);
    $mapper->method('getResponse')->willReturnCallback(
      fn (EventInstance $instance): EventsGET200ResponseInner => new EventsGET200ResponseInner([
        'title' => (string) $instance->getEventSeries()?->label(),
      ]),
    );
    $this->container->set('dpl_event.event_rest_mapper', $mapper);
  }

  /**
   * Events belonging only to unpublished branches are left out.
   *
   * An event sharing an unpublished branch with a published one stays, and so
   * does an event without any branch, as no branch hides it.
   *
   * @dataProvider eventEndpoints
   */
  public function testEventsOfOnlyUnpublishedBranchesAreLeftOut(string $resourceId): void {
    $published = $this->createBranch('Published branch', TRUE);
    $unpublished = $this->createBranch('Unpublished branch', FALSE);

    $this->createEvent('Published branch only', [$published], 1);
    $this->createEvent('Unpublished branch only', [$unpublished], 2);
    $this->createEvent('Published and unpublished branch', [$published, $unpublished], 3);
    $this->createEvent('No branch', [], 4);

    $this->assertSame(
      ['Published branch only', 'Published and unpublished branch', 'No branch'],
      $this->eventTitles($resourceId),
    );
  }

  /**
   * Publishing a branch must invalidate the responses.
   *
   * Events of an unpublished branch are left out of the response, so it has to
   * carry the cache tags of the branch to show them once it is published.
   *
   * @dataProvider eventEndpoints
   */
  public function testResponsesDependOnTheBranchesOfTheEvents(string $resourceId): void {
    $unpublished = $this->createBranch('Unpublished branch', FALSE);
    $this->createEvent('Unpublished branch only', [$unpublished], 1);

    $response = $this->eventsResponse($resourceId);

    $this->assertInstanceOf(CacheableResponseInterface::class, $response);
    $this->assertContains(
      'node:' . $unpublished->id(),
      $response->getCacheableMetadata()->getCacheTags(),
    );
  }

  /**
   * An event exposes only its published branches.
   *
   * The REST mapping and the legacy Redia feed describe an event by these
   * branches, so an unpublished branch never reaches the apps.
   */
  public function testEventsExposeOnlyTheirPublishedBranches(): void {
    $published = $this->createBranch('Published branch', TRUE);
    $unpublished = $this->createBranch('Unpublished branch', FALSE);

    $instance = $this->createEvent('Published and unpublished branch', [$unpublished, $published], 1);

    $this->assertSame(
      [$published->id()],
      array_map(fn (NodeInterface $branch) => $branch->id(), $instance->getPublishedBranches()),
      'The unpublished branch is left out, even when it is the first one.',
    );
    $this->assertFalse($instance->hasOnlyUnpublishedBranches());

    $onlyUnpublished = $this->createEvent('Unpublished branch only', [$unpublished], 2);
    $this->assertSame([], $onlyUnpublished->getPublishedBranches());
    $this->assertTrue($onlyUnpublished->hasOnlyUnpublishedBranches());

    $noBranch = $this->createEvent('No branch', [], 3);
    $this->assertFalse($noBranch->hasOnlyUnpublishedBranches(), 'An event without branches is not hidden.');
  }

  /**
   * The titles an endpoint returns, in the order it returns them.
   *
   * @return array<string>
   *   The event titles.
   */
  private function eventTitles(string $resourceId): array {
    $content = $this->eventsResponse($resourceId)->getContent();

    $this->assertIsString($content);
    $events = json_decode($content, TRUE);
    $this->assertIsArray($events);

    return array_column($events, 'title');
  }

  /**
   * Requests the events from an endpoint.
   */
  private function eventsResponse(string $resourceId): mixed {
    $resource = $this->container->get('plugin.manager.rest')
      ->createInstance($resourceId);

    return $resource->get(Request::create('/'));
  }

  /**
   * Creates a branch node.
   */
  private function createBranch(string $title, bool $published): NodeInterface {
    $branch = Node::create([
      'type' => 'branch',
      'title' => $title,
      'status' => $published,
    ]);
    $branch->save();

    return $branch;
  }

  /**
   * Creates an upcoming event with a single occurrence, held by branches.
   *
   * @param string $title
   *   The series title, which its occurrence inherits.
   * @param \Drupal\node\NodeInterface[] $branches
   *   The branches of the occurrence.
   * @param int $days
   *   Days from now until the occurrence. Occurrences are listed by start
   *   date, so this sets the order of the response.
   *
   * @return \Drupal\dpl_event\Entity\EventInstance
   *   The occurrence.
   */
  private function createEvent(string $title, array $branches, int $days): EventInstance {
    $start = \Drupal::time()->getRequestTime() + $days * 86400;

    $series = EventSeries::create([
      'type' => 'default',
      'title' => $title,
      'recur_type' => 'custom',
      'custom_date' => [
        [
          'value' => $this->storageDate($start),
          'end_value' => $this->storageDate($start + 3600),
        ],
      ],
      'status' => 1,
    ]);
    $series->save();

    $instances = $series->get('event_instances')->referencedEntities();
    $this->assertCount(1, $instances);
    $instance = reset($instances);
    $this->assertInstanceOf(EventInstance::class, $instance);

    $instance->set('branch', $branches);
    $instance->save();

    return $instance;
  }

  /**
   * Formats a timestamp the way date fields store their values.
   */
  private function storageDate(int $timestamp): string {
    return gmdate(DateTimeItemInterface::DATETIME_STORAGE_FORMAT, $timestamp);
  }

}
