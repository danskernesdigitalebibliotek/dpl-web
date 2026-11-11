<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Hook;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_paragraphs\Entity\MaterialGridAutomaticParagraph;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\ParagraphInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use function Safe\parse_url;
use function Safe\preg_match;

/**
 * Theme hooks for dpl_paragraphs module.
 */
class ThemeHooks {

  use StringTranslationTrait;

  public function __construct(
    protected RequestStack $requestStack,
    protected UrlGeneratorInterface $urlGenerator,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected BranchSettings $branchSettings,
    protected BranchRepositoryInterface $branchRepository,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Adds the absolute base URL to all paragraphs.
   *
   * This is used to construct absolute paths for assets like icons in the
   * paragraph templates.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph')]
  public function addAbsoluteBaseUrl(array &$variables): void {
    if (isset($variables['paragraph'])) {
      $variables['absoluteBaseUrl'] = $this->requestStack->getCurrentRequest()?->getSchemeAndHttpHost();
    }
  }

  /**
   * Adds link type, target and icon to the links of links paragraphs.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph__links')]
  public function addLinkDetails(array &$variables): void {
    // To infer if a link is downloadable with we have a basic approach, with
    // various limitations. It's important to know, that internal files in
    // project, will be uploaded through the media library using a seperate
    // paragraph. As such the check here is primarily for external links to
    // downloadable files. The approach here checks the URL's file extension to
    // determine if it's a downloadable file. The fallback of an external file
    // not being recognized as downloadable, is to treat it as an external link.
    // Limitations include:
    // 1. URLs endings does not guarantee the content is downloadable.
    // 2. Some downloadable content may not have a typical file extension.
    // 3. Does not consider server responses that dictates downloadability.
    $downloadable_file_extensions = 'pdf|docx|txt|png|jpg|jpeg|gif|csv|xls|xlsx|ppt|pptx';

    // Generate base paths for predefined routes (search and advanced search).
    $search_base_path = $this->urlGenerator->generateFromRoute('dpl_react_apps.search_result', [], ['absolute' => FALSE]);
    $advanced_search_base_path = $this->urlGenerator->generateFromRoute('dpl_react_apps.advanced_search', [], ['absolute' => FALSE]);

    /** @var \Drupal\paragraphs\ParagraphInterface $paragraph */
    $paragraph = $variables['paragraph'];

    if ($paragraph->hasField('field_link') && !$paragraph->get('field_link')->isEmpty()) {

      $items = $paragraph->get('field_link')->getValue();
      $variables['links'] = [];

      foreach ($items as $item) {

        $url = Url::fromUri($item['uri']);

        // Get the normalized path. If null, default to an empty string.
        $parsed_url = parse_url($url->toString(), PHP_URL_PATH);
        $normalized_path = (is_string($parsed_url)) ? rtrim($parsed_url, '/') : '';

        $link_type = 'internal';

        if ($url->isExternal()) {
          if (preg_match('/\.(' . $downloadable_file_extensions . ')(\?.*)?$/i', $normalized_path)) {
            $link_type = 'download';
          }
          else {
            $link_type = 'external';
          }
        }
        elseif ($normalized_path === $search_base_path || $normalized_path === $advanced_search_base_path) {
          $link_type = 'search';
        }
        $href = $url->isExternal() ? $url->toUriString() : $url->toString();
        $linkIconClass = ($link_type === 'internal') ? 'link-with-icon__icon--rotate-180' : '';

        $attributes = [
          'internal' => ['target' => '_self', 'iconFile' => 'ArrowBack', 'iconFolder' => 'collection'],
          'external' => ['target' => '_blank', 'iconFile' => 'icon-external-link', 'iconFolder' => 'basic'],
          'download' => ['target' => '_blank', 'iconFile' => 'Ebook', 'iconFolder' => 'collection'],
          'search' => ['target' => '_self', 'iconFile' => 'SearchBooks', 'iconFolder' => 'collection'],
        ][$link_type];

        $variables['links'][] = [
          'href' => $href,
          'linkText' => $item['title'],
          'linkType' => $link_type,
          'target' => $attributes['target'],
          'iconFile' => $attributes['iconFile'],
          'iconFolder' => $attributes['iconFolder'],
          'linkIconClass' => $linkIconClass,
        ];
      }
    }
  }

