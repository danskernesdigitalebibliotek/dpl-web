<?php

namespace Drupal\dpl_opening_hours\Mapping;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequestRepetition as RequestRepetition;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInnerRepetition as ResponseRepetition;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInnerRepetitionWeeklyData as WeeklyData;
use Drupal\dpl_opening_hours\Model\Repetition\NoRepetition;
use Drupal\dpl_opening_hours\Model\Repetition\Repetition;
use Drupal\dpl_opening_hours\Model\Repetition\WeeklyRepetition;

/**
 * Mapper between value objects and OpenAPI request/response objects.
 */
class RepetitionMapper {

  /**
   * Map a request repetition to a value object.
   */
  public function fromRequest(RequestRepetition|ResponseRepetition $data): Repetition {
    $repetitionType = ($data->getType() !== NULL) ? OpeningHoursRepetitionType::tryFrom($data->getType()) : NULL;
    if ($repetitionType === NULL) {
      throw new \InvalidArgumentException("Invalid repetition type '{$data->getType()}'");
    }

    if ($repetitionType === OpeningHoursRepetitionType::Weekly) {
      $repetitionEndDate = $data->getWeeklyData()?->getEndDate();
      if ($repetitionEndDate === NULL) {
        throw new \InvalidArgumentException("No end date for weekly repetition");
      }
    }

    /** @var \DateTime $endDate */
    $endDate = $data->getWeeklyData()?->getEndDate();
    return match ($data->getType()) {
      OpeningHoursRepetitionType::None->value => new NoRepetition($data->getId()),
      OpeningHoursRepetitionType::Weekly->value => new WeeklyRepetition($data->getId(), $endDate),
      default => throw new \InvalidArgumentException("Unknown repetition type '{$data->getType()}'"),
    };
  }

  /**
   * A value object to a response repetition.
   */
  public function toResponse(Repetition $repetition): ResponseRepetition {
    $repetitionType = match ($repetition::class) {
      NoRepetition::class => OpeningHoursRepetitionType::None,
      WeeklyRepetition::class => OpeningHoursRepetitionType::Weekly,
      default => throw new \InvalidArgumentException("Unknown repetition type " . $repetition::class),
    };
    $responseRepetition = (new ResponseRepetition())
      ->setId($repetition->id)
      ->setType($repetitionType->value);

    if ($repetition::class === WeeklyRepetition::class) {
      $endDate = \DateTime::createFromInterface($repetition->endDate);
      $responseRepetition->setWeeklyData((new WeeklyData())->setEndDate($endDate));
    }

    return $responseRepetition;
  }

}
