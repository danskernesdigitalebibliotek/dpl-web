<?php

namespace Drupal\dpl_related_content\Services;

use Drupal\Core\Database\Connection;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\recurring_events\Entity\EventInstance;

/**
 * Load related nodes and events, based on filters.
 */
class RelatedContent {

  /**
   * The entity type interface.
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * The direct DB connection.
   */
  protected Connection $connection;

  /**
   * The minimum of items that must be in the slider.
   */
  private int $minItems = 4;

  /**
   * How many items we max display in the slider.
   */
  private int $maxItems = 16;

  /**
   * The field on nodes, to sort by. By default, the newest created content.
   */
  private string $nodeSortField = 'created';

  /**
   * The node bundles that should show up in the results.
   *
   * @var string[]
   *  List of node bundles - e.g. articles.
   */
  private array $nodeBundles = ['article'];

  /**
   * {@inheritdoc}
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    Connection $connection,
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->connection = $connection;
  }

  /**
   * Get related content, based on the value context of an entity.
   *
   * @param \Drupal\Core\Entity\FieldableEntityInterface $entity
   *   The entity to check against.
   *
   * @return array<mixed>
   *   List of content render arrays.
   */
  public function getContentFromEntity(FieldableEntityInterface $entity) {
    $excluded_uuid = $entity->uuid();

    $tags_field_name = 'field_tags';
    $categories_field_name = 'field_categories';
    $branches_field_name = 'field_branch';

    // Eventinstances have different field names, as they use inheritance.
    if ($entity instanceof EventInstance) {
      $tags_field_name = 'event_tags';
      $categories_field_name = 'event_categories';
      $branches_field_name = 'branch';
    }

    $tags = $this->getTermIds($entity, $tags_field_name);
    $categories = $this->getTermIds($entity, $categories_field_name);
    $branches = $this->getTermIds($entity, $branches_field_name);

    return $this->getContent($excluded_uuid, $tags, $categories, $branches);
  }

  /**
   * Get matching node IDs.
   *
   * Allows for passing along various term IDs, that we look for in an OR group.
   *
   * @param string|null $excluded_uuid
   *   A possible entity UUID, that will not get included in results.
   *   We use UUID instead of IDs, as UUID will be unique across entity types,
   *   and means we don't need to worry about sending a node UUID along to a
   *   event query.
   * @param array<int> $tags
   *   Tag term IDs, to look for.
   * @param array<int> $categories
   *   Category term IDs, to look for.
   * @param array<int> $branches
   *   Branch term IDs, to look for.
   *
   * @return array<mixed>
   *   List of content render arrays.
   */
  public function getContent(?string $excluded_uuid = NULL, $tags = [], $categories = [], $branches = []): array {
    $event_ids = [];
    $node_ids = [];

    // First, let's look up related content, based only on tags.
    if (!empty($tags)) {
      $node_ids = $this->getNodeIds($excluded_uuid, $tags);
      $event_ids = $this->getEventInstanceIds($excluded_uuid, $tags);
    }

    // If we found less than minimum results, we'll add categories to the mix in
    // addition to tags.
    if ((count($event_ids) + count($node_ids) < $this->minItems) && !empty($categories)) {
      $node_ids = $this->getNodeIds($excluded_uuid, $tags, $categories);
      $event_ids = $this->getEventInstanceIds($excluded_uuid, $tags, $categories);
    }

    // If we found less than minimum results, we'll add branches to the mix in
    // addition to tags and categories.
    if ((count($event_ids) + count($node_ids) < $this->minItems) && !empty($branches)) {
      $node_ids = $this->getNodeIds($excluded_uuid, $tags, $categories, $branches);
      $event_ids = $this->getEventInstanceIds($excluded_uuid, $tags, $categories, $branches);
    }

    // If the count is still under minimum, we'll find the upcoming events,
    // and the latest nodes instead.
    if (count($event_ids) + count($node_ids) < $this->minItems) {
      $node_ids = $this->getNodeIds($excluded_uuid);
      $event_ids = $this->getEventInstanceIds($excluded_uuid);
    }

    // If we still have less than minimum, we just won't display anything.
    if (count($event_ids) + count($node_ids) < $this->minItems) {
      return [];
    }

    $events = $this->entityTypeManager->getStorage('eventinstance')->loadMultiple($event_ids);
    $nodes = $this->entityTypeManager->getStorage('node')->loadMultiple($node_ids);

    // We want to combine events and nodes into a single array, however,
    // we want to interlace them, so it becomes mixed, rather than just
    // all the nodes and then all the events.
    // We could also sort the merging based on the actual date values, but this
    // will be too expensive for what it is worth.
    $content = [];

    // Remove array keys, so we can do the sorting.
    $events = array_values($events);
    $nodes = array_values($nodes);

    $node_view_builder = $this->entityTypeManager->getViewBuilder('node');
    $event_view_builder = $this->entityTypeManager->getViewBuilder('eventinstance');

    // We find the longer array, to do a simple FOR loop.
    $length = max(count($events), count($nodes));

    for ($i = 0; $i < $length; $i++) {
      if ($i >= $this->maxItems) {
        break;
      }

      if (isset($events[$i])) {
        $content[] = $event_view_builder->view($events[$i], 'card');
      }

      if (isset($nodes[$i])) {
        $content[] = $node_view_builder->view($nodes[$i], 'card');
      }
    }

    return [
      '#theme' => 'dpl_related_content_slider',
      '#items' => $content,
      // The results should be cached, but, they have a lot of dependencies -
      // even depending on the current time (finding future events).
      // The individual peices of content are cached themselves, so for the full
      // result list, we'll add an easily-invalidated cache, with a bunch of
      // cache tags, and even a time-based cache.
      '#cache' => [
        // Max age of 12 hours.
        '#max-age' => (60 * 60 * 12),
        '#tags' => ['eventinstance_list', 'eventseries_list', 'node_list'],
      ],
    ];
  }