  /**
   * Use the alternative image style for the second image of medias paragraphs.
   *
   * We do this, by setting a different view mode on the paragraph.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph__medias')]
  public function useAlternativeSecondImage(array &$variables): void {
    $paragraph = $variables['paragraph'] ?? NULL;
    $view_mode = $variables['view_mode'] ?? NULL;

    if ($view_mode === 'preview' ||
        !($paragraph instanceof Paragraph) ||
        (empty($variables['content']['field_medias'][1])) ||
        (!$paragraph->hasField('field_medias'))) {
      return;
    }

    $alternative_images = $paragraph->get('field_medias')->view('alternative');
    $variables['content']['field_medias'][1] = $alternative_images[1] ?? NULL;
  }

  /**
   * Renders the recommendation React app in recommendation paragraphs.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph__recommendation')]
  public function addRecommendationApp(array &$variables): void {
    $paragraph = $variables['paragraph'] ?? NULL;
    $view_mode = $variables['view_mode'] ?? NULL;

    if ($view_mode === 'preview' ||
        !($paragraph instanceof ParagraphInterface) ||
        !$paragraph->hasField('field_recommendation_work_id') ||
        $paragraph->get('field_recommendation_work_id')->isEmpty()) {
      return;
    }

    $work_id_field = $paragraph->get('field_recommendation_work_id');
    $work_id = $work_id_field->value;
    $material_type = $work_id_field->material_type ?? NULL;

    $data = [
      'wid' => $work_id,
      'material-type' => $material_type,
    ] + DplReactAppsController::externalApiBaseUrls();

    if ($paragraph->hasField('field_recommendation_title')) {
      $title = $paragraph->get('field_recommendation_title')->getValue();

      $data['title'] = $title[0]['value'] ?? '';
    }

    if ($paragraph->hasField('field_recommendation_description')) {
      $data['description'] = $paragraph->get('field_recommendation_description')->getString();
    }

    if ($paragraph->hasField('field_image_position_right')) {
      $image_position_right = $paragraph->get('field_image_position_right')->getString();

      // Align React's prop type: String '1' for true, boolean false otherwise.
      $data['position-image-right'] = $image_position_right === '1' ? '1' : FALSE;
    }

    $variables['content']['react_app'] = [
      '#theme' => 'dpl_react_app',
      '#name' => 'recommendation',
      '#data' => $data,
    ];
  }

  /**
   * Renders the material grid React app in automatic material grids.
   *
   * @param array<mixed> $variables
   *   Variables for the paragraph template, including the 'paragraph' entity.
   */
  #[Hook('preprocess_paragraph__material_grid_automatic')]
  public function addAutomaticMaterialGridApp(array &$variables): void {
    $view_mode = $variables['view_mode'] ?? 'default';
    $paragraph = $variables['paragraph'] ?? NULL;

    if ($view_mode === 'preview' || !($paragraph instanceof MaterialGridAutomaticParagraph)) {
      return;
    }

    // Get the common render array, used by all material grid paragraphs.
    $render = $this->materialGridRenderArray($paragraph);
    $render['#name'] = 'material-grid-automatic';

    $cql_search = $paragraph->get('field_cql_search')->getValue();

    $onshelf = !empty($cql_search[0]['onshelf']);
    $render['#data']['cql'] = $cql_search[0]['value'];
    $render['#data']['onshelf'] = $onshelf ? 'true' : 'false';

    // The first accession date filter consists of both an operator and a
    // value. Only pass the value if both are set.
    if (!empty($cql_search[0]['first_accession_date_operator']) && !empty($cql_search[0]['first_accession_date_value'])) {
      $render['#data']['firstaccessiondateitem'] = $cql_search[0]['first_accession_date_operator'] . $cql_search[0]['first_accession_date_value'];
    }

    $filters = ['branch', 'department', 'location', 'sublocation', 'sort'];

    foreach ($filters as $filter) {
      // Only set the data filters if they actually exist.
      if (empty($cql_search[0][$filter])) {
        continue;
      }

      $render['#data'][$filter] = $cql_search[0][$filter];
    }

    // A prioritised material type makes clicking a material open that material
    // type, falling back to the normal logic if the material does not have it.
    $priority_type = $paragraph->getPriorityMaterialType();
    if ($priority_type) {
      $render['#data']['material-type'] = $priority_type;
    }

    $variables['content'] = [
      'material_grid' => $render,
    ];
  }

