<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\dpl_event\EventRowGrouper;
use Drupal\dpl_event\EventState;
use Drupal\dpl_event\PriceFormatter;
use Drupal\dpl_event\ReoccurringDateFormatter;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Theme hooks for dpl_event module.
 */
class ThemeHooks {

  use StringTranslationTrait;

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected DateFormatterInterface $dateFormatter,
    protected TimeInterface $time,
    protected PriceFormatter $priceFormatter,
    protected ReoccurringDateFormatter $reoccurringDateFormatter,
    protected EventRowGrouper $eventRowGrouper,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Adjusts the event link button to the state of the event.
   *
   * Updates the button title and sets an 'event_is_active' flag depending on
   * the event state.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_field')]
  public function adjustEventLinkToState(array &$variables): void {
    // Get the field name from the variables array. Default to NULL if not set.
    $field_name = $variables['field_name'] ?? NULL;

    if (!in_array($field_name, ['field_event_link', 'event_link']) ||
      empty($variables['items'][0]['content']['#title'])) {
      return;
    }

    $entity = $variables['element']['#object'] ?? NULL;

    $variables['has_event_link'] = FALSE;

    if (!($entity instanceof EventInstance)) {
      return;
    }

    $event_state = $entity->getState();

    // Check if the event state is valid. If not, return early.
    if (!($event_state instanceof EventState)) {
      return;
    }

    $variables['has_event_link'] = TRUE;

    // Set 'event_is_active' flag if event state is neither of the following.
    $variables['event_is_active'] = !in_array($event_state, [
      EventState::Occurred,
      EventState::Cancelled,
      EventState::SoldOut,
      EventState::TicketSaleNotOpen,
    ]);

    // After determining the 'event_is_active' flag, check if the event is
    // active.
    if ($variables['event_is_active']) {
      // If active, set a translatable string as the title.
      $variables['items'][0]['content']['#title'] = $this->hasFreeTickets($entity)
        ? $this->t('Get tickets')
        : $this->t('Buy tickets');
      return;
    }

    // Update the title of the button to the label of the current event state.
    $variables['items'][0]['content']['#title'] = $event_state->label();
  }

