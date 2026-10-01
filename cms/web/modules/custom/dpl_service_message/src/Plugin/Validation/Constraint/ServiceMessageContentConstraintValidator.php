<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\Validation\Constraint;

use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the ServiceMessageContent constraint.
 */
class ServiceMessageContentConstraintValidator extends ConstraintValidator {

  /**
   * {@inheritdoc}
   */
  public function validate(mixed $value, Constraint $constraint): void {
    if (!$value instanceof NodeInterface || $value->bundle() !== ServiceMessageLoader::BUNDLE) {
      return;
    }

    if (!$constraint instanceof ServiceMessageContentConstraint) {
      return;
    }

    if ($value->get('field_svcmsg_heading')->isEmpty() && $value->get('field_svcmsg_body')->isEmpty()) {
      $this->context->buildViolation($constraint->emptyMessage)
        ->atPath('field_svcmsg_heading')
        ->addViolation();
    }

    $in_page = $value->get('field_svcmsg_placement')->getString() === ServiceMessagePlacement::InPage->value;
    $frontpage = (bool) $value->get('field_svcmsg_frontpage')->value;

    if ($in_page && !$frontpage && $value->get('field_svcmsg_branches')->isEmpty()) {
      $this->context->buildViolation($constraint->noTargetMessage)
        ->atPath('field_svcmsg_frontpage')
        ->addViolation();
    }
  }

}
