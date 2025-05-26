<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink\Link;

/**
 * Mapping Link data.
 */
#[BnfMapper(
  id: Link::class,
  )]
class FieldHeroLinkMapper extends BnfMapperImportedLinkFieldPluginBase {

}
