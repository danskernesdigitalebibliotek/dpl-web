<?php

namespace Drupal\dpl_event;

/**
 * The paging modes available for the events list.
 *
 * Editors pick one of these on the event settings form. Each mode maps to a
 * number of events shown per load and whether further events appear behind a
 * "Show more" button or load automatically as the visitor scrolls (infinite
 * scroll). The chosen mode is applied to the 'events' view at runtime in
 * \Drupal\dpl_event\Hook\EventListPagingHooks.
 */
enum EventListPaging: string {

  // 25 events per load, with a "Show more" button.
  case ShowMore25 = 'show_more_25';

  // 50 events per load, with a "Show more" button.
  case ShowMore50 = 'show_more_50';

  // 100 events per load, with a "Show more" button.
  case ShowMore100 = 'show_more_100';

  // 100 events initially, then infinite scroll loads the rest automatically.
  case Infinite100 = 'infinite_100';

  // The mode used when a site has not configured anything else.
  const DEFAULT_MODE = self::ShowMore25;

  /**
   * The number of events shown per load for this mode.
   */
  public function itemsPerPage(): int {
    return match($this) {
      self::ShowMore25 => 25,
      self::ShowMore50 => 50,
      self::ShowMore100 => 100,
      self::Infinite100 => 100,
    };
  }

  /**
   * Whether further events load automatically as the visitor scrolls.
   *
   * When FALSE the visitor loads more events by clicking a "Show more" button.
   */
  public function automaticallyLoadContent(): bool {
    return match($this) {
      self::ShowMore25 => FALSE,
      self::ShowMore50 => FALSE,
      self::ShowMore100 => FALSE,
      self::Infinite100 => TRUE,
    };
  }

  /**
   * A human-readable label for this mode, for use in the settings form.
   */
  public function label(): string {
    $translation = \Drupal::translation();

    return match($this) {
      self::ShowMore25 => $translation->translate('Show 25 events, then a "Show more" button', [], ['context' => 'dpl_event'])->render(),
      self::ShowMore50 => $translation->translate('Show 50 events, then a "Show more" button', [], ['context' => 'dpl_event'])->render(),
      self::ShowMore100 => $translation->translate('Show 100 events, then a "Show more" button', [], ['context' => 'dpl_event'])->render(),
      self::Infinite100 => $translation->translate('Show 100 events, then load the rest automatically while scrolling', [], ['context' => 'dpl_event'])->render(),
    };
  }

  /**
   * Options for a form select element, keyed by mode value.
   *
   * @return array<string, string>
   *   Mode value => human-readable label.
   */
  public static function formOptions(): array {
    $options = [];
    foreach (self::cases() as $mode) {
      $options[$mode->value] = $mode->label();
    }
    return $options;
  }

}
