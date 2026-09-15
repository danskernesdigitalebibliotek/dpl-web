<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\Validation\Constraint;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the GlobalPlacementAccess constraint.
 *
 * The form alter takes the option away from the widget. This covers the saves
 * that never pass through the form - imports, migrations, an API client.
 */
class GlobalPlacementAccessConstraintValidator extends ConstraintValidator implements ContainerInjectionInterface {

  public function __construct(protected AccountProxyInterface $currentUser) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new self($container->get('current_user'));
  }

  /**
   * {@inheritdoc}
   */
  public function validate(mixed $value, Constraint $constraint): void {
    if (!$value instanceof NodeInterface || $value->bundle() !== ServiceMessageLoader::BUNDLE) {
      return;
    }

    if (!$constraint instanceof GlobalPlacementAccessConstraint) {
      return;
    }

    $global = ServiceMessagePlacement::GlobalBar->value;

    if ($value->get('field_svcmsg_placement')->getString() !== $global) {
      return;
    }

    // Only the move into the global bar is gated. Editing the text of a
    // message that is already global rides on the ordinary node permissions.
    $original = $value->getOriginal();

    if ($original instanceof NodeInterface && $original->get('field_svcmsg_placement')->getString() === $global) {
      return;
    }

    if ($this->currentUser->hasPermission('administer global service messages')) {
      return;
    }

    $this->context->buildViolation($constraint->message)
      ->atPath('field_svcmsg_placement')
      ->addViolation();
  }

}
