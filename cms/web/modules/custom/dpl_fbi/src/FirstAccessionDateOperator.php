<?php

namespace Drupal\dpl_fbi;

/**
 * Operators for first accession date filter when doing CQL searches in FBI API.
 *
 * @see https://fbi-api.dbc.dk/indexmapper/
 */
enum FirstAccessionDateOperator: string {

  case GreaterThan = '>';

  case Equals = '=';

  case LessThan = '<';

  /**
   * Provide a human-readable representation of the enum.
   *
   * @return string
   *   Human-readable representation.
   */
  public function label(): string {
    $translation = \Drupal::translation();

    return match($this) {
      self::GreaterThan => $translation->translate('Greater than', [], ['context' => 'dpl_fbi'])->render(),
      self::Equals => $translation->translate('Equals', [], ['context' => 'dpl_fbi'])->render(),
      self::LessThan => $translation->translate('Less than', [], ['context' => 'dpl_fbi'])->render(),
    };
  }

}
