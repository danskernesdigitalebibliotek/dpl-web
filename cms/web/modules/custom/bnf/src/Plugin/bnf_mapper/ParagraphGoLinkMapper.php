<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink;
use Drupal\bnf\Plugin\Traits\LinkTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoLinkbox => go_linkbox.
 */
#[BnfMapper(
  id: ParagraphGoLink::class,
  )]
class ParagraphGoLinkMapper extends BnfMapperParagraphPluginBase {

  use LinkTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected BnfMapperManager $mapper,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
  }

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoLink)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $goLink = $this->paragraphStorage->create([
      'type' => 'go_link',
    ]);
    $goLink->set('field_aria_label', $object->ariaLabel);
    $goLink->set('field_target_blank', $object->targetBlank);

    if ($object->linkRequired->internal) {
      /** @var \Drupal\node\Entity\Node[] $existing */
      $existing = $this->entityTypeManager->getStorage('node')->loadByProperties(['uuid' => $object->linkRequired->id]);

      if ($existing) {
        $node = reset($existing);
      }

      $goLink->set('field_go_link', [
        'uri' => $node->toUrl()->toString(),
        'title' => $object->linkRequired->title,
      ]);
    }
    else {
      $goLink->set('field_go_link', $this->getLinkValue($object->linkRequired));
    }

    return $goLink;
  }

}
