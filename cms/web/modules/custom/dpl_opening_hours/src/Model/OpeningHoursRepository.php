<?php

namespace Drupal\dpl_opening_hours\Model;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;
use Psr\Log\LoggerInterface;
use Safe\DateTimeImmutable;

/**
 * Repository for managing persistence of opening hours instance value objects.
 */
class OpeningHoursRepository {

  const DATABASE_TABLE = 'dpl_opening_hours_instance';

  /**
   * Constructor.
   */
  public function __construct(
    private LoggerInterface $logger,
    private Connection $connection,
    private EntityStorageInterface $branchStorage,
    private EntityStorageInterface $categoryTermStorage,
  ) {}

  /**
   * Load a single opening hours instance.
   */
  public function load(int $id): ?OpeningHoursInstance {
    $result = $this->connection->select(self::DATABASE_TABLE)->condition('id', $id)->execute();
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
    $query = $this->connection->select(self::DATABASE_TABLE);
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

    $maybe_objects = array_map(function (array $data): ?OpeningHoursInstance {
      try {
        return $this->toObject($data);
      }
      catch (\OutOfBoundsException $e) {
        $this->logger->error("Unable to load opening hours instance: %message", ["%message" => $e->getMessage()]);
        return NULL;
      }
    }, $result->fetchAll(\PDO::FETCH_ASSOC));

    return array_filter($maybe_objects);
  }

  /**
   * Insert or update a single opening hours instance.
   */
  public function upsert(OpeningHoursInstance $instance): bool {
    $data = $this->toFields($instance);

    $numRowsAffected = $this->connection->upsert(self::DATABASE_TABLE)
      ->key('id')
      ->fields(array_keys($data), array_values($data))
      ->execute();

    if ($instance->id === NULL) {
      $instance->id = intval($this->connection->lastInsertId());
    }

    return $numRowsAffected > 0;
  }

  /**
   * Delete a single opening hours instance.
   */
  public function delete(int $id): bool {
    $numRowsAffected = $this->connection->delete(self::DATABASE_TABLE)
      ->condition('id', $id)
      ->execute();
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
      new DateTimeImmutable($data['date'] . " " . $data['end_time'])
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
