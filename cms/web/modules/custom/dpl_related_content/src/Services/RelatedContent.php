<?php

namespace Drupal\dpl_related_content\Services;

use Drupal\Core\Database\Connection;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\dpl_related_content\RelatedContentListStyle;
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
   * The translation service.
   */
  protected TranslationInterface $translation;

  /**
   * The minimum of items that must be in the list.
   */
  public int $minItems = 4;

  /**
   * How many items we max display in the list.
   */
  public int $maxItems = 16;

  /**
   * The field on nodes, to sort by. By default, the newest created content.
   */
  public string $nodeSortField = 'created';

  /**
   * The node bundles that should show up in the results.
   *
   * @var string[]
   *  List of node bundles - e.g. articles.
   */
  public array $nodeBundles = ['article'];

  /**
   * If events should be included in the results.
   */
  public bool $includeEvents = TRUE;

  /**
   * A possible entity UUID, that will not get included in results.
   *
   * We use UUID instead of IDs, as UUID will be unique across entity types,
   * and means we don't need to worry about sending a node UUID along to a
   * event query.
   */
  public ?string $excludedUuid = NULL;

  /**
   * Tag term IDs, to look for.
   *
   * @var int[]
   *  List of term IDs
   */
  private array $tags = [];

  /**
   * Tag categories IDs, to look for.
   *
   * @var int[]
   *  List of term IDs
   */
  private array $categories = [];

  /**
   * Tag branch IDs, to look for.
   *
   * @var int[]
   *  List of branch IDs
   */
  private array $branches = [];

  /**
   * What the results are based on - helps with debugging.
   *
   * @var string[]
   *  The types of filters that can be used.
   */
  private array $resultBasis = [];

  /**
   * If TRUE, the filter conditions will be AND - otherwise, they will be OR.
   */
  public bool $andConditions = FALSE;

  /**
   * If we should allow a simple date lookup if not enough matches are found.
   */
  public bool $allowDateFallback = TRUE;

  /**
   * What type of list do we want the items to be displayed in?
   */
  private RelatedContentListStyle $listStyle = RelatedContentListStyle::Slider;

  /**
   * The title that may be shown as part of the list.
   */
  public ?string $title = NULL;

  /**
   * View mode to use for displaying individual content item.
   */
  public string $contentViewMode = 'card';

  /**
   * {@inheritdoc}
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    Connection $connection,
    TranslationInterface $translation,
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->connection = $connection;
    $this->translation = $translation;

    $this->title = $this->translation->translate('Related content', [], ['context' => 'DPL related content']);
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
    $this->excludedUuid = $entity->uuid();

    $tags_field_name = 'field_tags';
    $categories_field_name = 'field_categories';
    $branches_field_name = 'field_branch';

    // Other entity types have different field names, because of inheritance.
    if ($entity instanceof EventInstance) {
      $tags_field_name = 'event_tags';
      $categories_field_name = 'event_categories';
      $branches_field_name = 'branch';
    }

    $tags = ($entity->hasField($tags_field_name)) ? $entity->get($tags_field_name)->referencedEntities() : [];
    $categories = ($entity->hasField($categories_field_name)) ? $entity->get($categories_field_name)->referencedEntities() : [];
    $branches = ($entity->hasField($branches_field_name)) ? $entity->get($branches_field_name)->referencedEntities() : [];

    $this->setTags($tags);
    $this->setCategories($categories);
    $this->setBranches($branches);

    return $this->getContent();
  }

  /**
   * Get matching node IDs.
   *
   * Allows passing along various term IDs, that we look for in filter group.
   *
   * @return array<mixed>
   *   List of content render arrays.
   */
  public function getContent(): array {

    $event_ids = [];
    $node_ids = [];

    if ($this->andConditions) {
      // First, let's look up related content, based only on tags.
      if (!empty($this->tags)) {
        $node_ids = $this->getNodeIds($this->tags);
        $event_ids = $this->getEventInstanceIds($this->tags);
        $this->resultBasis = ['tags'];
      }

      // If we found less than minimum results, we'll add categories to the mix
      // in addition to tags.
      if ((count($event_ids) + count($node_ids) < $this->minItems) && !empty($this->categories)) {
        $node_ids = $this->getNodeIds($this->tags, $this->categories);
        $event_ids = $this->getEventInstanceIds($this->tags, $this->categories);
        $this->resultBasis = ['tags', 'categories'];
      }

      // If we found less than minimum results, we'll add branches to the mix in
      // addition to tags and categories.
      if ((count($event_ids) + count($node_ids) < $this->minItems) && !empty($this->branches)) {
        $node_ids = $this->getNodeIds($this->tags, $this->categories, $this->branches);
        $event_ids = $this->getEventInstanceIds($this->tags, $this->categories, $this->branches);
        $this->resultBasis = ['tags', 'categories', 'branches'];
      }
    }
    else {
      $node_ids = $this->getNodeIds($this->tags, $this->categories, $this->branches);
      $event_ids = $this->getEventInstanceIds($this->tags, $this->categories, $this->branches);
      $this->resultBasis = ['tags', 'categories', 'branches'];
    }

    if ($this->allowDateFallback) {
      // If the count is still under minimum, we'll find the upcoming events,
      // and the latest nodes instead.
      if (count($event_ids) + count($node_ids) < $this->minItems) {
        $node_ids = $this->getNodeIds();
        $event_ids = $this->getEventInstanceIds();
        $this->resultBasis = ['date'];
      }
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

    for ($i = 0; $i < $length;) {
      if ($i >= $this->maxItems) {
        break;
      }

      if (isset($events[$i])) {
        $content[] = $event_view_builder->view($events[$i], $this->contentViewMode);
        $i++;
      }

      if ($i >= $this->maxItems) {
        break;
      }

      if (isset($nodes[$i])) {
        $content[] = $node_view_builder->view($nodes[$i], $this->contentViewMode);
        $i++;
      }
    }

    return [
      '#theme' => 'dpl_related_content',
      '#title' => $this->title,
      '#items' => $content,
      '#list_style' => $this->listStyle,
      '#result_basis' => $this->resultBasis,
      // The results should be cached, but, they have a lot of dependencies -
      // even depending on the current time (finding future events).
      // The individual pieces of content are cached themselves, so for the full
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
   * Allow passing along various term IDs, that we look for in filter group.
   *
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
  private function getNodeIds(array $tags = [], array $categories = [], array $branches = []): array {
    if (empty($this->nodeBundles)) {
      return [];
    }

    $query = $this->entityTypeManager->getStorage('node')->getQuery();

    $query->accessCheck(TRUE);

    if (!empty($this->excludedUuid)) {
      $query->condition('uuid', $this->excludedUuid, '<>');
    }

    $query
      ->condition('type', $this->nodeBundles, 'IN')
      ->sort($this->nodeSortField, 'DESC')
      // We know that we will never need more than the maximum items,
      // so we will limit the query to this.
      ->range(0, $this->maxItems);

    if (!empty($tags) || !empty($categories) || !empty($branches)) {
      if ($this->andConditions) {
        $condition_group = $query->andConditionGroup();

        // To avoid errors, related to the GROUP only containing one condition,
        // we'll add a fake condition to fill out a possible empty space.
        $condition_group->condition('title', 'ALWAYS_TRUE', '<>');
      }
      else {
        $condition_group = $query->orConditionGroup();

        // To avoid errors, related to the GROUP only containing one condition,
        // we'll add a fake condition to fill out a possible empty space.
        $condition_group->condition('title', 'ALWAYS_FALSE');
      }

      if (!empty($tags)) {
        $condition_group->condition('field_tags', $tags, 'IN');
      }

      if (!empty($categories)) {
        $condition_group->condition('field_categories', $categories, 'IN');
      }

      if (!empty($branches)) {
        $condition_group->condition('field_branch', $branches, 'IN');
      }

      $query->condition($condition_group);
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
  private function getEventInstanceIds(array $tags = [], array $categories = [], array $branches = []): array {
    if (!$this->includeEvents) {
      return [];
    }

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
      if ($this->andConditions) {
        $condition_group = $subquery->andConditionGroup();

        // To avoid errors, related to the GROUP only containing one condition,
        // we'll add a fake condition to fill out a possible empty space.
        $condition_group->condition('title', 'ALWAYS_TRUE', '<>');
      }
      else {
        $condition_group = $subquery->orConditionGroup();

        // To avoid errors, related to the GROUP only containing one condition,
        // we'll add a fake condition to fill out a possible empty space.
        $condition_group->condition('title', 'ALWAYS_FALSE');
      }

      if (!empty($tags)) {
        $condition_group->condition('es_tags.field_tags_target_id', $tags, 'IN');
      }

      if (!empty($categories)) {
        $condition_group->condition('es_cats.field_categories_target_id', $categories, 'IN');
      }

      if (!empty($branches)) {
        $condition_group->condition('es_bra.field_branch_target_id', $branches, 'IN');
      }

      $subquery->condition($condition_group);
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

    if (!empty($this->excludedUuid)) {
      $query->condition('ei.uuid', $this->excludedUuid, '<>');
    }

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
   * Setter for tags.
   *
   * @param int[]|string[]|\Drupal\taxonomy\TermInterface[] $tags
   *   The tags to set.
   *
   * @return int[]
   *   The tag IDs.
   */
  public function setTags(array $tags) {
    $this->tags = $this->getReferenceIds($tags);
    return $this->tags;
  }

  /**
   * Setter for categories.
   *
   * @param int[]|string[]|\Drupal\taxonomy\TermInterface[] $categories
   *   The categories to set.
   *
   * @return int[]
   *   The category IDs.
   */
  public function setCategories(array $categories) {
    $this->categories = $this->getReferenceIds($categories);
    return $this->categories;
  }

  /**
   * Setter for branches.
   *
   * @param int[]|string[]|\Drupal\node\NodeInterface[] $branches
   *   The branches to set.
   *
   * @return int[]
   *   The branch IDs.
   */
  public function setBranches(array $branches) {
    $this->branches = $this->getReferenceIds($branches);
    return $this->branches;
  }

  /**
   * Setter for list style, and the auto-effects on maxItems and item viewmode.
   */
  public function setListStyle(RelatedContentListStyle $list_style): RelatedContentListStyle {
    $this->listStyle = $list_style;

    if ($this->listStyle == RelatedContentListStyle::EventList) {
      $this->contentViewMode = 'list_teaser';
    }

    if ($this->listStyle == RelatedContentListStyle::Grid) {
      $this->maxItems = 6;
    }

    return $this->listStyle;
  }

  /**
   * Parsing a list that may be an entity or simple ID array, to int[].
   *
   * @param int[]|string[]|FieldableEntityInterface[] $entities
   *   The entities, or an array of IDs that may be strings or ints.
   *
   * @return int[]
   *   The entity IDs.
   */
  private function getReferenceIds(array $entities): array {
    $ids = [];

    foreach ($entities as $entity) {
      if ($entity instanceof FieldableEntityInterface) {
        $ids[] = intval($entity->id());
        continue;
      }

      $ids[] = intval($entity);
    }

    return $ids;
  }

}
