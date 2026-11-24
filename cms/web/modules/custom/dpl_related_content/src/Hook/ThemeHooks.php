<?php

declare(strict_types=1);

namespace Drupal\dpl_related_content\Hook;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\dpl_related_content\RelatedContentListStyle;
use Drupal\dpl_related_content\Services\RelatedContent;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\ParagraphInterface;
use Symfony\Component\DependencyInjection\Attribute\AutowireServiceClosure;

/**
 * Theme hooks for dpl_related_content module.
 */
class ThemeHooks {

  /**
   * The dpl_related_content logger channel.
   */
  protected LoggerChannelInterface $logger;

  public function __construct(
    protected RouteMatchInterface $routeMatch,
    LoggerChannelFactoryInterface $loggerFactory,
    // The service is not shared, so each call gives a fresh instance.
    #[AutowireServiceClosure('dpl_related_content.related_content')]
    protected \Closure $relatedContentFactory,
  ) {
    $this->logger = $loggerFactory->get('dpl_related_content');
  }

  /**
   * Define the dpl_related_content theme hook.
   *
   * @return array<string, mixed>
   *   The theme hooks the module defines.
   */
  #[Hook('theme')]
  public function theme(): array {
    return [
      'dpl_related_content' => [
        'variables' => [
          'title' => NULL,
          'link' => NULL,
          'items' => [],
          'result_basis' => [],
          'list_style' => RelatedContentListStyle::Slider,
        ],
      ],
    ];
  }

  /**
   * Add a template suggestion per list style.
   *
   * @param string[] $suggestions
   *   The template suggestions.
   * @param mixed[] $variables
   *   The variables for the theme hook.
   */
  #[Hook('theme_suggestions_dpl_related_content_alter')]
  public function addListStyleSuggestion(array &$suggestions, array $variables): void {
    $list_style = $variables['list_style'] ?? RelatedContentListStyle::Slider;
    if (!($list_style instanceof RelatedContentListStyle)) {
      return;
    }

    $suggestions[] = "dpl_related_content__{$list_style->value}";
  }

  /**
   * Add a related content list to articles and event instances.
   *
   * Content displayed is based on the field values of the current page entity.
   *
   * @param mixed[] $variables
   *   The variables for the page template.
   */
  #[Hook('preprocess_page')]
  public function addRelatedContent(array &$variables): void {
    $route_name = $this->routeMatch->getRouteName();

    // We only want to display the related content list on eventinstances, OR
    // on article nodes.
    if ($route_name === 'entity.node.canonical') {
      $entity = $this->routeMatch->getParameter('node');

      if (!($entity instanceof NodeInterface) || $entity->bundle() !== 'article') {
        return;
      }
    }
    elseif ($route_name === 'entity.eventinstance.canonical') {
      $entity = $this->routeMatch->getParameter('eventinstance');
    }
    else {
      return;
    }

    if (!($entity instanceof FieldableEntityInterface)) {
      return;
    }
    try {
      $service = $this->newRelatedContent();
      $service->setListStyle(RelatedContentListStyle::Slider);
      $service->broadSearch = FALSE;

      $variables['related_content'] = $service->getContentFromEntity($entity);
    }
    catch (\Exception $e) {
      $this->logger->error(
        'Could not render related content list. Exception: @exception',
        ['@exception' => $e->getMessage()]
      );
    }
  }

  /**
   * Show the automatic card grid as a grid of filtered content.
   *
   * @param mixed[] $variables
   *   The variables for the paragraph template.
   */
  #[Hook('preprocess_paragraph__card_grid_automatic')]
  public function prepareCardGridAutomatic(array &$variables): void {
    $variables = $this->filterParagraph($variables, list_style: RelatedContentListStyle::Grid);
  }

  /**
   * Show the automatic content slider as a slider of filtered content.
   *
   * @param mixed[] $variables
   *   The variables for the paragraph template.
   */
  #[Hook('preprocess_paragraph__content_slider_automatic')]
  public function prepareContentSliderAutomatic(array &$variables): void {
    $variables = $this->filterParagraph($variables, list_style: RelatedContentListStyle::Slider);
  }

  /**
   * Show the filtered event list as a list of filtered events.
   *
   * @param mixed[] $variables
   *   The variables for the paragraph template.
   */
  #[Hook('preprocess_paragraph__filtered_event_list')]
  public function prepareFilteredEventList(array &$variables): void {
    $paragraph = $variables['paragraph'] ?? NULL;

    // If the editor opted in on the paragraph, switch to the stacked list
    // style. That allows several instances from the same series to appear,
    // shown in a stacked view when no other series sit between them in the
    // result order.
    $allow_multiple = $paragraph instanceof ParagraphInterface
      && $paragraph->hasField('field_allow_multiple_per_series')
      && (bool) $paragraph->get('field_allow_multiple_per_series')->value;

    $list_style = $allow_multiple
      ? RelatedContentListStyle::EventListStacked
      : RelatedContentListStyle::EventList;

    $variables = $this->filterParagraph(
      $variables, list_style: $list_style, max_items: 16, node_bundles: []
    );
  }

