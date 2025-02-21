<?php

namespace Drupal\bnf\Plugin\FieldTypeTraits;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationWorkId\WorkId;
use Spawnia\Sailor\ObjectLike;

/**
 * Helper trait, for dealing with material work ID fields.
 */
trait MaterialWorkIdTrait {

  /**
   * Getting Drupal-ready value from object.
   *
   * @return mixed[]
   *   The value that can be used with Drupal ->set().
   */
  public function getMaterialValue(WorkId|ObjectLike|null $workId): array {
    if (is_null($workId)) {
      return [];
    }
    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationWorkId\WorkId $workId */

    return [
      'value' => $workId->work_id,
      'material_type' => $workId->material_type,
    ];
  }

}
