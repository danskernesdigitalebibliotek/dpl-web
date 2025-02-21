<?php

namespace Drupal\bnf\Plugin\FieldTypeTraits;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime;
use Drupal\Core\Datetime\DrupalDateTime;
use Spawnia\Sailor\ObjectLike;

/**
 * Helper trait, for dealing with DateTime fields.
 */
trait DateTimeTrait {

  /**
   * Getting Drupal-ready value from object.
   *
   * @return mixed[]
   *   The value that can be used with Drupal ->set().
   */
  public function getDateTimeValue(DateTime|ObjectLike|null $dateTime, bool $includeTime = TRUE): array {
    if (is_null($dateTime)) {
      return [];
    }

    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime $dateTime */
    $date = DrupalDateTime::createFromTimestamp($dateTime->timestamp);
    $date->setTimezone(new \DateTimeZone($dateTime->timezone));

    return [
      'value' => $includeTime ? $date->format('Y-m-d\TH:i:s') : $date->format('Y-m-d'),
    ];
  }

}
