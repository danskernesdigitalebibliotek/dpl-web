<?php

namespace Drupal\bnf\Plugin\FieldTypeTraits;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link;
use Spawnia\Sailor\ObjectLike;

/**
 * Helper trait, for dealing with link fields.
 */
trait LinkTrait {

  /**
   * Getting Drupal-ready value from object.
   *
   * @return mixed[]
   *   The value that can be used with Drupal ->set().
   */
  public function getLinkValue(Link|ObjectLike|null $link): array {
    if (is_null($link)) {
      return [];
    }

    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link $link */
    if (empty($link?->title) || $link->internal) {
      return [];
    }

    return [
      'uri' => $link->url,
      'title' => $link->title,
    ];
  }

}
