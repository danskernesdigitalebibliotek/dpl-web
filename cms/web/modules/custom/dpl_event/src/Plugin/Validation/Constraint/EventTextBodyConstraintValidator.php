<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Plugin\Validation\Constraint;

use Drupal\Core\Field\EntityReferenceFieldItemListInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the EventTextBody constraint.
 */
class EventTextBodyConstraintValidator extends ConstraintValidator {

  /**
   * {@inheritdoc}
   */
  public function validate(mixed $value, Constraint $constraint): void {
    if (!$value instanceof EntityReferenceFieldItemListInterface) {
      return;
    }

    if (!$constraint instanceof EventTextBodyConstraint) {
      return;
    }

    // An instance without paragraphs of its own inherits those of its series,
    // which are validated when the series is saved.
    if ($value->getEntity()->getEntityTypeId() === 'eventinstance' && $value->isEmpty()) {
      return;
    }

    foreach ($value->referencedEntities() as $paragraph) {
      if ($paragraph->bundle() === 'text_body') {
        return;
      }
    }

    $this->context->addViolation($constraint->missingMessage);
  }

}
