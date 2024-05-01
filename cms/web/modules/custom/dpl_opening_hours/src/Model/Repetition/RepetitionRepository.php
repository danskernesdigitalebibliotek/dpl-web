<?php

namespace Drupal\dpl_opening_hours\Model\Repetition;

use Drupal\Core\Database\Connection;
use Drupal\dpl_opening_hours\Mapping\OpeningHoursRepetitionType;
use Safe\DateTimeImmutable;
use function Safe\json_decode as json_decode;
use function Safe\json_encode as json_encode;

/**
 * Repository for handling persistance for repetition instances.
 */
class RepetitionRepository {

  const REPETITION_TABLE = 'dpl_opening_hours_repetition';

  /**
   * Constructor.
   */
  public function __construct(
    private Connection $connection,
  ) {}

  /**
   * Insert a repetition.
   */
  public function insert(Repetition $repetition) : Repetition {
    if ($repetition->id) {
      // If the repetition already has an id then it has already been inserted.
      return $repetition;
    }

    // Create the initial repetition type.
    $type = match ($repetition::class) {
      NoRepetition::class => OpeningHoursRepetitionType::None,
      WeeklyRepetition::class => OpeningHoursRepetitionType::Weekly,
      default => throw new \InvalidArgumentException("Unknown repetition type " . $repetition::class),
    };
    $data = [];
    if ($repetition::class === WeeklyRepetition::class) {
      $data['endDate'] = $repetition->endDate;
    }

    $repetition_id = $this->connection->insert(self::REPETITION_TABLE)
      ->fields([
        'type' => $type->value,
        'data' => json_encode($data),
      ])
      ->execute();
    $repetition_id = intval($repetition_id);

    $storedRepetition = match ($repetition::class) {
      NoRepetition::class => new NoRepetition($repetition_id),
      WeeklyRepetition::class => new WeeklyRepetition($repetition_id, $repetition->endDate),
      default => throw new \InvalidArgumentException("Unknown repetition type " . $repetition::class),
    };

    return $storedRepetition;
  }

  /**
   * Load a repetition based on an id.
   */
  public function load(int $id) : ?Repetition {
    $result = $this->connection->select(self::REPETITION_TABLE)
      ->fields(self::REPETITION_TABLE, ['id', 'type', 'data'])
      ->condition('id', $id)
      ->execute();
    if (!$result) {
      return NULL;
    }
    $repetitionData = $result->fetchAssoc();

    if (!is_array($repetitionData)) {
      return NULL;
    }
    if ($repetitionData['type'] == OpeningHoursRepetitionType::Weekly->value) {
      $weeklyData = json_decode($repetitionData['data'], TRUE);
      $repetition = new WeeklyRepetition($repetitionData["id"], new DateTimeImmutable($weeklyData["endDate"]["date"]));
    }
    elseif ($repetitionData['type'] == OpeningHoursRepetitionType::None->value) {
      $repetition = new NoRepetition($repetitionData["id"]);
    }
    else {
      throw new \OutOfBoundsException("Invalid repetition type '{$repetitionData["type"]}' for id '{$repetitionData['id']}'");
    }

    return $repetition;
  }

  /**
   * Delete a repetition.
   *
   * @return bool
   *   Whether the operation was successful or not.
   */
  public function delete(Repetition $repetition) : bool {
    $numRowsAffected = $this->connection->delete(self::REPETITION_TABLE)
      ->condition('id', $repetition->id)
      ->execute();

    return $numRowsAffected > 0;
  }

}
