<?php

namespace Drupal\dpl_campaign\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\dpl_campaign\Input\Facet;
use Drupal\dpl_campaign\Input\Rule;
use Drupal\dpl_campaign\Input\Value;
use Drupal\node\NodeInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\rest\ResourceResponseInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Serializer\Exception\UnexpectedValueException;
use function Safe\usort as usort;

// Descriptions quickly become long and Doctrine annotations have no good way
// of handling multiline strings.
// phpcs:disable Drupal.Files.LineLength.TooLong
/**
 * A resource for retrieving a campaign matching the facets in a search result.
 *
 * @RestResource(
 *   id = "campaign:match",
 *   label = @Translation("Get campaign matching search result facets"),
 *   serialization_class = "",
 *
 *   uri_paths = {
 *     "canonical" = "/dpl_campaign/match",
 *   },
 *
 *   payload = {
 *     "name" = "facets",
 *     "description" = "A facet to match against",
 *     "in" = "body",
 *     "required" = TRUE,
 *     "schema" = {
 *       "type" = "array",
 *       "items" = {
 *         "type" = "object",
 *         "schema" = {
 *           "name" = {
 *             "type" = "string",
 *           },
 *           "values" = {
 *             "type" = "array",
 *             "items" = {
 *               "type" = "object",
 *               "schema" = {
 *                 "key" = {
 *                   "type" = "string",
 *                 },
 *                 "term" = {
 *                   "type" = "string",
 *                 },
 *                 "score" = {
 *                   "type" = "int",
 *                 },
 *               },
 *             },
 *           },
 *         },
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
 *             "description" = "The matching campaign",
 *             "properties" = {
 *               "text" = {
 *                 "type" = "string",
 *                 "description" = "The text to be shown for the campaign",
 *               },
 *               "image" = {
 *                 "type" = "object",
 *                 "description" = "The image to be shown for the campaign",
 *                 "properties" = {
 *                   "url" = {
 *                     "type" = "string",
 *                     "description" = "The url to the image",
 *                   },
 *                   "alt" = {
 *                     "type" = "string",
 *                     "description" = "The alt text for the image",
 *                   },
 *                 },
 *               },
 *               "url" = {
 *                 "type" = "string",
 *                 "description" = "The url the campaign should link to",
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *     400 = {
 *      "descriptions" = "Invalid input"
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
class MatchResource extends ResourceBase {
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

    return $instance;
  }

  /**
   * Takes a facet-term-pairs query param and transforms it into a rules array.
   *
   * @param \Drupal\dpl_campaign\Input\Facet[] $facets
   *   Facets for a search result.
   *
   * @return \Drupal\dpl_campaign\Input\Rule[]
   *   Rules corresponding to the facets.
   */
  protected function transformFacetsToRules(array $facets): array {
    return array_merge(... array_map(function (Facet $facet) {
      $sorted_values = $facet->values;
      usort($sorted_values, function (Value $a, Value $b) {
        return $a->score - $b->score;
      });
      return array_map(function (Value $value, int $index) use ($facet) {
        // With values being sorted the index will correspond to the rank.
        return new Rule($facet->name, $value->term, $index + 1);
      }, $sorted_values, array_keys($sorted_values));
    }, $facets));
  }

  /**
   * Turns a campaign node into a object with a reduced set of properties.
   *
   * @param \Drupal\node\NodeInterface $campaign
   *   The campaign node.
   *
   * @return mixed[]
   *   A normalized data structure which can be output.
   */
  protected function formatCampaignOutput(NodeInterface $campaign): array {
    $output = [];

    if (!$campaign->get('body')->isEmpty()) {
      $output['text'] = $campaign->get('body')->getValue()[0]['value'];
    }

    if (!$campaign->get('field_campaign_image')->isEmpty()) {
      /** @var \Drupal\image\Plugin\Field\FieldType\ImageItem $image_item */
      $image_item = $campaign->get('field_campaign_image')->get(0);
      /** @var \Drupal\file\FileInterface $image_file */
      $image_file = $this->entityTypeManager->getStorage('file')->load($image_item->get('target_id')->getValue());
      /** @var \Drupal\image\Entity\ImageStyle $image_style */
      $image_style = $this->entityTypeManager->getStorage('image_style')->load('campaign_image');
      $output['image'] = [
        'url' => $image_style->buildUrl($image_file->getFileUri()),
        'alt' => $image_item->get('alt')->getValue(),
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
   * A query method to get a campaign node based on a set of rules and logic.
   *
   * @param \Drupal\dpl_campaign\Input\Rule[] $rules
   *   An array of facet-term rules. see self::transformFacetTermPairsToRules().
   * @param string $rules_logic
   *   The logic to use when matching the rules. Either "AND" or "OR".
   *
   * @return \Drupal\node\NodeInterface|null
   *   A campaign node or NULL if no campaign could be found.
   */
  protected function findCampaign(array $rules, string $rules_logic): ?NodeInterface {
    $storage = $this->entityTypeManager->getStorage('node');
    $query = $storage->getQuery();

    $query->accessCheck(FALSE)
      ->condition('type', 'campaign')
      ->condition('status', 1)
      ->condition('field_campaign_rules_logic', $rules_logic);

    if ($rules_logic == "AND") {
      $conditionGroup = $query->andConditionGroup();
    }
    else {
      $conditionGroup = $query->orConditionGroup();
    }
    foreach ($rules as $rule) {
      $facetTermGroup = $query->andConditionGroup()
        ->condition('field_campaign_rules.entity:paragraph.field_campaign_rule_facet', $rule->facetName)
        ->condition('field_campaign_rules.entity:paragraph.field_campaign_rule_term', $rule->valueTerm)
        // If the position of the term inside a facet is lower than the maximum
        // ranking we have a hit.
        ->condition('field_campaign_rules.entity:paragraph.field_campaign_rule_ranking_max', $rule->ranking, '>=');
      $conditionGroup->condition($facetTermGroup);
    }
    $query->condition($conditionGroup);

    /** @var int[] $entity_ids */
    $entity_ids = $query->execute();

    // If there is multiple campaign matches, we return the first one.
    $entity_id = reset($entity_ids);

    /** @var \Drupal\node\NodeInterface $campaign */
    $campaign = $storage->load($entity_id);
    return $campaign;
  }

  /**
   * Responds to entity GET requests.
   *
   * @return \Drupal\rest\ResourceResponseInterface
   *   The response containing matching campaign.
   */
  public function post(Request $request): ResourceResponseInterface {
    $facet_data = $request->getContent();
    if (!$facet_data) {
      throw new HttpException(400, 'No facet data provided');
    }

    try {
      /** @var \Drupal\dpl_campaign\Input\Facet[] $facets */
      $facets = $this->serializer->deserialize($facet_data, Facet::class . "[]", 'json');
    }
    catch (UnexpectedValueException $e) {
      throw new HttpException(400, "Invalid facet data: {$e->getMessage()}}");
    }

    $rules = $this->transformFacetsToRules($facets);

    // Default response is 404 if no matching campaign is found.
    $response = new ResourceResponse(NULL, 404);

    // Try to find a matching campaign. AND matches takes precedence over OR.
    foreach (['AND', 'OR'] as $logic) {
      if ($campaign = $this->findCampaign($rules, $logic)) {
        $response = new ResourceResponse([
          'data' => $this->formatCampaignOutput($campaign),
        ]);
        break;
      }
    }

    $cacheable_response = $response->addCacheableDependency(CacheableMetadata::createFromRenderArray([
      '#cache' => [
        'tags' => [$this->handyCacheTagManager->getBundleTag('node', 'campaign')],
        'contexts' => ['url.query_args'],
      ],
    ]));

    return $cacheable_response;
  }

}
