<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink;
use Drupal\bnf\Plugin\Traits\LinkTrait;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
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
    protected ImportContextStack $importContext,
    protected BnfImporter $importer,
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

    if ($object->linkRequired->internal) {
      // Recursion protection.
      if ($this->importContext->size() > 3) {
        return NULL;
      }
      /** @var \Drupal\node\Entity\Node[] $existing */
      $existing = $this->entityTypeManager->getStorage('node')->loadByProperties(['uuid' => $object->linkRequired->id]);

      if ($existing) {
        $node = reset($existing);
      }
      else {
        $node = $this->importer->importNode($object->linkRequired->id, $this->importContext->current());
      }

      $goLinkValue = [
        'uri' => $node->toUrl()->toString(),
        'title' => $object->linkRequired->title,
      ];
    }
    else {
      $goLinkValue = $this->getLinkValue($object->linkRequired);
    }

    $goLink = $this->paragraphStorage->create([
      'type' => 'go_link',
    ]);
    $goLink->set('field_aria_label', $object->ariaLabel);
    $goLink->set('field_target_blank', $object->targetBlank);
    $goLink->set('field_go_link', $goLinkValue);


    return $goLink;
  }

}
