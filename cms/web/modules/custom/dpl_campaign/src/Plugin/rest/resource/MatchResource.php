<?php

namespace Drupal\dpl_campaign\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\dpl_campaign\Input\Facet;
use Drupal\dpl_campaign\Input\Rule;
use Drupal\dpl_campaign\Input\Value;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\rest\ResourceResponseInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Serializer\Exception\UnexpectedValueException;

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
 *     "create" = "/dpl_campaign/match",
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
 *         "properties" = {
 *           "name" = {
 *             "type" = "string",
 *           },
 *           "values" = {
 *             "type" = "array",
 *             "items" = {
 *               "type" = "object",
 *               "properties" = {
 *                 "key" = {
 *                   "type" = "string",
 *                 },
 *                 "term" = {
 *                   "type" = "string",
 *                 },
 *                 "score" = {
 *                   "type" = "integer",
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
 *                "id" = {
 *                 "type" = "string",
 *                 "description" = "The campaign id",
 *               },
 *                "title" = {
 *                 "type" = "string",
 *                 "description" = "The title of the campaign",
 *               },
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
    $known_facets = [];
    return array_merge(... array_map(function (Facet $facet) use (&$known_facets) {
      // Throw an exception if we have a duplicate facet.
      if (in_array($facet->name, $known_facets)) {
        throw new HttpException(400, "Facet group can only be presented once: {$facet->name}");
      }

      $sorted_values = $facet->values;
      usort($sorted_values, function (Value $a, Value $b) {
        return $b->score - $a->score;
      });

      // Store the facet name so we can check for duplicates.
      $known_facets[] = $facet->name;
      return array_map(function (Value $value, int|string $index) use ($facet) {
        // With values being sorted the index will correspond to the rank.
        return new Rule($facet->name, $value->term, intval($index) + 1);
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
    $output = ['id' => $campaign->id()];

    if (!$campaign->get('title')->isEmpty()) {
      $output['title'] = $campaign->get('title')->getValue()[0]['value'];
    }

    if (!$campaign->get('field_campaign_text')->isEmpty()) {
      $output['text'] = $campaign->get('field_campaign_text')->getValue()[0]['value'];
    }

    if (!$campaign->get('field_campaign_image')->isEmpty()) {
      /** @var \Drupal\image\Plugin\Field\FieldType\ImageItem $image_item */
      $image_item = $campaign->get('field_campaign_image')->get(0);
      /** @var \Drupal\file\FileInterface $image_file */
      $image_file = $this->entityTypeManager->getStorage('file')->load($image_item->get('target_id')->getValue());
      /** @var \Drupal\image\Entity\ImageStyle $image_style */
      $image_style = $this->entityTypeManager->getStorage('image_style')->load('campaign_image');
      $image_file_uri = $image_file->getFileUri();
      if ($image_file_uri) {
        $output['image'] = [
          'url' => $image_style->buildUrl($image_file_uri),
          'alt' => $image_item->get('alt')->getValue(),
        ];
      }
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
    $entity_ids = $query->accessCheck(FALSE)
      ->condition('type', 'campaign')
      ->condition('status', 1)
      ->condition('field_campaign_rules_logic', $rules_logic)
      ->execute();

    if (!is_array($entity_ids)) {
      return NULL;
    }

    /** @var \Drupal\node\NodeInterface[] $campaigns */
    $campaigns = $storage->loadMultiple($entity_ids);
    foreach ($campaigns as $campaign) {
      $campaign_rules = $this->getCampaignRules($campaign);
      $campaign_rules_count = count($campaign_rules);
      $processed_facets = [];
      $matched_campaign_rules_count = 0;
      foreach ($campaign_rules as $campaign_rule) {
        $campaign_facet = $campaign_rule->get('field_campaign_rule_facet')->first()?->getString();
        if (in_array($campaign_rule->facetName, $processed_facets)) {
          continue;
        }

        if ($this->campaignRuleMatched($campaign_rule, $rules)) {
          $processed_facets[] = $campaign_facet;
          $matched_campaign_rules_count++;
        }
      }

      if ($rules_logic == 'AND' && $matched_campaign_rules_count == $campaign_rules_count) {
        return $campaign;
      }

      if ($rules_logic == 'OR' && $matched_campaign_rules_count) {
        return $campaign;
      }

    }
    return NULL;
  }

  /**
   * Lookup campaign rule in the requested facets and terms.
   *
   * @param \Drupal\paragraphs\ParagraphInterface $campaign_rule
   *   A campaign rule.
   * @param \Drupal\dpl_campaign\Input\Rule[] $rules
   *   An array of facet-term rules. see self::transformFacetTermPairsToRules().
   *
   * @return bool
   *   TRUE if the campaign rule matches the requested facets and terms.
   */
  protected function campaignRuleMatched(ParagraphInterface $campaign_rule, array $rules): bool {
    return array_reduce($rules, function ($carry, $rule) use ($campaign_rule) {
      if (
        $campaign_rule->get('field_campaign_rule_facet')->first()?->getString() == $rule->facetName
        && $campaign_rule->get('field_campaign_rule_term')->first()?->getString() == $rule->valueTerm
        && $campaign_rule->get('field_campaign_rule_ranking_max')->first()?->getString() >= $rule->ranking
      ) {
        return $carry = TRUE;
      }

      return $carry;
    }, FALSE);
  }

  /**
   * Get the rules for a campaign.
   *
   * @param \Drupal\node\NodeInterface $campaign
   *   A campaign node.
   *
   * @return \Drupal\paragraphs\ParagraphInterface[]
   *   An array of campaign rules.
   */
  protected function getCampaignRules(NodeInterface $campaign): array {
    // Load all Component Paragraph entities.
    $rules = $campaign->hasField('field_campaign_rules') ? $campaign->get('field_campaign_rules')->getValue() : [];
    $target_ids = array_map(
      function ($value) {
        return $value['target_id'];
      },
      $rules
    );

    $rules_paragraphs = [];
    if ($target_ids) {
      /** @var \Drupal\paragraphs\ParagraphInterface[] $rules_paragraphs */
      $rules_paragraphs = $this->entityTypeManager->getStorage('paragraph')->loadMultiple((array) $target_ids);
    }

    return $rules_paragraphs;
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
