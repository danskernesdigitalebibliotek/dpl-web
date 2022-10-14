<?php

namespace Drupal\dpl_campaign\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

// Descriptions quickly become long and Doctrine annotations have no good way
// of handling multiline strings.
// phpcs:disable Drupal.Files.LineLength.TooLong
/**
 * A resource for transforming urls to urls with proxy information added.
 *
 * @RestResource(
 *   id = "campaign",
 *   label = @Translation("Get matching campaign"),
 *   serialization_class = "",
 *
 *   uri_paths = {
 *     "canonical" = "/campaign",
 *   },
 *
 *   route_parameters = {
 *     "GET" = {
 *       "facet" = {
 *          "name" = "facet",
 *          "description" = "A facet to match against",
 *          "type" = "string",
 *          "in" = "query",
 *          "required" = TRUE,
 *       },
 *       "term" = {
 *          "name" = "term",
 *          "description" = "A term to match against",
 *          "type" = "string",
 *          "in" = "query",
 *          "required" = TRUE,
 *       },
 *     },
 *   },
 *
 *   responses = {
 *     200 = {
 *       "description" = "OK",
 *       "schema" = {
 *         "type" = "object",
 *         "properties" = {
 *           "data" = {
 *             "type" = "object",
 *             "properties" = {
 *               "campaign" = {
 *                 "type" = "string",
 *                 "description" = "The matching campaign",
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *     404 = {
 *       "description" = "No matching campaign found"
 *     },
 *     500 = {
 *       "description" = "Internal server error"
 *     },
 *   }
 * )
 */
class CampaignResource extends ResourceBase {
// phpcs:enable Drupal.Files.LineLength.TooLong

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
   * Handy Cache Tag Manager.
   *
   * @var \Drupal\handy_cache_tags\HandyCacheTagsManager
   */
  protected $handyCacheTagManager;


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
    $instance->urlGenerator = $container->get('url_generator');
    $instance->handyCacheTagManager = $container->get('handy_cache_tags.manager');

    return $instance;
  }

  /**
   * The base url for the site which is the same base url for the REST API.
   */
  protected function getBaseUrl(): string {
    $url = $this->urlGenerator
      ->generateFromRoute('<front>', [], ['absolute' => TRUE], TRUE)
      ->getGeneratedUrl();
    return rtrim($url, '/');
  }

  /**
   * Takes a facet-term-pairs query param and transforms it into a rules array.
   *
   * @param string $transformFacetTermPairs
   *   The facet-term-pairs query param. Eg.: "level:advanceret:2|access:basis:4".
   *
   * @return mixed[]
   *   Either an array of rules or an empty array if no rules could be parsed.
   */
  protected function transformFacetTermPairsToRules(string $transform_facet_term_pairs): array {
    $rules = [];
    foreach (explode('|', $transform_facet_term_pairs) as $pair) {
      list($facet, $term, $ranking) = explode(':', $pair);
      $rules[] = [
        'facet' => $facet,
        'term' => $term,
        'ranking' => $ranking,
      ];
    }

    return $rules;
  }

  /**
   * Turns a campaign node into a object with a reduced set of properties.
   *
   * @param \Drupal\node\NodeInterface $campaign
   *   The campaign node.
   *
   * @return mixed[]
   */
  protected function formatCampaignOutput(Node $campaign): array {
    $body = !$campaign->get('body')->isEmpty ? $campaign->body->getValue()[0]['value'] : '';
    $image = NULL;

    if (!$campaign->get('field_campaign_image')->isEmpty) {
      $file = $campaign->field_campaign_image->entity;
      $image = [
        'url' => sprintf('%s%s', $this->getBaseUrl(), $file->createFileUrl()),
      ];
    }

    return [
      "title" => $campaign->title->getValue()[0]['value'],
      "body" => $body,
      "image" => $image,
    ];
  }

  /**
   * A query method to get a campaign node based on a set of rules and logic.
   *
   * @param mixed[] $facet_term_rules
   *   An array of facet-term rules. see self::transformFacetTermPairsToRules().
   * @param string $rules_logic
   *   The logic to use when matching the rules. Either "AND" or "OR".
   *
   * @return \Drupal\node\NodeInterface|null
   *   A campaign node or NULL if no campaign could be found.
   */
  protected function findCampaignByFacetAndTerms(array $facet_term_rules, string $rules_logic): NodeInterface | NULL {
    $storage = $this->entityTypeManager->getStorage('node');
    $query = $storage->getQuery();

    $query->accessCheck(FALSE)
      ->condition('type', 'campaign')
      ->condition('status', 1)
      ->condition('field_campaign_rules_logic', $rules_logic);

    $conditionGroup = $rules_logic == "AND" ? $query->andConditionGroup() : $query->orConditionGroup();
    foreach ($facet_term_rules as $rule) {
      $facetTermGroup = $query->andConditionGroup()
        ->condition('field_campaign_rules.entity:paragraph.field_campaign_rule_facet', $rule['facet'])
        ->condition('field_campaign_rules.entity:paragraph.field_campaign_rule_term', $rule['term'])
        // If the position of the term inside a facet is lower than the maximum ranking we have a hit.
        ->condition('field_campaign_rules.entity:paragraph.field_campaign_rule_ranking_max', $rule['ranking'], '>=');
      $conditionGroup->condition($facetTermGroup);
    }
    $query->condition($conditionGroup);

    if (!$entity_ids = $query->execute()) {
      return NULL;
    }

    // If there is multiple campaign matches, we return the first one.
    $entity_id = reset($entity_ids);

    return $storage->load($entity_id);
  }

  /**
   * Responds to entity GET requests.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *
   * @return \Drupal\rest\ResourceResponse
   *   The response containing matching campaign.
   */
  public function get(Request $request): ResourceResponse {
    $facet_term_pairs = $request->get('facet-term-pairs');

    if (!$facet_term_pairs) {
      throw new HttpException(400, 'Facet term pairs is missing');
    }

    $rules = $this->transformFacetTermPairsToRules($facet_term_pairs);
    // print_r($rules);
    if (!$rules) {
      throw new HttpException(400, 'Facet term pairs is invalid');
    }

    // Default response is 404 if no matching campaign is found.
    $response = new ResourceResponse(NULL, 404);

    // Try to find a matching campaign. AND matches takes precedence over OR.
    foreach (['AND', 'OR'] as $logic) {
      if ($campaign = $this->findCampaignByFacetAndTerms($rules, $logic)) {
        $response = new ResourceResponse([
          'data' => $this->formatCampaignOutput($campaign),
        ]);
        break;
      }
    }

    return $response->addCacheableDependency(CacheableMetadata::createFromRenderArray([
      '#cache' => [
        'tags' => [$this->handyCacheTagManager->getBundleTag('node', 'campaign')],
        'contexts' => ['url.query_args'],
      ],
    ]));
  }

}
