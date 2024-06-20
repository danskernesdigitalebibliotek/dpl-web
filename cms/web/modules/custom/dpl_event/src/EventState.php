<?php

namespace Drupal\dpl_event;

/**
 * State of events.
 */
enum EventState: string {

  // The event is public but without the ability to buy tickets yet.
  case TicketSaleNotOpen = 'TicketSaleNotOpen';

  // Public event without ticking or where ticket sale is available.
  case Active = 'Active';

  // Events requiring tickets to attend where no more tickets are available.
  case SoldOut = 'SoldOut';

  // Events that were planned but will not occur for whatever reason.
  case Cancelled = 'Cancelled';

  // Events that occurred in the past.
  case Occurred = "Occurred";

  /**
   * Provide a human-readable representation of the enum.
   *
   * This is derived from the PHP documentation and the Enum Field module.
   *
   * @see https://www.php.net/manual/en/language.enumerations.examples.php#example-985
   * @see https://git.drupalcode.org/project/enum_field/-/blob/1.0.1/src/Plugin/Field/FieldType/EnumItemTrait.php?ref_type=tags#L107
   *
   * @return string
   *   Human-readable representation.
   */
  public function label(): string {
    $translation = \Drupal::translation();

    return match($this) {
      EventState::TicketSaleNotOpen => $translation->translate('Ticket sale not open', [], ['context' => 'dpl_event'])->render(),
      EventState::Active => $translation->translate('Active', [], ['context' => 'dpl_event'])->render(),
      EventState::SoldOut => $translation->translate('Sold out', [], ['context' => 'dpl_event'])->render(),
      EventState::Cancelled => $translation->translate('Canceled', [], ['context' => 'dpl_event'])->render(),
      EventState::Occurred => $translation->translate('Occurred', [], ['context' => 'dpl_event'])->render(),
    };
  }

}
