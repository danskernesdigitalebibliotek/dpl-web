<?php

namespace Drupal\dpl_opening_hours\Model;

use Drupal\Core\Database\Connection;
use Drupal\dpl_opening_hours\Mapping\OpeningHoursRepetitionType;
use Drupal\dpl_opening_hours\Model\Repetition\NoRepetition;
use Drupal\dpl_opening_hours\Model\Repetition\WeeklyRepetition;
use Drupal\node\NodeInterface;
use Drupal\node\NodeStorageInterface;
use Drupal\taxonomy\TermInterface;
use Drupal\taxonomy\TermStorageInterface;
use Psr\Log\LoggerInterface;
use Safe\DateTimeImmutable;
use function Safe\json_decode as json_decode;
use function Safe\json_encode as json_encode;

/**
 * Repository for managing persistence of opening hours instance value objects.
 */
class OpeningHoursRepository {

  const INSTANCE_TABLE = 'dpl_opening_hours_instance';
  const REPETITION_TABLE = 'dpl_opening_hours_repetition';

  /**
   * Constructor.
   */
  public function __construct(
    private LoggerInterface $logger,
    private Connection $connection,
    private NodeStorageInterface $branchStorage,
    private TermStorageInterface $categoryTermStorage,
  ) {}

  /**
   * Load a single opening hours instance.
   */
  public function load(int $id): ?OpeningHoursInstance {
    $result = $this->connection->select(self::INSTANCE_TABLE, self::INSTANCE_TABLE)
      ->fields(self::INSTANCE_TABLE)
      ->condition('id', $id)
      ->execute();
    if (!$result) {
      return NULL;
    }
    $data = $result->fetchAssoc();
    if (!is_array($data)) {
      return NULL;
    }

    try {
      return $this->toObject($data);
    }
    catch (\OutOfBoundsException $e) {
      $this->logger->error("Unable to load opening hours instance: %message", ["%message" => $e->getMessage()]);
      return NULL;
    }
  }

  /**
   * Load a collection of opening hours.
   *
   * @return OpeningHoursInstance[]
   *   Opening hours instances which match the provided criteria.
   */
  public function loadMultiple(int $branchId = NULL, \DateTimeInterface $fromDate = NULL, \DateTimeInterface $toDate = NULL): array {
    $query = $this->connection->select(self::INSTANCE_TABLE, self::INSTANCE_TABLE)
      ->fields(self::INSTANCE_TABLE);
    if ($branchId) {
      $query->condition('branch_nid', $branchId);
    }
    if ($fromDate) {
      $query->condition('date', $fromDate->format('Y-m-d'), '>=');
    }
    if ($toDate) {
      $query->condition('date', $toDate->format('Y-m-d'), '<=');
    }

    $result = $query->execute();
    if (!$result) {
      return [];
    }

    $possible_objects = array_map(function (array $data): ?OpeningHoursInstance {
      try {
        return $this->toObject($data);
      }
      catch (\OutOfBoundsException $e) {
        $this->logger->error("Unable to load opening hours instance: %message", ["%message" => $e->getMessage()]);
        return NULL;
      }
    }, $result->fetchAll(\PDO::FETCH_ASSOC));

    return array_filter($possible_objects);
  }

  /**
   * Insert an opening hours instance.
   *
   * @return OpeningHoursInstance[]
   *   The created instances
   */
  public function insert(OpeningHoursInstance $instance): array {
    $repetition = $instance->repetition;

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

    $repetitions = match ($storedRepetition::class) {
      NoRepetition::class => [$instance->startTime],
      WeeklyRepetition::class => new \DatePeriod($instance->startTime, new \DateInterval("P1W"), $storedRepetition->endDate),
      default => throw new \InvalidArgumentException("Unknown repetition type " . $repetition::class),
    };

    $instances = [];
    // Generate an opening hours per repetition.
    foreach ($repetitions as $date) {
      // We would normally use \Safe\$updatedOpeningHours here but there seems
      // to be a bug in the project when using add() so we stick with regular
      // \DateTimeImmutable.
      $startDate = \DateTimeImmutable::createFromInterface($date);
      // Calculate the difference from the start date of the repetition to the
      // current instance so we can adjust the end date accordingly.
      // For opening hours without repetition there is only once instance and
      // the difference/adjustment will be 0.
      $dateShift = $instance->startTime->diff($startDate);
      $endDate = \DateTimeImmutable::createFromInterface($instance->endTime)->add($dateShift);

      $repeatedInstance = new OpeningHoursInstance(
        NULL,
        $instance->branch,
        $instance->categoryTerm,
        $startDate,
        $endDate,
        $storedRepetition,
      );
      $data = $this->toFields($repeatedInstance);

      $this->connection->insert(self::INSTANCE_TABLE)
        ->fields(array_keys($data), array_values($data))
        ->execute();
      $id = intval($this->connection->lastInsertId());

      $instances[] = new OpeningHoursInstance(
        $id,
        $repeatedInstance->branch,
        $repeatedInstance->categoryTerm,
        $repeatedInstance->startTime,
        $repeatedInstance->endTime,
        $storedRepetition,
      );
    }
    return $instances;
  }