  /**
   * Prepare a 'filter' paragraph, and load the RelatedContent list.
   *
   * @param array<mixed> $variables
   *   The variables, from the preprocess hook.
   * @param \Drupal\dpl_related_content\RelatedContentListStyle $list_style
   *   The style you want the list to be shown in.
   * @param int|null $max_items
   *   May be overriden by field_max_item_amount on the paragraph.
   * @param string[] $node_bundles
   *   The node bundles (e.g. 'article'), that we want to include.
   *   Use this to disable nodes all together, by setting empty array.
   *   Setting NULL will let RelatedContent decide.
   *
   * @return array<mixed>
   *   The updated $variables.
   */
  protected function filterParagraph(array $variables, RelatedContentListStyle $list_style = RelatedContentListStyle::Slider, ?int $max_items = NULL, ?array $node_bundles = NULL): array {
    $paragraph = $variables['paragraph'] ?? NULL;
    $view_mode = $variables['view_mode'] ?? NULL;

    if ($view_mode === 'preview' || !($paragraph instanceof Paragraph)) {
      return $variables;
    }

    try {
      $service = $this->newRelatedContent();
      $service->setListStyle($list_style);

      $service->excludedUuid = $paragraph->getParentEntity()?->uuid();

      if (is_array($node_bundles)) {
        $service->nodeBundles = $node_bundles;
      }

      if (!empty($max_items)) {
        $service->maxItems = $max_items;
      }

      if ($paragraph->hasField('field_underlined_title') && !$paragraph->get('field_underlined_title')->isEmpty()) {
        $service->title = $paragraph->get('field_underlined_title')->view();
        unset($variables['content']['field_underlined_title']);
      }
      elseif ($paragraph->hasField('field_title') && !$paragraph->get('field_title')->isEmpty()) {
        $service->title = $paragraph->get('field_title')->getString();
        unset($variables['content']['field_title']);
      }

      if ($paragraph->hasField('field_more_link') && !$paragraph->get('field_more_link')->isEmpty()) {
        $service->moreLink = $paragraph->get('field_more_link')->view();
        unset($variables['content']['field_more_link']);
      }

      // Deciding if we should treat the filters as AND.
      if ($paragraph->hasField('field_filter_cond_type') && !$paragraph->get('field_filter_cond_type')->isEmpty()) {
        $condition = $paragraph->get('field_filter_cond_type')->getString();

        switch ($condition) {
          case 'and':
            $service->innerAndConditions = TRUE;
            $service->outerAndConditions = TRUE;
            break;

          case 'or':
            $service->innerAndConditions = FALSE;
            $service->outerAndConditions = FALSE;
            break;

          case 'outer_and':
            $service->innerAndConditions = FALSE;
            $service->outerAndConditions = TRUE;
            break;
        }
      }

      if ($paragraph->hasField('field_filter_content_types') && !$paragraph->get('field_filter_content_types')->isEmpty()) {
        // Turning 'xx, yy, zz' into an array.
        $content_types = explode(', ', $paragraph->get('field_filter_content_types')->getString());

        $service->includeEvents = in_array('event', $content_types);

        $service->nodeBundles = $content_types;
      }

      if ($paragraph->hasField('field_filter_tags') && !$paragraph->get('field_filter_tags')->isEmpty()) {
        $service->setTags($paragraph->get('field_filter_tags')->referencedEntities());
      }

      if ($paragraph->hasField('field_filter_categories') && !$paragraph->get('field_filter_categories')->isEmpty()) {
        $service->setCategories($paragraph->get('field_filter_categories')->referencedEntities());
      }

      if ($paragraph->hasField('field_filter_branches') && !$paragraph->get('field_filter_branches')->isEmpty()) {
        $service->setBranches($paragraph->get('field_filter_branches')->referencedEntities());
      }

      if ($paragraph->hasField('field_filter_audiences') && !$paragraph->get('field_filter_audiences')->isEmpty()) {
        $service->setAudiences($paragraph->get('field_filter_audiences')->referencedEntities());
      }

      if ($paragraph->hasField('field_max_item_amount') && !$paragraph->get('field_max_item_amount')->isEmpty()) {
        $service->maxItems = intval($paragraph->get('field_max_item_amount')->getString());
      }

      $variables['content']['view'] = $service->getContent();
    }
    catch (\Exception $e) {
      $this->logger->error(
        'Could not render related content list. Exception: @exception',
        ['@exception' => $e->getMessage()]
      );
    }

    return $variables;
  }

  /**
   * Get a new RelatedContent instance.
   */
  protected function newRelatedContent(): RelatedContent {
    /** @var \Drupal\dpl_related_content\Services\RelatedContent $service */
    $service = ($this->relatedContentFactory)();
    return $service;
  }

}
