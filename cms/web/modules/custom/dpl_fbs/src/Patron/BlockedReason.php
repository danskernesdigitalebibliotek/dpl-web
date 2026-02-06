<?php

namespace Drupal\dpl_fbs\Patron;

use MyCLabs\Enum\Enum;

/**
 * Enumeration of the different reasons why a patron can be blocked in FBS.
 *
 * @extends Enum<string>
 *
 * @method static BlockedReason DECEASED()
 * @method static BlockedReason BLOCKED_FROM_SELFSERVICE()
 * @method static BlockedReason EXTENDED_SUSPENSION()
 * @method static BlockedReason SUSPENSION()
 * @method static BlockedReason ACCOUNT_STOLEN()
 * @method static BlockedReason FEE()
 * @method static BlockedReason MISSING_PATRON_CATEGORY()
 * @method static BlockedReason UNKNOWN()
 */
class BlockedReason extends Enum {

  private const DECEASED = 'D';
  private const BLOCKED_FROM_SELFSERVICE = 'S';
  private const EXTENDED_SUSPENSION = 'F';
  private const SUSPENSION = 'U';
  private const ACCOUNT_STOLEN = 'O';
  private const FEE = 'E';
  /**
   * The user has not been assigned a correct patron category.
   *
   * This should be pretty rare.
   * In Danish this is also called "Selvoprettet på web"
   */
  private const MISSING_PATRON_CATEGORY = 'W';
  /**
   * Fallback value if the blocked reason cannot be mapped to another value.
   */
  private const UNKNOWN = 'unknown';

}
