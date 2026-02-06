<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoTextBody;

use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoTextBody => go_text_body.
 */
#[BnfMapper(
  id: ParagraphGoTextBody::class,
  )]
class ParagraphGoTextBodyMapper extends BnfMapperParagraphPluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof ParagraphGoTextBody) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\paragraphs\ParagraphInterface $paragraph */
    $paragraph = $this->paragraphStorage->create([
      'type' => 'go_text_body',
    ]);

    $paragraph->set('field_body', [
      'value' => $object->body->value ?? '',
      'format' => $object->body->format ?? '',
    ]);

    return $paragraph;
  }

}
