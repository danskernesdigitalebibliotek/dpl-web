<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody;

use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphTextBody => text_body.
 */
#[BnfMapper(
  id: ParagraphTextBody::class,
  )]
class ParagraphTextBodyMapper extends BnfMapperParagraphPluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof ParagraphTextBody) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\paragraphs\ParagraphInterface $paragraph */
    $paragraph = $this->paragraphStorage->create([
      'type' => 'text_body',
    ]);

    $paragraph->set('field_body', [
      'value' => $object->body->value ?? '',
      'format' => $object->body->format ?? '',
    ]);

    return $paragraph;
  }

}