  /**
   * Update a single opening hours instance.
   */
  public function update(OpeningHoursInstance $instance): OpeningHoursInstance {
    // Create a new repetition for the instance. For now this will always
    // be no repetition.
    $repetition_id = $this->connection->insert(self::REPETITION_TABLE)
      ->fields([
        'type' => OpeningHoursRepetitionType::None->value,
        'data' => json_encode([]),
      ])
      ->execute();
    $repetition_id = intval($repetition_id);

    $data = $this->toFields($instance);
    $data['repetition_id'] = $repetition_id;

    // For now this intentionally does not handle repetitions.
    $this->connection->update(self::INSTANCE_TABLE)
      ->fields($data)
      ->condition('id', $instance->id)
      ->execute();

    return new OpeningHoursInstance(
      $instance->id,
      $instance->branch,
      $instance->categoryTerm,
      $instance->startTime,
      $instance->endTime,
      new NoRepetition($repetition_id)
    );
  }

  /**
   * Delete a single opening hours instance.
   *
   * @return bool
   *   Whether the operation was successful or not.
   */
  public function delete(int $id): bool {
    $instance = $this->load($id);
    if (!$instance) {
      return FALSE;
    }

    $numRowsAffected = $this->connection->delete(self::INSTANCE_TABLE)
      ->condition('id', $id)
      ->execute();

    // If the instance is not repeated then delete the corresponding singular
    // repetition.
    $repetition = $instance->repetition;
    if ($repetition::class === NoRepetition::class && $instance->id !== NULL) {
      $this->connection->delete(self::REPETITION_TABLE)
        ->condition('id', $repetition->id)
        ->execute();
    }

    // If a row was affected then the operation had an effect. That is a
    // success.
    return $numRowsAffected > 0;
  }

  /**
   * Convert a database row with fields to a value object.
   *
   * @param mixed[] $data
   *   The row data.
   */
  private function toObject(array $data): OpeningHoursInstance {
    $branch = $this->branchStorage->load($data['branch_nid']);
    if (!$branch || !$branch instanceof NodeInterface) {
      throw new \OutOfBoundsException("Invalid branch id {$data['branch_nid']} for opening hours instance {$data['id']}");
    }
    $categoryTerm = $this->categoryTermStorage->load($data['category_tid']);
    if (!$categoryTerm || !$categoryTerm instanceof TermInterface) {
      throw new \OutOfBoundsException("Invalid category term id {$data['category_tid']} for opening hours instance {$data['category_tid']}");
    }

    $result = $this->connection->select(self::REPETITION_TABLE)
      ->fields(self::REPETITION_TABLE, ['id', 'type', 'data'])
      ->condition('id', $data['repetition_id'])
      ->execute();
    if (!$result) {
      throw new \OutOfBoundsException("Unable to retrieve repetition for opening hours instance {$data['id']}");
    }
    $repetitionData = $result->fetchAssoc();

    if (!is_array($repetitionData)) {
      throw new \OutOfBoundsException("Unable to retrieve repetition for opening hours instance {$data['id']}");
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

    return new OpeningHoursInstance(
      $data['id'],
      $branch,
      $categoryTerm,
      new DateTimeImmutable($data['date'] . " " . $data['start_time']),
      new DateTimeImmutable($data['date'] . " " . $data['end_time']),
      $repetition
    );
  }

  /**
   * Covert a value object to database fields.
   *
   * @return mixed[]
   *   The row data.
   */
  private function toFields(OpeningHoursInstance $object): array {
    return [
      'id' => $object->id,
      'branch_nid' => $object->branch->id(),
      'category_tid' => $object->categoryTerm->id(),
      'date' => $object->startTime->format('Y-m-d'),
      'start_time' => $object->startTime->format('H:i'),
      'end_time' => $object->endTime->format('H:i'),
      'repetition_id' => $object->repetition->id,
    ];
  }

}
