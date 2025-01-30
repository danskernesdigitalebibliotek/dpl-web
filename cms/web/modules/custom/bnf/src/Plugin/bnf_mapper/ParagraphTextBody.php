<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody as GraphQLParagraphTextBody;
use Drupal\bnf\Plugin\BnfMapperPluginBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps article nodes.
 */
#[BnfMapper(
  id: GraphQLParagraphTextBody::class,
)]
class ParagraphTextBody extends BnfMapperPluginBase {

  /**
   * Paragraph storage to create node in.
   */
  protected EntityStorageInterface $paragraphStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->paragraphStorage = $entityTypeManager->getStorage('paragraph');
  }

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof GraphQLParagraphTextBody) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
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
