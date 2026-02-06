<?php

namespace Drupal\bnf_client\Plugin\Validation\Constraint;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Validation\Attribute\Constraint;
use Drupal\Core\Validation\Plugin\Validation\Constraint\RegexConstraint;

/**
 * IsHttps constraint.
 *
 * Uses the RegexValidator to check thot the string starts with `https`.
 */
#[Constraint(
  id: 'IsHttps',
  label: new TranslatableMarkup('IsHttps', [], ['context' => 'Validation'])
)]
class IsHttpsConstraint extends RegexConstraint {

  public function __construct() {
    parent::__construct('/^https:/', 'Only HTTPS is supported.');
  }

}
