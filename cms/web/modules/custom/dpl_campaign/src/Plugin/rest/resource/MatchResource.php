<?php

namespace Drupal\dpl_campaign\Plugin\rest\resource;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\dpl_campaign\Input\Facet;
use Drupal\dpl_campaign\Input\Query;
use Drupal\dpl_campaign\Input\FacetRule;
use Drupal\dpl_campaign\Input\FacetValue;
use Drupal\node\NodeInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\rest\ResourceResponseInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Serializer\Exception\UnexpectedValueException;
use function Safe\json_decode;
use function Safe\json_encode;

/**
 * A resource for retrieving a campaign matching a search.
 *
 * @RestResource(
 *   id = "campaign:match",
 *   label = @Translation("Get campaign matching search result facets"),
 *   serialization_class = "",
 *   uri_paths = {
 *     "create" = "/dpl_campaign/match",
 *   },
 * )
 */
class MatchResource extends ResourceBase {

  /**
   * {@inheritDoc}
   */
  public function getPluginDefinition(): array {
    return NestedArray::mergeDeep(
      parent::getPluginDefinition(),
      [
        'payload' => [
          'name' => 'triggers',
          'description' => 'Triggers to match campaigns against',
          'in' => 'body',
          'required' => TRUE,
          'schema' => [
            'type' => 'object',
            'properties' => [
              'queries' => [
                'type' => 'array',
                'description' => 'The users free-text queries, used in a fuzzy-search.',
                'items' => [
                  'type' => 'object',
                  'properties' => [
                    'text' => [
                      'type' => 'string',
                    ],
                  ],
                ],
              ],
              'facets' => [
                'type' => 'array',
                'description' => 'A facet to match against',
                'items' => [
                  'type' => 'object',
                  'properties' => [
                    'name' => [
                      'type' => 'string',
                    ],
                    'values' => [
                      'type' => 'array',
                      'items' => [
                        'type' => 'object',
                        'properties' => [
                          'key' => [
                            'type' => 'string',
                          ],
                          'term' => [
                            'type' => 'string',
                          ],
                          'score' => [
                            'type' => 'integer',
                          ],
                        ],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
        'responses' => [
          200 => [
            'description' => 'OK',
            'schema' => [
              'type' => 'object',
              'properties' => [
                'data' => [
                  'type' => 'object',
                  'description' => 'The matching campaign',
                  'properties' => [
                    'id' => [
                      'type' => 'string',
                      'description' => 'The campaign id',
                    ],
                    'title' => [
                      'type' => 'string',
                      'description' => 'The title of the campaign',
                    ],
                    'text' => [
                      'type' => 'string',
                      'description' => 'The text to be shown for the campaign',
                    ],
                    'image' => [
                      'type' => 'object',
                      'description' => 'The image to be shown for the campaign',
                      'properties' => [
                        'url' => [
                          'type' => 'string',
                          'description' => 'The url to the image',
                        ],
                        'alt' => [
                          'type' => 'string',
                          'description' => 'The alt text for the image',
                        ],
                      ],
                    ],
                    'url' => [
                      'type' => 'string',
                      'description' => 'The url the campaign should link to',
                    ],
                  ],
                ],
              ],
            ],
          ],
          400 => [
            'description' => 'Invalid input',
          ],
          404 => [
            'description' => 'No matching campaign found',
          ],
          500 => [
            'description' => 'Internal server error',
          ],
        ],
      ]);
  }

  /**
   * Config Manager.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  protected $configManager;

  /**
   * Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The serializer.
   *
   * @var \Symfony\Component\Serializer\SerializerInterface
   */
  protected $serializer;

  /**
   * Handy Cache Tag Manager.
   *
   * @var \Drupal\handy_cache_tags\HandyCacheTagsManager
   */
  protected $handyCacheTagManager;

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * Creates an instance of the plugin.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The container to pull out services used in the plugin.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   *
   * @return static
   *   Returns an instance of this plugin.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest')
    );

    $instance->configManager = $container->get('config.manager');
    $instance->entityTypeManager = $container->get('entity_type.manager');
    $instance->serializer = $container->get('dpl_campaign.serializer');
    $instance->handyCacheTagManager = $container->get('handy_cache_tags.manager');
    $instance->database = $container->get('database');

    return $instance;
  }

  /**
   * Takes a facet-term-pairs query param and transforms it into a rules array.
   *
   * @param \Drupal\dpl_campaign\Input\Facet[] $facets
   *   Facets for a search result.
   *
   * @return \Drupal\dpl_campaign\Input\FacetRule[]
   *   Rules corresponding to the facets.
   */
  protected function transformFacetsToRules(array $facets): array {
    $known_facets = [];
    return array_merge(... array_map(function (Facet $facet) use (&$known_facets) {
      // Throw an exception if we have a duplicate facet.
      if (in_array($facet->name, $known_facets)) {
        throw new HttpException(400, "Facet group can only be presented once: {$facet->name}");
      }

      $sorted_values = $facet->values;
      usort($sorted_values, function (FacetValue $a, FacetValue $b) {
        return $b->score - $a->score;
      });

      // Store the facet name so we can check for duplicates.
      $known_facets[] = $facet->name;
      return array_map(function (FacetValue $value, int|string $index) use ($facet) {
        // With values being sorted the index will correspond to the rank.
        return new FacetRule($facet->name, $value->term, intval($index) + 1);
      }, $sorted_values, array_keys($sorted_values));
    }, $facets));
  }

  /**
   * Turns a campaign node into an object with a reduced set of properties.
   *
   * @param \Drupal\node\NodeInterface $campaign
   *   The campaign node.
   *
   * @return mixed[]
   *   A normalized data structure which can be output.
   */
  protected function formatCampaignOutput(NodeInterface $campaign): array {
    $output = ['id' => $campaign->id()];

    if (!$campaign->get('title')->isEmpty()) {
      $output['title'] = $campaign->get('title')->getString();
    }

    if (!$campaign->get('field_campaign_text')->isEmpty()) {
      $output['text'] = $campaign->get('field_campaign_text')->getString();
    }

    if ($campaign->hasField('field_campaign_media') && !$campaign->get('field_campaign_media')->isEmpty()) {
      /** @var \Drupal\media\MediaInterface $media */
      $media = $campaign->get('field_campaign_media')->entity;
      $image_field = $media->get('field_media_image');
      /** @var \Drupal\image\Plugin\Field\FieldType\ImageItem|NULL $image */
      $image = $image_field->first();
      $alt = $image?->get('alt')->getString();

      /** @var \Drupal\file\FileInterface|NULL $image_entity */
      $image_entity = $image?->entity;
      $image_style = $this->entityTypeManager->getStorage('image_style')->load('campaign_image');
      $file_uri = $image_entity?->getFileUri();

      $output['image'] = [
        'url' => $file_uri ? $image_style?->buildUrl($file_uri) : NULL,
        'alt' => $alt,
      ];
    }

    /** @var \Drupal\link\LinkItemInterface|null $link */
    $link = $campaign->get('field_campaign_link')->first();
    if ($link) {
      /** @var \Drupal\Core\GeneratedUrl $url */
      $url = $link->getUrl()->setAbsolute(TRUE)->toString(TRUE);
      $output['url'] = $url->getGeneratedUrl();
    }

    return $output;
  }

  /**
   * Finding the facet-based trigger paragraph IDs, based on search results.
   *
   * @param \Drupal\dpl_campaign\Input\FacetRule[] $facets
   *   The facets from the users search, transformed to rules.
   *
   * @return int[]|string[]
   *   Paragraph IDs matching any of the provided facet rules.
   */
  protected function findFacetParagraphIds(array $facets): array {
    if (empty($facets)) {
      return [];
    }

    // We use a direct DB query instead of the Entity Query API because the
    // entity query creates 3 JOINs per facet rule (facet, term, ranking_max).
    // A real search can easily have 20+ facet values, which would exceed
    // MariaDB's 61-table join limit.
    $query = $this->database->select('paragraphs_item_field_data', 'p');
    $query->addField('p', 'id');
    $query->condition('p.type', 'campaign_rule');

    $query->join('paragraph__field_campaign_rule_facet', 'f', 'f.entity_id = p.id');
    $query->join('paragraph__field_campaign_rule_term', 't', 't.entity_id = p.id');
    $query->join('paragraph__field_campaign_rule_ranking_max', 'r', 'r.entity_id = p.id');

    $or = $query->orConditionGroup();
    foreach ($facets as $index => $facet) {
      $and = $query->andConditionGroup()
        ->condition('f.field_campaign_rule_facet_value', $facet->facetName)
        ->condition('t.field_campaign_rule_term_value', $facet->valueTerm)
        ->where("r.field_campaign_rule_ranking_max_value >= :ranking_{$index}", [
          ":ranking_{$index}" => $facet->ranking,
        ]);
      $or->condition($and);
    }

    $query->condition($or);
    return $query->execute()?->fetchCol() ?? [];
  }

  /**
   * Finding the query-based trigger paragraph IDs, based on search results.
   *
   * @param \Drupal\dpl_campaign\Input\Query[] $user_queries
   *   The direct queries of the user, such as free-text search.
   *
   * @return int[]|string[]
   *   Paragraph IDs matching any of the provided queries.
   */
  protected function findUserQueryParagraphIds(array $user_queries): array {
    if (empty($user_queries)) {
      return [];
    }

    // We use a direct DB query because we need a "reverse LIKE": check if the
    // editor's trigger phrase appears as a case-insensitive substring within
    // the user's search query. The Entity Query API can only do the opposite.
    // Examples (trigger phrase by editor → query-text by user):
    // - YES: "krimi" → "danske krimi-noveller"
    // - YES: "krimi" → "kriminel"
    // - YES: "krimi" → "Krimi"
    // - NO: "krimi-noveller" → "krimi".
    $query = $this->database->select('paragraph__field_campaign_trigger_phrase', 'f');
    $query->addField('f', 'entity_id');
    $query->condition('f.bundle', 'campaign_trigger_query');

    $or = $query->orConditionGroup();
    foreach ($user_queries as $index => $user_query) {
      $or->where(
        "LOCATE(LOWER(f.field_campaign_trigger_phrase_value), LOWER(:text_{$index})) > 0",
        [":text_{$index}" => $user_query->text],
      );
    }
    $query->condition($or);

    return $query->execute()?->fetchCol() ?? [];
  }

  /**
   * Finding campaign nodes, based on supplied search context.
   *
   * @param \Drupal\dpl_campaign\Input\FacetRule[] $facets
   *   The available facets of the search.
   * @param \Drupal\dpl_campaign\Input\Query[] $user_queries
   *   The direct-input of the end-user, such as free-text search.
   */
  protected function findCampaign(array $facets, array $user_queries): ?NodeInterface {
    $storage = $this->entityTypeManager->getStorage('node');
    $facet_paragraph_ids = $this->findFacetParagraphIds($facets);
    $user_query_paragraph_ids = $this->findUserQueryParagraphIds($user_queries);

    $all_paragraph_ids = array_merge($facet_paragraph_ids, $user_query_paragraph_ids);
    if (empty($all_paragraph_ids)) {
      return NULL;
    }

    foreach (['OR', 'AND'] as $logic) {
      $query = $this->database->select('node_field_data', 'n');
      $query->distinct();
      $query->addField('n', 'nid');
      $query->condition('n.type', 'campaign');
      $query->condition('n.status', 1);

      $query->join('node__field_campaign_rules_logic', 'l', 'l.entity_id = n.nid');
      $query->condition('l.field_campaign_rules_logic_value', $logic);

      if ($logic === 'OR') {
        // At least one of the campaign's triggers must be matched.
        $query->join('node__field_campaign_rules', 'r', 'r.entity_id = n.nid');
        $query->condition('r.field_campaign_rules_target_id', $all_paragraph_ids, 'IN');
      }
      else {
        // ALL of the campaign's triggers must be matched. We express this as
        // "no unmatched trigger exists" via a NOT EXISTS subquery.
        $unmatched = $this->database->select('node__field_campaign_rules', 'r_unmatched');
        $unmatched->addExpression('1');
        $unmatched->where('r_unmatched.entity_id = n.nid');
        $unmatched->condition('r_unmatched.field_campaign_rules_target_id', $all_paragraph_ids, 'NOT IN');
        $query->notExists($unmatched);
      }

      $query->leftJoin('node__field_campaign_weight', 'w', 'w.entity_id = n.nid');
      $query->orderBy('w.field_campaign_weight_value', 'DESC');
      $query->range(0, 1);

      $nid = $query->execute()?->fetchField();
      if ($nid) {
        return $storage->load($nid);
      }
    }

    return NULL;
  }

  /**
   * Responds to entity GET requests.
   *
   * @return \Drupal\rest\ResourceResponseInterface
   *   The response containing matching campaign.
   */
  public function post(Request $request): ResourceResponseInterface {
    $data = $request->getContent();
    if (!$data) {
      throw new HttpException(400, 'No data provided');
    }

    $payload = json_decode($data, TRUE);
    if (!is_array($payload)) {
      throw new HttpException(400, 'Invalid JSON payload');
    }

    $facets_json = json_encode($payload['facets'] ?? []);
    $queries_json = json_encode($payload['queries'] ?? []);

    try {
      /** @var \Drupal\dpl_campaign\Input\Facet[] $facets */
      $facets = $this->serializer->deserialize($facets_json, Facet::class . "[]", 'json');
      $facet_rules = $this->transformFacetsToRules($facets);

      /** @var \Drupal\dpl_campaign\Input\Query[] $user_queries */
      $user_queries = $this->serializer->deserialize($queries_json, Query::class . "[]", 'json');
    }
    catch (UnexpectedValueException $e) {
      throw new HttpException(400, "Invalid data: {$e->getMessage()}");
    }

    $campaign = $this->findCampaign($facet_rules, $user_queries);

    if (!$campaign) {
      return new ResourceResponse(NULL, 404);
    }

    $response = new ResourceResponse([
      'data' => $this->formatCampaignOutput($campaign),
    ]);

    $cacheable_response = $response->addCacheableDependency(CacheableMetadata::createFromRenderArray([
      '#cache' => [
        'tags' => [$this->handyCacheTagManager->getBundleTag('node', 'campaign')],
        'contexts' => ['url.query_args'],
      ],
    ]));

    return $cacheable_response;
  }

}
