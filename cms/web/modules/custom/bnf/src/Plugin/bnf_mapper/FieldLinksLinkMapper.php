<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping Link data.
 */
#[BnfMapper(
  id: Link::class,
  )]
class FieldLinksLinkMapper extends BnfMapperImportReferencePluginBase {

  /**
   * {@inheritDoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof Link) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->mapLink($object);
  }

}
