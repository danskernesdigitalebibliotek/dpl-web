<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_event\Kernel;

use DanskernesDigitaleBibliotek\CMS\Api\Model\EventsGET200ResponseInner;
use Drupal\KernelTests\KernelTestBase;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\dpl_event\Services\EventRestMapper;
use Drupal\recurring_events\Entity\EventSeries;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests which occurrences the happening events endpoint returns.
 *
 * The endpoint used to require an occurrence to have started as well as to not
 * have ended, which left out every event that had not begun yet - the ones a
 * visitor is most likely looking for. These tests pin down the window that
 * replaced it: an occurrence is returned until it ends, whether or not it has
 * started.
 *
 * The response mapping is stubbed. It reads fields that the site configuration
 * adds to eventinstance rather than the module, so they do not exist in a
 * kernel test - and this is a test of which occurrences are selected, not of
 * how they are serialised.
 */
class HappeningEventsResourceTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'datetime',
    'datetime_range',
    'dpl_event',
    'field',
    'field_inheritance',
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
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
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

    // Stand in for the real mapping, and carry through just enough of each
    // occurrence to tell them apart in the response. The title comes off the
    // series: an instance inherits its own title through field_inheritance,
    // which the site configuration sets up rather than the module.
    $mapper = $this->createMock(EventRestMapper::class);
    $mapper->method('getResponse')->willReturnCallback(
      fn (EventInstance $instance): EventsGET200ResponseInner => new EventsGET200ResponseInner([
        'title' => (string) $instance->getEventSeries()?->label(),
      ]),
    );
    $this->container->set('dpl_event.event_rest_mapper', $mapper);
  }

  /**
   * Occurrences are returned until they end, started or not.
   *
   * The two occurrences that have ended cover both sides of the old start date
   * condition: one ended yesterday, and one ended earlier today. Neither is
   * current, and the endpoint compares against the current time rather than the
   * current date, so both stay out.
   */
  public function testOccurrencesAreReturnedUntilTheyEnd(): void {
    $this->createOccurrence('Ended yesterday', -25 * 3600, -24 * 3600);
    $this->createOccurrence('Ended two hours ago', -4 * 3600, -2 * 3600);
    $this->createOccurrence('Under way', -3600, 3600);
    $this->createOccurrence('Starts in two hours', 2 * 3600, 4 * 3600);
    $this->createOccurrence('Starts next month', 30 * 86400, 30 * 86400 + 3600);

    $this->assertSame(
      ['Under way', 'Starts in two hours', 'Starts next month'],
      $this->happeningEventTitles(),
      'Ongoing and future occurrences come back in start date order, and the ones that have ended are left out.',
    );
  }

  /**
   * An occurrence that runs across the current time is returned once only.
   *
   * A long running occurrence such as an exhibition satisfies both ends of the
   * window at the same time, which is where a query built from overlapping
   * conditions is most likely to hand out duplicates.
   */
  public function testAnOngoingOccurrenceIsReturnedOnce(): void {
    $this->createOccurrence('Runs for a month', -15 * 86400, 15 * 86400);

    $this->assertSame(['Runs for a month'], $this->happeningEventTitles());
  }

  /**
   * Unpublished occurrences stay out of the endpoint.
   *
   * Occurrences are unpublished automatically once they are over, so an
   * unpublished occurrence that is still under way is one an editor has taken
   * off the site deliberately.
   */
  public function testUnpublishedOccurrencesAreNotReturned(): void {
    $series = $this->createOccurrence('Under way but unpublished', -3600, 3600);

    foreach ($series->get('event_instances')->referencedEntities() as $instance) {
      $this->assertInstanceOf(EventInstance::class, $instance);
      $instance->set('status', FALSE);
      $instance->save();
    }

    $this->assertSame([], $this->happeningEventTitles());
  }

  /**
   * The titles the endpoint returns, in the order it returns them.
   *
   * @return array<string>
   *   The event titles.
   */
  private function happeningEventTitles(): array {
    $resource = $this->container->get('plugin.manager.rest')
      ->createInstance('happening_events');

    $response = $resource->get(Request::create('/api/v1/events/happening'));
    $content = $response->getContent();

    $this->assertIsString($content);
    $events = json_decode($content, TRUE);
    $this->assertIsArray($events);

    return array_column($events, 'title');
  }

  /**
   * Creates a series holding a single occurrence, placed around right now.
   *
   * @param string $title
   *   The series title, which its occurrence inherits.
   * @param int $start_offset
   *   Seconds from the current request time to the start of the occurrence.
   * @param int $end_offset
   *   Seconds from the current request time to the end of the occurrence.
   *
   * @return \Drupal\recurring_events\Entity\EventSeries
   *   The saved series.
   */
  private function createOccurrence(string $title, int $start_offset, int $end_offset): EventSeries {
    $request_time = \Drupal::time()->getRequestTime();

    $series = EventSeries::create([
      'type' => 'default',
      'title' => $title,
      'recur_type' => 'custom',
      'custom_date' => [
        [
          'value' => $this->storageDate($request_time + $start_offset),
          'end_value' => $this->storageDate($request_time + $end_offset),
        ],
      ],
      'status' => 1,
    ]);
    $series->save();

    return $series;
  }

  /**
   * Formats a timestamp the way date fields store their values.
   *
   * @param int $timestamp
   *   The timestamp to format.
   *
   * @return string
   *   The date, in UTC.
   */
  private function storageDate(int $timestamp): string {
    return gmdate(DateTimeItemInterface::DATETIME_STORAGE_FORMAT, $timestamp);
  }

}
