<?php

declare(strict_types=1);

namespace Drupal\dpl_po\Gettext;

use Psr\Log\LoggerInterface;

/**
 * Brings the committed combined file up to date with what a scan found.
 *
 * The file is committed to git and read and written by POEditor as well, so
 * what it looks like between runs matters. POEditor keeps the messages in the
 * order it was given them and appends new ones at the end. Doing the same here
 * means a run with no new strings changes nothing, and a run with new strings
 * adds them at the end.
 */
final class PoCombiner {

  /**
   * Class constructor.
   *
   * @param \Psr\Log\LoggerInterface $logger
   *   Where to report what changed.
   */
  public function __construct(
    protected LoggerInterface $logger,
  ) {}

  /**
   * Combine the committed file with the messages the scan found.
   *
   * The result holds exactly the messages of the scan: those already in the
   * committed file in their existing order, the rest appended in scan order.
   * The header is the committed one.
   *
   * The committed file is the one POEditor last exported, so its translations
   * and flags are kept where it has them. The scan's translation is used for
   * a message the committed file does not translate.
   *
   * Windows line breaks are turned into Unix ones on both sides: POEditor does
   * that on import, so keeping them would drop and re-add those messages on
   * every round. The strings are untranslatable in Drupal either way until
   * the line breaks are fixed at the source.
   *
   * @param \Drupal\dpl_po\Gettext\PoMessage[] $committed
   *   The messages of the committed file. Empty when there is none yet.
   * @param \Drupal\dpl_po\Gettext\PoMessage[] $scanned
   *   The messages the scan found. The first occurrence of a message wins.
   *
   * @return \Drupal\dpl_po\Gettext\PoMessage[]
   *   The combined messages, header first.
   */
  public function combine(array $committed, array $scanned): array {
    $header = NULL;
    $found = [];
    foreach ($scanned as $message) {
      $message = $message->withUnixLineBreaks();
      if ($message->isHeader()) {
        $header ??= $message;
        continue;
      }
      $found[$message->key()] ??= $message;
    }

    $result = [];
    $dropped = 0;
    foreach ($committed as $message) {
      $message = $message->withUnixLineBreaks();
      if ($message->isHeader()) {
        $header = $message;
        continue;
      }
      $key = $message->key();
      if (!isset($found[$key])) {
        $dropped++;
        continue;
      }
      $result[$key] = $this->merge($message, $found[$key]);
    }
    $kept = count($result);

    foreach ($found as $key => $message) {
      $result[$key] ??= $message;
    }
    $added = count($result) - $kept;

    $this->logger->info(sprintf('Kept %d messages, added %d, dropped %d.', $kept, $added, $dropped));

    return array_values(array_filter([$header, ...$result]));
  }

  /**
   * The scanned message, carrying the committed translation where it has one.
   *
   * The source and plural come from the scan: they are what the code says
   * now. The translation is only carried over when it fits the number of
   * forms, which changes when a string turns plural or back.
   */
  protected function merge(PoMessage $committed, PoMessage $scanned): PoMessage {
    if (!$committed->isTranslated() || count($committed->translations) !== count($scanned->translations)) {
      return $scanned->withTranslations($scanned->translations, $committed->flags);
    }
    return $scanned->withTranslations($committed->translations, $committed->flags);
  }

}
