<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox;

use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\bnf\Plugin\Traits\LinkTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoLinkbox => go_linkbox.
 */
#[BnfMapper(
  id: ParagraphGoLinkbox::class,
)]
class ParagraphGoLinkboxMapper extends BnfMapperParagraphPluginBase {

  use LinkTrait;
  use ImageTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileSystemInterface $fileSystem,
    protected FileRepositoryInterface $fileRepository,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
  }

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoLinkbox)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink $goLink */
    $goLink = $object->goLinkParagraph;

    $goLinkParagraph = $this->paragraphStorage->create([
      'type' => 'go_link',
      'field_aria_label' => $goLink->ariaLabel,
      'field_target_blank' => $goLink->targetBlank,
      'field_go_link' => $this->getLinkValue($goLink->linkRequired),
    ]);

    /** @var \Drupal\paragraphs\Entity\Paragraph $goLinkParagraph */

    $goLinkParagraph->save();

    return $this->paragraphStorage->create([
      'type' => 'go_linkbox',
      'field_go_color' => $object->goColor,
      'field_go_description' => $object->goDescription,
      'field_go_image' => $this->getImageValue($object->goImage),
      'field_go_link_paragraph' => [[
        'target_id' => $goLinkParagraph->id(),
        'target_revision_id' => $goLinkParagraph->getRevisionId(),
      ],
      ],
      'field_title' => $object->title,
    ]);

  }

}
