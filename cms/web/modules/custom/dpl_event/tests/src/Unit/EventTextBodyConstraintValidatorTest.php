<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_event\Unit;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Field\EntityReferenceFieldItemListInterface;
use Drupal\dpl_event\Plugin\Validation\Constraint\EventTextBodyConstraint;
use Drupal\dpl_event\Plugin\Validation\Constraint\EventTextBodyConstraintValidator;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\Tests\UnitTestCase;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Tests that event paragraphs contain a text body when they have to.
 */
class EventTextBodyConstraintValidatorTest extends UnitTestCase {

  /**
   * Provides paragraphs on events, and whether they are valid.
   *
   * @return array<string, array{string, string[], bool}>
   *   Entity type, the bundles of its paragraphs, and whether that is valid.
   */
  public static function paragraphsProvider(): array {
    return [
      'series without paragraphs' => ['eventseries', [], FALSE],
      'series without text body' => ['eventseries', ['go_video'], FALSE],
      'series with text body' => ['eventseries', ['text_body'], TRUE],
      'series with text body among others' => ['eventseries', ['medias', 'text_body'], TRUE],
      'instance inheriting from series' => ['eventinstance', [], TRUE],
      'instance without text body' => ['eventinstance', ['medias'], FALSE],
      'instance with text body' => ['eventinstance', ['text_body'], TRUE],
    ];
  }

  /**
   * Test whether a violation is added for the paragraphs of an event.
   *
   * @param string $entity_type_id
   *   The entity type of the event.
   * @param string[] $bundles
   *   The bundles of the paragraphs on the event.
   * @param bool $valid
   *   Whether the paragraphs are valid.
   *
   * @dataProvider paragraphsProvider
   */
  public function testValidation(string $entity_type_id, array $bundles, bool $valid): void {
    $event = $this->createMock(FieldableEntityInterface::class);
    $event->method('getEntityTypeId')->willReturn($entity_type_id);

    $paragraphs = array_map(function (string $bundle) {
      $paragraph = $this->createMock(ParagraphInterface::class);
      $paragraph->method('bundle')->willReturn($bundle);
      return $paragraph;
    }, $bundles);

    $field = $this->createMock(EntityReferenceFieldItemListInterface::class);
    $field->method('getEntity')->willReturn($event);
    $field->method('isEmpty')->willReturn(empty($paragraphs));
    $field->method('referencedEntities')->willReturn($paragraphs);

    $constraint = new EventTextBodyConstraint();

    $context = $this->createMock(ExecutionContextInterface::class);
    $context->expects($valid ? $this->never() : $this->once())
      ->method('addViolation')
      ->with($constraint->missingMessage);

    $validator = new EventTextBodyConstraintValidator();
    $validator->initialize($context);
    $validator->validate($field, $constraint);
  }

}