  /**
   * Adds an array of formatted prices to ticket category price fields.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_field__field_ticket_category_price')]
  public function addFormattedTicketPrices(array &$variables): void {
    /** @var \Drupal\Core\Field\FieldItemListInterface $items */
    $items = $variables['element']['#items'];
    // Decimal field values are numeric strings, which strict types won't
    // coerce.
    $variables['prices'] = array_map(
      fn (array $price): string => $this->priceFormatter->formatPriceWithCurrency((float) $price['value']),
      $items->getValue()
    );
  }

  /**
   * Adds dates, times and upcoming instances to event series.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_eventseries')]
  public function addEventSeriesDates(array &$variables): void {
    $event_series = $variables['eventseries'] ?? NULL;

    if (!($event_series instanceof EventSeries)) {
      return;
    }

    $service = $this->reoccurringDateFormatter;

    // Use different date formatters based on view mode.
    $view_mode = $variables['view_mode'] ?? 'default';
    if ($view_mode === 'list_teaser') {
      // For list teaser view, use date without time.
      $variables['formatted_date'] = $service->getSeriesDateString($event_series, FALSE);
    }
    else {
      // For full view and other views, use date with time.
      $variables['formatted_date'] = $service->getSeriesDateString($event_series);
    }

    $upcoming_event_details = $service->getUpcomingEventDetails($event_series);
    $upcoming_ids = $upcoming_event_details['upcoming_ids'] ?? [];

    if ($service->isAllDay($event_series)) {
      $variables['start_time'] = $this->t('All day');
    }
    else {
      $start_date = $upcoming_event_details['start'] ?? NULL;
      $end_date = $upcoming_event_details['end'] ?? NULL;

      if ($start_date instanceof DrupalDateTime) {
        $variables['start_time'] = $service->formatDate($start_date, 'H:i');
        $variables['datetime_attribute'] = $service->formatDate($start_date, DATE_ATOM);
      }

      if ($end_date instanceof DrupalDateTime) {
        $variables['end_time'] = $service->formatDate($end_date, 'H:i');
      }
    }

    // Add cache tags and 12-hours max-age fallback.
    $variables['#cache'] = [
      '#max-age' => (60 * 60 * 12),
      '#tags' => ['eventinstance_list', 'eventseries_list'],
    ];

    if (count($upcoming_ids) < 2 || $view_mode !== 'full') {
      return;
    }

    // Adding a list of upcoming eventinstances, displayed on the full series.
    $event_instances = $this->entityTypeManager->getStorage('eventinstance')->loadMultiple($upcoming_ids);
    $viewBuilder = $this->entityTypeManager->getViewBuilder('eventinstance');
    $variables['event_instances'] = [];
    $parent_set = FALSE;

    foreach ($event_instances as $event_instance) {
      $view_mode = 'stacked_event';

      if (!$parent_set) {
        $view_mode = 'list_teaser_stacked_parent';
        $parent_set = TRUE;
      }

      $variables['event_instances'][] = $viewBuilder->view($event_instance, $view_mode);
    }
  }

  /**
   * Adds state, prices, URL and times to event instances.
   *
   * - Generating ticket pricing display.
   * - Generating the URL for the full view of the event instance.
   * - Processing start and end dates from the 'date' field and formatting them
   *   in the site's timezone.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_eventinstance')]
  public function addEventInstanceDetails(array &$variables): void {
    $eventInstance = $variables['eventinstance'];

    $state = $eventInstance->getState();
    if ($state instanceof EventState) {
      $variables['status'] = $state->label();
      $variables['status_value'] = $state->value;
    }

    if ($eventInstance->hasField('event_ticket_categories')) {
      $ticket_categories = $eventInstance->get('event_ticket_categories')->referencedEntities();
      $prices = [];
      // Collect prices from ticket categories.
      foreach ($ticket_categories as $category) {
        if ($category->hasField('field_ticket_category_price') && !$category->get('field_ticket_category_price')->isEmpty()) {
          $prices[] = $category->get('field_ticket_category_price')->value;
        }
      }

      $variables['ticket_price_display'] = $this->priceFormatter->formatPriceRange($prices);
    }

    $variables['eventinstance_url'] = Url::fromRoute('entity.eventinstance.canonical', ['eventinstance' => $eventInstance->id()])->toString();

    // Extract start_time, end_time and datetime attributes.
    if (!$eventInstance->get('date')->isEmpty()) {
      $date_field = $eventInstance->get('date')->first();

      $start_time = $date_field->start_date;
      $end_time = $date_field->end_date;

      if ($start_time instanceof DrupalDateTime) {
        $variables['start_time'] = $this->dateFormatter->format($start_time->getTimestamp(), 'custom', 'H:i');
        $variables['datetime_attribute'] = $this->dateFormatter->format($start_time->getTimestamp(), DATE_ATOM);
      }
      if ($end_time instanceof DrupalDateTime) {
        $variables['expired'] = ($end_time->getTimestamp() < $this->time->getCurrentTime());
        $variables['end_time'] = $this->dateFormatter->format($end_time->getTimestamp(), 'custom', 'H:i');
      }
    }

    if ($eventInstance->hasField('event_all_day') &&
      !empty($eventInstance->get('event_all_day')->getString())) {
      $variables['start_time'] = $this->t('All day');
      if (isset($variables['end_time'])) {
        unset($variables['end_time']);
      }
    }

    $variables['time_combined'] = $variables['start_time'];

    if (!empty($variables['end_time'])) {
      $variables['time_combined'] .= " - {$variables['end_time']}";
    }
  }

  /**
   * Stacks series and groups by month in the events overview.
   *
   * Flags consecutive event instances from the same series as stacked. Scoped
   * to the 'events' view, which is the only one rendering eventinstances in the
   * stacked parent view mode.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_views_view_unformatted__events')]
  public function groupEventsOverview(array &$variables): void {
    $variables['rows'] = $this->eventRowGrouper->stackSeries($variables['rows']);
    $variables['rows'] = $this->eventRowGrouper->groupByMonth($variables['rows']);

    // The library inserts a separator before each month's first event,
    // re-running as the infinite-scroll pager and AJAX filter/sort re-render
    // the list.
    $variables['#attached']['library'][] = 'novel/content-list-month-separator';
  }

  /**
   * Opts the events overview into the month-separator styling and behaviour.
   *
   * Adds the design system's wrapper class to the same container element the
   * infinite-scroll pager wraps the paged lists in. Keying off our own class
   * (rather than the pager module's) keeps the other infinite-scroll views
   * (articles, editorial search) unaffected.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_views_view__events')]
  public function addMonthSeparatorWrapper(array &$variables): void {
    if (empty($variables['rows'])) {
      return;
    }
    $variables['rows']['#theme_wrappers']['container']['#attributes']['class'][] = 'content-list-month-wrapper';
  }

  /**
   * Stacks consecutive event instances from the same series in related content.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_dpl_related_content')]
  public function stackRelatedEvents(array &$variables): void {
    if (empty($variables['items']) || !is_array($variables['items'])) {
      return;
    }
    $variables['items'] = $this->eventRowGrouper->stackSeries($variables['items']);
  }

  /**
   * Check if the event has free tickets.
   */
  protected function hasFreeTickets(FieldableEntityInterface $entity): bool {
    $categories_fields_to_check = ['event_ticket_categories', 'field_ticket_categories'];

    // Use categories_fields_to_check because the categories field name is
    // different for event series and instances.
    foreach ($categories_fields_to_check as $field) {
      if ($entity->hasField($field)) {
        $ticket_categories = $entity->get($field)->referencedEntities();
        foreach ($ticket_categories as $ticket_category) {
          $ticket_category_price_fields = $ticket_category->get('field_ticket_category_price')
            ->getValue();
          foreach ($ticket_category_price_fields as $ticket_price) {
            if ($ticket_price['value'] == 0) {
              return TRUE;
            }
          }
        }
      }
    }
    return FALSE;
  }

}
