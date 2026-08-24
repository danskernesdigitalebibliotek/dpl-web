<?php

namespace dpl_event\tests\src\Unit;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;
use Drupal\Tests\UnitTestCase;

/**
 * Tests the month grouping of the events overview.
 *
 * The events overview is grouped by month with a separator before the first
 * event of each month. This is driven by two procedural functions in
 * dpl_event.module:
 * - _dpl_event_stack_eventinstances() flags consecutive same-series events as
 *   stacked (existing behaviour).
 * - _dpl_event_group_events_by_month() adds a localized month label to each
 *   event row and un-stacks the first event of every month, so a month never
 *   opens with a parent-less stacked row beneath its heading.
 */
class EventMonthGroupingTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    // The functions under test live in the .module file.
    require_once __DIR__ . '/../../../dpl_event.module';

    // _dpl_event_group_events_by_month() resolves the date formatter from the
    // container. Stub it to honor the requested PHP date format so the display
    // label ('F') and the grouping key ('Y-m') come out distinct.
    $date_formatter = $this->createMock(DateFormatterInterface::class);
    $date_formatter->method('format')->willReturnCallback(
      fn (int $timestamp, string $type = 'medium', string $format = ''): string => date($format, $timestamp)
    );

    $container = new ContainerBuilder();
    $container->set('date.formatter', $date_formatter);
    \Drupal::setContainer($container);
  }

  /**
   * Builds a mocked event instance with a series and start date.
   */
  private function mockEvent(int $series_id, string $start_date): EventInstance {
    $series = $this->createMock(EventSeries::class);
    $series->method('id')->willReturn((string) $series_id);

    $event = $this->createMock(EventInstance::class);
    $event->method('getEventSeries')->willReturn($series);
    $event->method('getStartDate')->willReturn(new \DateTimeImmutable($start_date));

    return $event;
  }

  /**
   * Wraps an event instance as a row, as the events view builds them.
   */
  private function eventRow(EventInstance $event): array {
    return [
      'content' => [
        '#view_mode' => 'list_teaser_stacked_parent',
        '#eventinstance' => $event,
      ],
    ];
  }

  /**
   * Every event row gets the month label (no year) and a 'Y-m' grouping key.
   */
  public function testAddsMonthLabelToEachEvent(): void {
    // GIVEN two events in different months.
    $rows = [
      $this->eventRow($this->mockEvent(1, '2026-07-15')),
      $this->eventRow($this->mockEvent(2, '2026-08-01')),
    ];

    // WHEN the rows are grouped by month.
    $rows = _dpl_event_group_events_by_month($rows);

    // THEN each row carries its own month name (without the year) as label...
    $this->assertSame(date('F', strtotime('2026-07-15')), $rows[0]['month_label']);
    $this->assertSame(date('F', strtotime('2026-08-01')), $rows[1]['month_label']);
    // ...AND a 'Y-m' grouping key.
    $this->assertSame('2026-07', $rows[0]['month_key']);
    $this->assertSame('2026-08', $rows[1]['month_key']);
  }

  /**
   * The same month name in different years opens separate month groups.
   *
   * This is why grouping keys off 'Y-m' rather than the display label: two
   * July events a year apart share the label 'July' but must not be treated
   * as one continuous month.
   */
  public function testSameMonthNameDifferentYearsAreDistinctMonths(): void {
    // GIVEN two same-series events sharing a month name across a year boundary.
    $rows = [
      $this->eventRow($this->mockEvent(1, '2026-07-15')),
      $this->eventRow($this->mockEvent(1, '2027-07-15')),
    ];

    // WHEN the rows are stacked and then grouped by month.
    $rows = _dpl_event_stack_eventinstances($rows);
    $rows = _dpl_event_group_events_by_month($rows);

    // THEN the two share a label but get distinct grouping keys...
    $this->assertSame($rows[0]['month_label'], $rows[1]['month_label']);
    $this->assertNotSame($rows[0]['month_key'], $rows[1]['month_key']);
    // ...so the 2027 event opens a new month and is un-stacked to a teaser.
    $this->assertFalse($rows[1]['shouldBeStacked']);
    $this->assertSame('list_teaser_stacked_parent', $rows[1]['content']['#view_mode']);
  }

  /**
   * A stacked event that opens a new month is restored to a full teaser.
   *
   * This is the core reason for un-stacking: a series spanning a month
   * boundary would otherwise render the new month's first event as a compact,
   * parent-less stacked row directly beneath the separator.
   */
  public function testFirstEventOfMonthIsUnstacked(): void {
    // GIVEN a single series spanning a month boundary: two July events and a
    // third in August.
    $rows = [
      $this->eventRow($this->mockEvent(1, '2026-07-15')),
      $this->eventRow($this->mockEvent(1, '2026-07-22')),
      $this->eventRow($this->mockEvent(1, '2026-08-05')),
    ];

    // WHEN the rows are stacked and then grouped by month.
    $rows = _dpl_event_stack_eventinstances($rows);
    $rows = _dpl_event_group_events_by_month($rows);

    // THEN the July continuation is not a month start, so it stays stacked.
    $this->assertTrue($rows[1]['shouldBeStacked']);
    $this->assertSame('stacked_event', $rows[1]['content']['#view_mode']);

    // AND the August event opens a new month, so it is un-stacked to a full
    // teaser.
    $this->assertFalse($rows[2]['shouldBeStacked']);
    $this->assertSame('list_teaser_stacked_parent', $rows[2]['content']['#view_mode']);
  }

  /**
   * Consecutive same-series events within one month remain stacked.
   */
  public function testSameMonthSameSeriesStaysStacked(): void {
    // GIVEN three events from the same series, all in the same month.
    $rows = [
      $this->eventRow($this->mockEvent(1, '2026-07-01')),
      $this->eventRow($this->mockEvent(1, '2026-07-08')),
      $this->eventRow($this->mockEvent(1, '2026-07-15')),
    ];

    // WHEN the rows are stacked and then grouped by month.
    $rows = _dpl_event_stack_eventinstances($rows);
    $rows = _dpl_event_group_events_by_month($rows);

    // THEN the first event opens the month as a full teaser...
    $this->assertFalse($rows[0]['shouldBeStacked']);
    // ...AND the two later same-series events in the same month stay stacked.
    $this->assertTrue($rows[1]['shouldBeStacked']);
    $this->assertTrue($rows[2]['shouldBeStacked']);
  }

  /**
   * The very first event in the list is treated as a month start.
   */
  public function testFirstEventIsAlwaysMonthStart(): void {
    // GIVEN a single event that is (defensively) flagged as stacked.
    $rows = [
      $this->eventRow($this->mockEvent(1, '2026-07-15')),
    ];
    $rows[0]['shouldBeStacked'] = TRUE;
    $rows[0]['content']['#view_mode'] = 'stacked_event';

    // WHEN the rows are grouped by month.
    $rows = _dpl_event_group_events_by_month($rows);

    // THEN the first event, opening the first month, is a full teaser.
    $this->assertFalse($rows[0]['shouldBeStacked']);
    $this->assertSame('list_teaser_stacked_parent', $rows[0]['content']['#view_mode']);
  }

  /**
   * Rows that are not events are left untouched (no month label, no changes).
   */
  public function testNonEventRowsAreLeftUntouched(): void {
    // GIVEN a list with one event row and one non-event render item.
    $rows = [
      $this->eventRow($this->mockEvent(1, '2026-07-15')),
      ['content' => ['#markup' => 'not an event']],
    ];

    // WHEN the rows are grouped by month.
    $rows = _dpl_event_group_events_by_month($rows);

    // THEN the event gets a month label and the non-event row is untouched.
    $this->assertArrayHasKey('month_label', $rows[0]);
    $this->assertArrayNotHasKey('month_label', $rows[1]);
    $this->assertSame(['#markup' => 'not an event'], $rows[1]['content']);
  }

}
