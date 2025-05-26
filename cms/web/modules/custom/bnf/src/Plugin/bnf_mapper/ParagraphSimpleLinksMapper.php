<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphSimpleLinks => simple_links.
 */
#[BnfMapper(
  id: ParagraphSimpleLinks::class,
  )]
class ParagraphSimpleLinksMapper extends BnfMapperParagraphPluginBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    protected BnfMapperManager $mapper,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
  }

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphSimpleLinks)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'simple_links',
      'field_link' => $this->mapper->mapAll($object->link, TRUE),
    ]);

  }

}