  /**
   * Renders the material grid React app in automatic material grid links.
   *
   * @param array<mixed> $variables
   *   Variables for the paragraph template, including the 'paragraph' entity.
   */
  #[Hook('preprocess_paragraph__material_grid_link_automatic')]
  public function addMaterialGridLinkApp(array &$variables): void {
    $view_mode = $variables['view_mode'] ?? 'default';
    $paragraph = $variables['paragraph'] ?? NULL;

    if ($view_mode === 'preview' || !($paragraph instanceof ParagraphInterface) || !$paragraph->hasField('field_material_grid_link')) {
      return;
    }

    // Get the common render array, used by all material grid paragraphs.
    $render = $this->materialGridRenderArray($paragraph);
    $render['#name'] = 'material-grid-link-automatic';
    $render['#data']['link'] = $paragraph->get('field_material_grid_link')->getString();

    $variables['content'] = [
      'material_grid' => $render,
    ];
  }

  /**
   * Renders the material grid React app in manual material grids.
   *
   * @param array<mixed> $variables
   *   Variables for the paragraph template, including the 'paragraph' entity.
   */
  #[Hook('preprocess_paragraph__material_grid_manual')]
  public function addManualMaterialGridApp(array &$variables): void {
    $view_mode = $variables['view_mode'] ?? 'default';
    $paragraph = $variables['paragraph'] ?? NULL;

    if ($view_mode === 'preview' || !($paragraph instanceof ParagraphInterface) || !$paragraph->hasField('field_material_grid_work_ids')) {
      return;
    }

    // Get the common render array, used by all material grid paragraphs.
    $render = $this->materialGridRenderArray($paragraph);

    $materials = [];
    $work_ids = (array) $paragraph->get('field_material_grid_work_ids')->getValue();

    foreach ($work_ids as $work_id) {
      $wid = $work_id['value'];
      $material_type = $work_id['material_type'];

      $materials[] = [
        'wid' => $wid,
        'materialType' => $material_type,
      ];
    }

    $render['#name'] = 'material-grid-manual';
    $render['#data']['materials'] = $materials;

    $variables['content'] = [
      'material_grid' => $render,
    ];
  }

  /**
   * Adds navigation anchor links to user registration link lists.
   *
   * Checks if the current paragraph has any sibling paragraphs of type
   * 'user_registration_section', and if so, it retrieves
   * 'user_registration_items' from that sibling to create navigation anchor
   * links.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph__user_registration_linklist')]
  public function addLinklistAnchorLinks(array &$variables): void {
    $paragraph = $variables['paragraph'];

    if ($paragraph->getParentEntity() && $paragraph->getParentEntity()->hasField('field_paragraphs')) {
      $parent = $paragraph->getParentEntity();
      $siblings = $parent->get('field_paragraphs')->referencedEntities();

      foreach ($siblings as $sibling) {
        if ($sibling->bundle() === 'user_registration_section') {
          if ($sibling->hasField('field_user_registration_items')) {
            $user_registration_items = $sibling->get('field_user_registration_items')->referencedEntities();
            $variables['anchor_links'] = $this->navigationAnchorLinks($user_registration_items);
          }
        }
      }
    }
  }

  /**
   * Adds navigation anchor links to user registration sections.
   *
   * Only done when there's no 'user_registration_linklist' paragraph among the
   * siblings, as that displays the links instead.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph__user_registration_section')]
  public function addSectionAnchorLinks(array &$variables): void {
    $user_registration_section = $variables['paragraph'] ?? NULL;

    if (!($user_registration_section instanceof ParagraphInterface || !$user_registration_section->hasField('field_material_grid_title'))) {
      return;
    }

    if ($user_registration_section->getParentEntity() && $user_registration_section->getParentEntity()->hasField('field_paragraphs')) {
      $parent = $user_registration_section->getParentEntity();
      $siblings = $parent->get('field_paragraphs')->referencedEntities();

      foreach ($siblings as $sibling) {
        // Check if any sibling is of type 'user_registration_linklist'.
        if ($sibling->bundle() === 'user_registration_linklist') {
          return;
        }
      }
    }

    $user_registration_items = $user_registration_section->get('field_user_registration_items')->referencedEntities();
    $variables['anchor_links'] = $this->navigationAnchorLinks($user_registration_items);
  }

  /**
   * Adds rendered events to manual event lists.
   *
   * Adds rendered event entities to the paragraph's variables for use in
   * templates, utilizing the 'list_teaser' view mode.
   *
   * @param array<mixed> $variables
   *   Variables to be passed to the template.
   */
  #[Hook('preprocess_paragraph__manual_event_list')]
  public function addRenderedEvents(array &$variables): void {
    $paragraph = $variables['paragraph'] ?? NULL;

    if (!($paragraph instanceof ParagraphInterface) || !$paragraph->hasField('field_events')) {
      return;
    }
    $events = $paragraph->get('field_events')->referencedEntities();
    $renderedEvents = [];

    foreach ($events as $event) {
      /** @var \Drupal\recurring_events\Entity\EventInstance $event */
      $viewBuilder = $this->entityTypeManager->getViewBuilder($event->getEntityTypeId());
      $renderedEvents[] = $viewBuilder->view($event, 'list_teaser');
    }
    $variables['rendered_field_events'] = $renderedEvents;
  }

