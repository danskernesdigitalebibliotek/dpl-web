<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Plugin\Validation\Constraint;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Validation\Attribute\Constraint;
use Symfony\Component\Validator\Constraint as SymfonyConstraint;

/**
 * Event paragraphs need a text body to describe the event.
 *
 * The description of an event is read from its first text body paragraph.
 *
 * @see \Drupal\dpl_event\Entity\EventInstance::getDescription()
 */
#[Constraint(
  id: 'EventTextBody',
  label: new TranslatableMarkup('Event text body', [], ['context' => 'Validation'])
)]
class EventTextBodyConstraint extends SymfonyConstraint {

  /**
   * Shown when the paragraphs contain no text body.
   */
  public string $missingMessage = 'Add a text body paragraph describing the event.';

}
