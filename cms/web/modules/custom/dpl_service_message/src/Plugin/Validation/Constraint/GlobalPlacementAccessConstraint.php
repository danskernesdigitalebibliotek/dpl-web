<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\Validation\Constraint;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Validation\Attribute\Constraint;
use Symfony\Component\Validator\Constraint as SymfonyConstraint;

/**
 * The global bar is behind its own permission.
 */
#[Constraint(
  id: 'GlobalPlacementAccess',
  label: new TranslatableMarkup('Global service message access', [], ['context' => 'Validation'])
)]
class GlobalPlacementAccessConstraint extends SymfonyConstraint {

  /**
   * Shown when the user may not place a message in the global bar.
   */
  public string $message = 'You do not have permission to place a service message on the whole site.';

}