  /**
   * Renders the share buttons React app in share buttons paragraphs.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph__share_buttons')]
  public function addShareButtonsApp(array &$variables): void {
    $paragraph = $variables['paragraph'] ?? NULL;
    $view_mode = $variables['view_mode'] ?? NULL;

    if ($view_mode === 'preview' || !($paragraph instanceof ParagraphInterface)) {
      return;
    }

    $variables['content']['react_app'] = [
      '#theme' => 'dpl_react_app',
      '#name' => 'share-buttons',
      '#data' => [
        'share-on-facebook-text' => $this->t('Share on Facebook', [], ['context' => 'Share buttons']),
        'share-on-facebook-aria-label-text' => $this->t('Share this page on Facebook', [], ['context' => 'Share buttons']),
        'copy-link-text' => $this->t('Copy link', [], ['context' => 'Share buttons']),
        'copy-link-aria-label-text' => $this->t('Copy link to this page', [], ['context' => 'Share buttons']),
        'copy-link-success-text' => $this->t('Link copied', [], ['context' => 'Share buttons']),
      ],
    ];
  }

  /**
   * Prepares the common React app data for the Material Grid paragraphs.
   *
   * @see \Drupal\dpl_react_apps\Controller\DplReactAppsController
   *
   * @return array<mixed>
   *   A render array that can be expanded.
   */
  protected function materialGridRenderArray(ParagraphInterface $paragraph): array {
    $title = NULL;
    $description = NULL;
    $display_amount = 8;

    if ($paragraph->hasField('field_material_grid_title')) {
      $title = $paragraph->get('field_material_grid_title')->getString();
    }

    if ($paragraph->hasField('field_material_grid_description')) {
      $description = $paragraph->get('field_material_grid_description')->getString();
    }

    if ($paragraph->hasField('field_material_amount')) {
      $display_amount = (int) $paragraph->get('field_material_amount')->getString();
    }

    // Build configurations for blacklisted search branches and all branches.
    $blacklisted_search_branches_config = DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedSearchBranches());
    $branches_config = DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches(), TRUE);

    return [
      '#theme' => 'dpl_react_app',
      '#data' => [
        'title' => $title,
        'description' => $description,
        'requested-amount' => $display_amount,
        'button-text' => $this->t('Show all', [], ['context' => 'Material Grid']),
        'blacklisted-search-branches-config' => $blacklisted_search_branches_config,
        'branches-config' => $branches_config,
      ] + DplReactAppsController::externalApiBaseUrls(),
    ];
  }

  /**
   * Creates anchor links for user_registration_items.
   *
   * @param \Drupal\paragraphs\Entity\Paragraph[] $paragraphs
   *   An array of paragraph entities to process.
   *
   * @return array<array{title: string, anchor_id: string}>
   *   An array of anchor link information including titles and anchor IDs.
   */
  protected function navigationAnchorLinks(array $paragraphs): array {
    $anchor_links = [];

    // Creates anchor links for items that should be displayed in the
    // navigation.
    foreach ($paragraphs as $paragraph) {
      if ($paragraph->get('field_display_in_navigation')->value == 1) {
        $navigation_title = $paragraph->get('field_navigation_title')->value ?? $paragraph->get('field_title')->value;
        $anchor_id = $paragraph->get('field_anchor')->value ?? 'anchor-' . $paragraph->id();
        $anchor_links[] = [
          'title' => $navigation_title,
          'anchor_id' => $anchor_id,
        ];
      }
    }

    return $anchor_links;
  }

}