  /**
   * Get matching node IDs.
   *
   * Allows for passing along various term IDs, that we look for in an OR group.
   *
   * @param string|null $excluded_uuid
   *   A possible entity UUID, that will not get included in results.
   * @param array<int> $tags
   *   Tag term IDs, to look for.
   * @param array<int> $categories
   *   Category term IDs, to look for.
   * @param array<int> $branches
   *   Branch term IDs, to look for.
   *
   * @return array<int|string>
   *   Matching node IDs
   */
  private function getNodeIds(?string $excluded_uuid = NULL, array $tags = [], array $categories = [], array $branches = []): array {
    $query = $this->entityTypeManager->getStorage('node')->getQuery();

    $query->accessCheck(TRUE);

    $query
      ->condition('type', $this->nodeBundles, 'IN')
      ->condition('uuid', $excluded_uuid, '<>')
      ->sort($this->nodeSortField, 'DESC')
      // We know that we will never need more than the maximum items,
      // so we will limit the query to this.
      ->range(0, $this->maxItems);

    if (!empty($tags) || !empty($categories) || empty($branches)) {
      // Use a condition group for OR logic.
      $or_group = $query->orConditionGroup();

      // To avoid errors, related to the OR GROUP only containing one condition,
      // we'll add a fake condition to fill out a possible empty space.
      $or_group->condition('title', 'ALWAYS_FALSE');

      if (!empty($tags)) {
        $or_group->condition('field_tags', $tags, 'IN');
      }

      if (!empty($categories)) {
        $or_group->condition('field_categories', $categories, 'IN');
      }

      if (!empty($branches)) {
        $or_group->condition('field_branch', $branches, 'IN');
      }

      $query->condition($or_group);
    }

    return $query->execute();
  }

