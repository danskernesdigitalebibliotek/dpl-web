<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\Validation\Constraint;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Validation\Attribute\Constraint;
use Symfony\Component\Validator\Constraint as SymfonyConstraint;

/**
 * A service message needs something to say, and somewhere to say it.
 */
#[Constraint(
  id: 'ServiceMessageContent',
  label: new TranslatableMarkup('Service message content', [], ['context' => 'Validation'])
)]
class ServiceMessageContentConstraint extends SymfonyConstraint {

  /**
   * Shown when both heading and body are left empty.
   */
  public string $emptyMessage = 'A service message needs a heading, a body text, or both.';

  /**
   * Shown when an in-page message names no page to appear on.
   */
  public string $noTargetMessage = 'Select the front page, one or more branches, or both. Otherwise the message has nowhere to appear.';

}
