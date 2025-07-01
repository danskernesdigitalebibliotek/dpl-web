<?php

namespace Drupal\dpl_fbi;

/**
 * Operators for first accession date filter when doing CQL searches in FBI API.
 *
 * @see https://fbi-api.dbc.dk/indexmapper/
 */
enum FirstAccessionDateOperator: string {

  case LaterThan = '>';

  case ExactDate = '=';

  case EarlierThan = '<';

  /**
   * Provide a human-readable representation of the enum.
   *
   * @return string
   *   Human-readable representation.
   */
  public function label(): string {
    $translation = \Drupal::translation();

    return match($this) {
      self::LaterThan => $translation->translate('Later than', [], ['context' => 'dpl_fbi'])->render(),
      self::ExactDate => $translation->translate('Exact date', [], ['context' => 'dpl_fbi'])->render(),
      self::EarlierThan => $translation->translate('Earlier than', [], ['context' => 'dpl_fbi'])->render(),
    };
  }

}
