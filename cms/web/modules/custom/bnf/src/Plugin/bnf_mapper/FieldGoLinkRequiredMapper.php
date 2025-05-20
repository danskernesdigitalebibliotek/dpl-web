<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;

/**
 * Mapping Link data.
 */
#[BnfMapper(
  id: Link::class,
  )]
class FieldGoLinkRequiredMapper extends BnfMapperImportedLinkFieldPluginBase {

}
