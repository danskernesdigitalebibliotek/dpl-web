<?php

namespace Drupal\dpl_opening_hours\Model;

use Drupal\Core\Database\Connection;
use Drupal\dpl_opening_hours\Mapping\OpeningHoursRepetitionType;
use Drupal\dpl_opening_hours\Model\Repetition\NoRepetition;
use Drupal\node\NodeInterface;
use Drupal\node\NodeStorageInterface;
use Drupal\taxonomy\TermInterface;
use Drupal\taxonomy\TermStorageInterface;
use Psr\Log\LoggerInterface;
use Safe\DateTimeImmutable;

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
   * Insert or update a single opening hours instance.
   *
   * Decision on whether to insert or update depends on whether the instance
   * has an id. If the instance does not, and it is inserted then it will
   * be updated with the resulting id.
   *
   * @return OpeningHoursInstance
   *   The updated instance
   */
  public function upsert(OpeningHoursInstance $instance): OpeningHoursInstance {
    $data = $this->toFields($instance);

    if ($instance->repetition->id === NULL) {
      $type = match ($instance->repetition::class) {
        NoRepetition::class => OpeningHoursRepetitionType::None,
        default => OpeningHoursRepetitionType::None,
      };
      $repetition_id = $this->connection->insert(self::REPETITION_TABLE)
        ->fields(['type' => $type->value])
        ->execute();
    }
    else {
      $repetition_id = $instance->repetition->id;
    }
    $data['repetition_id'] = $repetition_id;
    $repetiton = new NoRepetition($repetition_id);

    $this->connection->upsert(self::INSTANCE_TABLE)
      ->key('id')
      ->fields(array_keys($data), array_values($data))
      ->execute();

    $id = $instance->id ?? intval($this->connection->lastInsertId());

    return new OpeningHoursInstance(
      $id,
      $instance->branch,
      $instance->categoryTerm,
      $instance->startTime,
      $instance->endTime,
      $repetiton,
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

    return new OpeningHoursInstance(
      $data['id'],
      $branch,
      $categoryTerm,
      new DateTimeImmutable($data['date'] . " " . $data['start_time']),
      new DateTimeImmutable($data['date'] . " " . $data['end_time']),
      new NoRepetition()
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
    ];
  }

}
