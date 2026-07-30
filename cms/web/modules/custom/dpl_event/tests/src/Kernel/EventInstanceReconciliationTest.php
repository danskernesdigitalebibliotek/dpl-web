<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_event\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Tests how event instances are reconciled when a series changes.
 *
 * Saving an event series with a changed date configuration recreates the event
 * instances of that series. Occurrences that the change does not affect have to
 * survive as the same entities: their IDs are public API, and an occurrence can
 * carry data that exists nowhere else.
 *
 * The cases here are the ones that cannot be reached from the editor UI, and so
 * cannot be covered by cypress/e2e/events/instance-preservation.cy.ts.
 */
class EventInstanceReconciliationTest extends KernelTestBase {

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

    // Our sites reconcile instances with our own plugin rather than with the
    // module default, so that is what these tests need to exercise.
    $this->config('recurring_events.eventseries.config')
      ->set('creator_plugin', 'dpl_event_eventinstance_creator')
      ->save();
  }

  /**
   * A series with a single occurrence keeps its instance when the date moves.
   *
   * The editor UI cannot show this: a series with one instance hides the
   * instance overview and redirects the instance form to the series form.
   */
  public function testSingleOccurrenceKeepsItsInstanceWhenTheDateMoves(): void {
    $series = $this->createSeries([
      ['2030-01-07T10:00:00', '2030-01-07T12:00:00'],
    ]);

    $original_ids = $this->instanceIds($series);
    $this->assertCount(1, $original_ids, 'The series starts out with a single instance.');

    $this->setCustomDates($series, [
      ['2030-02-11T12:30:00', '2030-02-11T14:30:00'],
    ]);

    $this->assertSame(
      $original_ids,
      $this->instanceIds($series),
      'Moving the only occurrence of a series reuses the existing instance.',
    );

    $instance = $this->loadInstance($original_ids[0]);
    $this->assertSame('2030-02-11T12:30:00', $instance->get('date')->value);
    $this->assertSame('2030-02-11T14:30:00', $instance->get('date')->end_value);
  }

  /**
   * Excluding a date removes that occurrence and leaves the others alone.
   *
   * Excluded dates are applied while the dates of a series are calculated, so
   * they are the likeliest way for the preservation to remove too much or too
   * little.
   */
  public function testExcludingOneDateRemovesOnlyThatOccurrence(): void {
    $series = $this->createSeries([
      ['2030-01-07T10:00:00', '2030-01-07T12:00:00'],
      ['2030-01-14T10:00:00', '2030-01-14T12:00:00'],
      ['2030-01-21T10:00:00', '2030-01-21T12:00:00'],
    ]);

    $original_ids = $this->instanceIds($series);
    $this->assertCount(3, $original_ids);

    $excluded_id = $this->instanceIdByStartDate($series, '2030-01-14T10:00:00');

    $series->set('excluded_dates', [
      ['value' => '2030-01-14', 'end_value' => '2030-01-14'],
    ]);
    $series->save();

    $remaining_ids = $this->instanceIds($series);

    $this->assertNotContains($excluded_id, $remaining_ids, 'The excluded occurrence is gone.');
    $this->assertSame(
      array_values(array_diff($original_ids, [$excluded_id])),
      $remaining_ids,
      'The occurrences outside the excluded date are the same instances as before.',
    );
  }

  /**
   * Two occurrences that share a start time are both created.
   *
   * Occurrences are identified by their whole date range. Identifying them by
   * start time alone silently collapses same-day occurrences of different
   * lengths into one, which is not something an editor can be warned about.
   */
  public function testOccurrencesSharingTheirStartTimeAreBothCreated(): void {
    $series = $this->createSeries([
      ['2030-01-07T10:00:00', '2030-01-07T12:00:00'],
      ['2030-01-07T10:00:00', '2030-01-07T14:00:00'],
    ]);

    $this->assertCount(
      2,
      $this->instanceIds($series),
      'Occurrences that start at the same time but end at different times are distinct.',
    );
  }

  /**
   * Creates a published event series with the given custom date ranges.
   *
   * @param array<array{string, string}> $dates
   *   Start and end date pairs, in the datetime storage format and timezone.
   */
  private function createSeries(array $dates): EventSeries {
    $series = EventSeries::create([
      'type' => 'default',
      'title' => 'Reconciliation test series',
      'recur_type' => 'custom',
      'custom_date' => $this->dateRangeValues($dates),
      'status' => 1,
    ]);
    $series->save();

    return $series;
  }

  /**
   * Replaces the custom dates of a series, and saves it.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series to change.
   * @param array<array{string, string}> $dates
   *   Start and end date pairs, in the datetime storage format and timezone.
   */
  private function setCustomDates(EventSeries $series, array $dates): void {
    $series->set('custom_date', $this->dateRangeValues($dates));
    $series->save();
  }

  /**
   * Turns start and end date pairs into date range field values.
   *
   * @param array<array{string, string}> $dates
   *   Start and end date pairs, in the datetime storage format and timezone.
   *
   * @return array<array{value: string, end_value: string}>
   *   The field values.
   */
  private function dateRangeValues(array $dates): array {
    return array_map(fn (array $date): array => [
      'value' => $date[0],
      'end_value' => $date[1],
    ], $dates);
  }

  /**
   * Returns the IDs of the instances of a series, oldest occurrence first.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $series
   *   The series to read the instances of.
   *
   * @return string[]
   *   The instance IDs.
   */
  private function instanceIds(EventSeries $series): array {
    $storage = $this->container->get('entity_type.manager')->getStorage('eventinstance');
    $storage->resetCache();

    $ids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('eventseries_id', $series->id())
      ->sort('date__value')
      ->execute();

    return array_values(array_map('strval', $ids));
  }

  /**
   * Returns the ID of the instance of a series that starts at the given date.
   */
  private function instanceIdByStartDate(EventSeries $series, string $start_date): string {
    $storage = $this->container->get('entity_type.manager')->getStorage('eventinstance');

    $ids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('eventseries_id', $series->id())
      ->condition('date__value', $start_date)
      ->execute();

    $this->assertCount(1, $ids, "Exactly one instance starts at $start_date.");

    return (string) reset($ids);
  }

  /**
   * Loads a single event instance, and asserts that it is still there.
   */
  private function loadInstance(string $id): EventInstance {
    $storage = $this->container->get('entity_type.manager')->getStorage('eventinstance');
    $storage->resetCache();
    $instance = $storage->load($id);

    $this->assertInstanceOf(EventInstance::class, $instance, "Event instance $id exists.");

    return $instance;
  }

}
