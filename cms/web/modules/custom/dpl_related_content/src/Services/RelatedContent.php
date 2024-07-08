<?php

namespace Drupal\dpl_related_content\Services;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Query\SelectInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Entity\Query\QueryInterface;
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
  public int $minItems = 1;

  /**
   * How many items we max display in the list.
   */
  public int $maxItems = 12;

  /**
   * The field on nodes, to sort by. By default, the latest publication date.
   */
  public string $nodeSortField = 'field_publication_date';

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
   * The result basis is shown in the frontend, in a data-attribute as part
   * of the list. It helps developers and technical editors see what the results
   * are based on. E.g. it may say "tags, categories".
   * In the future, we may want to display this clearer for editors.
   *
   * @var string[]
   *  The types of filters that can be used.
   */
  private array $resultBasis = [];

  /**
   * If TRUE, the outer conditions will be AND - otherwise, they will be OR.
   *
   * Outer conditions: "between filters" - e.g. between tags and categories.
   */
  public bool $outerAndConditions = FALSE;

  /**
   * If TRUE, the filter conditions will be AND - otherwise, they will be OR.
   *
   * Inner conditions: "within filters" - e.g. between tag1, tag2 etc.
   */
  public bool $innerAndConditions = FALSE;

  /**
   * What type of list do we want the items to be displayed in?
   */
  private RelatedContentListStyle $listStyle = RelatedContentListStyle::EventList;

  /**
   * The title that may be shown as part of the list.
   */
  public ?string $title = NULL;

  /**
   * The 'more link' that may be shown as part of the list.
   *
   * @var array<mixed>
   *  The render array.
   */
  public array $moreLink = [];

  /**
   * View mode to use for displaying individual content item.
   */
  public string $contentViewMode = 'card';

  /**
   * {@inheritDoc}
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

    // Other entity types have different field names, because of inheritance.
    if ($entity instanceof EventInstance) {
      $tags_field_name = 'event_tags';
      $categories_field_name = 'event_categories';
    }

    $tags = ($entity->hasField($tags_field_name)) ? $entity->get($tags_field_name)->referencedEntities() : [];
    $categories = ($entity->hasField($categories_field_name)) ? $entity->get($categories_field_name)->referencedEntities() : [];

    $this->setTags($tags);
    $this->setCategories($categories);

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

    if (empty($this->tags) && empty($this->categories) && empty($this->branches)) {
      return [];
    }

    if ($this->outerAndConditions) {
      $node_ids = $this->getNodeIds($this->tags, $this->categories);
      $event_ids = $this->getEventInstanceIds($this->tags, $this->categories);
      $this->resultBasis = ['tags', 'categories'];
    }
    else {
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
    }

    // If we still have less than minimum, we just won't display anything.
    if (count($event_ids) + count($node_ids) < $this->minItems) {
      return [];
    }

    return [
      '#theme' => 'dpl_related_content',
      '#title' => $this->title,
      '#link' => $this->moreLink,
      '#items' => $this->renderMergeResults($event_ids, $node_ids),
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
   * Merges and renders nodes and eventinstances. (N1, E1, N2, E2..).
   *
   * This function takes two arrays of objects (or any type of elements) and
   * merges them together such that elements from the two arrays are mixed.
   * If the arrays are of different lengths, the remaining elements from the
   * longer array are appended at the end.
   * We could also sort the merging based on the actual date values, but this
   * will be too expensive for what it is worth.
   *
   * @param array<int|string> $event_ids
   *   The array of node IDs.
   * @param array<int|string> $node_ids
   *   The array of eventinstance IDs.
   *
   * @return array<mixed>
   *   The merged array with rendered objects.
   */
  private function renderMergeResults(array $event_ids, array $node_ids): array {
    $events = $this->entityTypeManager->getStorage('eventinstance')->loadMultiple($event_ids);
    $nodes = $this->entityTypeManager->getStorage('node')->loadMultiple($node_ids);

    // Remove array keys, so we can do the sorting.
    $events = array_values($events);
    $nodes = array_values($nodes);

    $event_view_builder = $this->entityTypeManager->getViewBuilder('eventinstance');
    $node_view_builder = $this->entityTypeManager->getViewBuilder('node');

    $node_length = count($nodes);
    $event_length = count($events);
    $max_length = max($node_length, $event_length);
    $content = [];

    for ($i = 0; $i < $max_length; $i++) {
      if (count($content) >= $this->maxItems) {
        break;
      }

      if ($i < $event_length) {
        $content[] = $event_view_builder->view($events[$i], $this->contentViewMode);
      }

      if (count($content) >= $this->maxItems) {
        break;
      }

      if ($i < $node_length) {
        $content[] = $node_view_builder->view($nodes[$i], $this->contentViewMode);
      }
    }

    return $content;
  }

  /**
   * Getting a combined condition group, taking into account AND/OR logic.
   *
   * @param \Drupal\Core\Entity\Query\QueryInterface|SelectInterface $query
   *   The query on which we should create the condition group.
   * @param array<mixed> $filters
   *   Array of field_keys => value, that we want to look up.
   */
  private function addFilterConditions(QueryInterface|SelectInterface $query, array $filters): void {
    // Get rid of any empty filters.
    $filters = array_filter($filters);

    if (empty($filters)) {
      return;
    }

    // Creating the group that all the filters will be placed in.
    $outer_group = $this->outerAndConditions ?
      $query->andConditionGroup() : $query->orConditionGroup();

    foreach ($filters as $field_name => $values) {
      // Get rid of any empty values.
      $values = array_filter($values);

      // If we have the INNER group as OR, we can just do a simple 'IN' check,
      // and place it directly on the OUTER group.
      if (!$this->innerAndConditions) {
        $outer_group->condition($field_name, $values, 'IN');
        continue;
      }

      // If we reached this stage, innerAndConditions is TRUE, and it means
      // we need to treat each value as an AND.
      $inner_group = $query->andConditionGroup();

      // Looping through, and adding the values.
      // The reason we add a condition group for every single value, is that
      // it is the only way it creates JOIN for each value, and allows us to
      // make "CONTAINS ALL OF X".
      foreach ($values as $value) {
        $inner_group->condition($query->andConditionGroup()->condition($field_name, $value));
      }

      $outer_group->condition($inner_group);
    }

    $query->condition($outer_group);
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
   *
   * @return array<int|string>
   *   Matching node IDs
   */
  private function getNodeIds(array $tags = [], array $categories = []): array {
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
      ->condition('status', TRUE)
      ->sort($this->nodeSortField, 'DESC')
      // We know that we will never need more than the maximum items,
      // so we will limit the query to this.
      ->range(0, $this->maxItems);

    if (!empty($this->branches)) {
      $query->condition('field_branch', $this->branches, 'IN');
    }

    $filters = [
      'field_tags' => $tags,
      'field_categories' => $categories,
    ];

    $this->addFilterConditions($query, $filters);

    return $query->execute();
  }

  /**
   * Get matching EventInstance IDs.
   *
   * Allow passing along various term IDs, that we look for in filter group.
   *
   * @param array<int> $tags
   *   Tag term IDs, to look for.
   * @param array<int> $categories
   *   Category term IDs, to look for.
   *
   * @return array<int|string>
   *   Matching Event Instance IDs
   */
  private function getEventInstanceIds(array $tags = [], array $categories = []): array {
    if (!$this->includeEvents) {
      return [];
    }

    $es_query = $this->entityTypeManager->getStorage('eventseries')->getQuery();

    $es_query->condition('status', TRUE);
    $es_query->accessCheck(TRUE);

    if (!empty($this->branches)) {
      $es_query->condition('field_branch', $this->branches, 'IN');
    }

    $filters = [
      'field_tags' => $tags,
      'field_categories' => $categories,
    ];

    $this->addFilterConditions($es_query, $filters);

    $es_ids = $es_query->execute();

    // If we found no eventseries that match, we cannot look up relevant
    // eventinstances.
    if (empty($es_ids)) {
      return [];
    }

    $date = new DrupalDateTime('today');
    $date->setTimezone(new \DateTimezone(DateTimeItemInterface::STORAGE_TIMEZONE));
    $formatted_date = $date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);

    // Ideally, we'd use EntityQueries instead of a direct DB connection, but
    // EntityQuery doesn't support the GroupBy functionality that we want to
    // use to, to only get one eventinstance per eventseries.
    $query = $this->connection->select('eventinstance_field_data', 'eid');
    $query->join('eventinstance', 'ei', 'ei.id = eid.id');
    $query->addField('eid', 'id', 'eventinstance_id');

    // Match against the eventseries we found earlier.
    $query->condition('eid.eventseries_id', $es_ids, 'IN');

    if (!empty($this->excludedUuid)) {
      $query->condition('ei.uuid', $this->excludedUuid, '<>');
    }

    // The consequence of direct DB that we cant use ->access(TRUE),
    // so instead, we'll only look up published eventinstances.
    // We've however already used access() on the eventseries lookup, so this
    // should be plenty.
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
  public function setTags(array $tags): array {
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
  public function setCategories(array $categories): array {
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
  public function setBranches(array $branches): array {
    $this->branches = $this->getReferenceIds($branches);
    return $this->branches;
  }

  /**
   * Setter for list style, and the auto-effects on maxItems and item view mode.
   */
  public function setListStyle(RelatedContentListStyle $list_style): RelatedContentListStyle {
    $this->listStyle = $list_style;

    if ($this->listStyle == RelatedContentListStyle::Slider) {
      // Visually, the slider looks broken with less than 4 items,
      // or more than 16.
      $this->minItems = 4;
      $this->maxItems = 16;
    }

    if ($this->listStyle == RelatedContentListStyle::Grid) {
      // Visually, grid looks broken with less than 3 items, and does not
      // support more than 6.
      $this->minItems = 3;
      $this->maxItems = 6;
    }

    if ($this->listStyle == RelatedContentListStyle::EventList) {
      $this->contentViewMode = 'list_teaser';
      $this->minItems = 1;
      $this->maxItems = 12;
    }

    return $this->listStyle;
  }

  /**
   * Parsing a list that may be an entity or simple ID array, to int[].
   *
   * @param int[]|string[]|FieldableEntityInterface[] $entities
   *   The entities, or an array of IDs that may be strings or integers.
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
