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

}