  /**
   * Get matching eventinstance IDs.
   *
   * Allows for passing along various term IDs, that we look for in an OR group.
   * Notice - we only look for the term values on series level, ignoring
   * inheritance overriding in favor of a simpler codebase.
   *
   * @param string|null $excluded_uuid
   *   A possible entity UUID, that will not get included in results.
   * @param array<int> $tags
   *   Tag term IDs, to look for.
   * @param array<int> $categories
   *   Category term IDs, to look for.
   * @param array<int> $branches
   *   Branch term IDs, to look for.
   *
   * @return array<int|string>
   *   Matching eventinstance IDs
   *
   * @throws \Exception
   */
  private function getEventInstanceIds(?string $excluded_uuid = NULL, array $tags = [], array $categories = [], array $branches = []): array {
    $date = new DrupalDateTime('today');
    $date->setTimezone(new \DateTimezone(DateTimeItemInterface::STORAGE_TIMEZONE));
    $formatted_date = $date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);

    // Ideally, we'd use EntityQueries instead of a direct DB connection, but
    // because we need to do some pretty complicated JOINs and subqueries, it
    // is not an option.
    $connection = $this->connection;

    // Prepare a subquery for eventseries IDs based on terms.
    $subquery = $connection->select('eventseries', 'es');
    $subquery->fields('es', ['id']);

    // Join the term field tables.
    // @todo this only looks at the values on the eventseries.
    // Ideally, we'd want to also look if values exist on the instance level.
    $subquery->leftJoin('eventseries__field_tags', 'es_tags', 'es.id = es_tags.entity_id');
    $subquery->leftJoin('eventseries__field_categories', 'es_cats', 'es.id = es_cats.entity_id');
    $subquery->leftJoin('eventseries__field_branch', 'es_bra', 'es.id = es_bra.entity_id');

    if (!empty($tags) || !empty($categories) || !empty($branches)) {
      $or_group = $subquery->orConditionGroup();

      // To avoid errors, related to the OR GROUP only containing one condition,
      // we'll add a fake condition to fill out a possible empty space.
      $or_group->condition('title', 'ALWAYS_FALSE');

      if (!empty($tags)) {
        $or_group->condition('es_tags.field_tags_target_id', $tags, 'IN');
      }

      if (!empty($categories)) {
        $or_group->condition('es_cats.field_categories_target_id', $categories, 'IN');
      }

      if (!empty($branches)) {
        $or_group->condition('es_bra.field_branch_target_id', $branches, 'IN');
      }

      $subquery->condition($or_group);
    }

    $subquery->distinct(TRUE);

    // Main query to select eventinstance ids, joining with
    // eventinstance_field_data for condition fields.
    $query = $connection->select('eventinstance_field_data', 'eid');
    $query->join('eventinstance', 'ei', 'ei.id = eid.id');
    $query->addField('eid', 'id', 'eventinstance_id');

    if (!empty($tags) || !empty($categories) || !empty($branches)) {
      // Use the subquery to filter by eventseries_id.
      $query->condition('eid.eventseries_id', $subquery, 'IN');
    }

    $query->condition('ei.uuid', $excluded_uuid, '<>');

    // The consequence of direct DB that we cant use ->access(TRUE),
    // so instead, we'll only look up published eventinstances.
    $query->condition('eid.status', 1);

    // We only want events in the future (e.g. - active events).
    $query->condition('eid.date__value', $formatted_date, '>=');
    $query->orderBy('eid.date__value', 'ASC');
    // We know that we will never need more than the maximum items,
    // so we will limit the query to this.
    $query->range(0, $this->maxItems);

    // Add a GROUP BY clause to make results distinct by eventseries_id.
    // E.g. - don't show eventinstances that look identical.
    $query->groupBy('eid.eventseries_id');

    // Execute the query and return ids.
    $result = $query->execute();

    return $result?->fetchCol() ?? [];
  }

  /**
   * Get terms from field as an array of IDs.
   *
   * @return array<int>
   *   Term IDs.
   */
  private function getTermIds(FieldableEntityInterface $entity, string $field_name): array {
    if (!$entity->hasField($field_name)) {
      return [];
    }

    $terms = $entity->get($field_name)->getValue();
    return array_column($terms, 'target_id');
  }

}
