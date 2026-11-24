<?php

declare(strict_types=1);

namespace Drupal\dpl_search\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Drupal\dpl_search\DplSearchSettings;
use Drupal\dpl_search\WebSearchTeaser;
use Drupal\taxonomy\TermInterface;
use Drupal\views\ViewExecutable;
use Drupal\views\Views;
use Symfony\Component\HttpFoundation\RequestStack;
use function Safe\json_encode;

/**
 * Theme hooks for dpl_search module.
 */
class ThemeHooks {

  use StringTranslationTrait;

  public function __construct(
    protected RouteMatchInterface $routeMatch,
    protected RequestStack $requestStack,
    protected WebSearchTeaser $webSearchTeaser,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Define the dpl_search_header theme hook.
   *
   * @return array<string, mixed>
   *   The theme hooks the module defines.
   */
  #[Hook('theme')]
  public function theme(): array {
    return [
      'dpl_search_header' => [
        'variables' => [
          'form_route' => NULL,
          'default_input' => NULL,
        ],
      ],
    ];
  }

  /**
   * Add a web search teaser to the material search result app.
   *
   * Links to the editorial web search if the search string has any results
   * there.
   *
   * @param mixed[] $variables
   *   The variables for the theme hook.
   */
  #[Hook('preprocess_dpl_react_app')]
  public function addWebSearchTeaserToSearchResult(array &$variables): void {
    $name = $variables['name'] ?? NULL;

    if ($name !== 'search-result') {
      return;
    }

    // The web search teaser below is derived from the q and facets query
    // parameters, so the render cache must vary on them.
    $variables['#cache']['contexts'][] = 'url.query_args:' . DplSearchSettings::MATERIAL_QUERY_KEY;
    $variables['#cache']['contexts'][] = 'url.query_args:' . DplSearchSettings::FACETS_QUERY_KEY;

    $cache_tags = [];
    $config = $this->webSearchTeaser->getConfig($cache_tags);

    foreach ($cache_tags as $cache_tag) {
      $variables['#cache']['tags'][] = $cache_tag;
    }

    if (!$config) {
      return;
    }

    $variables['attributes']['data-web-search-config'] = json_encode($config);
  }

  /**
   * Set the title of the editorial search view and link to material search.
   *
   * @param mixed[] $variables
   *   The variables for the views template.
   */
  #[Hook('preprocess_views_view')]
  public function prepareEditorialSearchView(array &$variables): void {
    $view = $variables['view'] ?? NULL;
    $id = $variables['id'] ?? NULL;
    if ($id !== DplSearchSettings::EDITORIAL_VIEW_ID || !$view instanceof ViewExecutable) {
      return;
    }

    if ($view->current_display !== 'page') {
      return;
    }

    // Hiding the exposed search filter, as we display it in the header.
    unset($variables['exposed']);

    $exposed_inputs = $view->getExposedInput();
    $search_input = $exposed_inputs[DplSearchSettings::EDITORIAL_QUERY_KEY] ?? NULL;

    if ($search_input) {
      $title = $this->t(
        'Showing web results for "@input" (@total_results)',
        ['@input' => $search_input, '@total_results' => $view->total_rows],
        ['context' => 'dpl_search']
      );

      $material_url = Url::fromRoute('dpl_react_apps.search_result', [], ['query' => [DplSearchSettings::MATERIAL_QUERY_KEY => $search_input]])->toString();

      $variables['header']['description'] = [
        '#prefix' => '<h2 class="content-list-page__subheading">' . $this->t('Switch to results for the', [], ['context' => 'dpl_search']) . ' <a href="' . $material_url . '">',
        '#suffix' => '</a></h2>',
        '#markup' => $this->t('library materials.', [], ['context' => 'dpl_search']),
      ];

    }
    else {
      $title = $this->t(
        'Showing web results (@total_results)',
        ['@total_results' => $view->total_rows],
        ['context' => 'dpl_search']
      );
    }

    $view->setTitle($title);
  }

  /**
   * Add the search header to the page.
   *
   * On the editorial search view, the material search header is replaced
   * with a form that leads to the editorial search, so the user can see and
   * change their fulltext search in the header.
   *
   * @param mixed[] $variables
   *   The variables for the page template.
   */
  #[Hook('preprocess_page')]
  public function addSearchHeader(array &$variables): void {
    $route_name = $this->routeMatch->getRouteName();
    $view_route_name = 'view.' . DplSearchSettings::EDITORIAL_VIEW_ID . '.page';
    if ($route_name === $view_route_name) {
      $variables['search']['header'] = [
        '#theme' => 'dpl_search_header',
        '#form_route' => $view_route_name,
        '#default_input' => $this->requestStack->getCurrentRequest()?->query->get(DplSearchSettings::EDITORIAL_QUERY_KEY),
      ];

      return;
    }

    // We are not on the editorial search page - Let's just add the standard
    // material search header, powered by react.
    $variables['search']['header'] = [
      '#theme' => 'dpl_react_app',
      '#name' => 'search-header',
      '#data' => [
          // Add external API base urls.
        ] + DplReactAppsController::externalApiBaseUrls(),
    ];
  }

  /**
   * Show a view of tagged content on category and tag terms.
   *
   * The view is identical to the editorial view on /search/web, but with
   * contextual filters applied.
   *
   * @param mixed[] $variables
   *   The variables for the taxonomy term template.
   */
  #[Hook('preprocess_taxonomy_term')]
  public function addTaggedContentView(array &$variables): void {
    $view_mode = $variables['view_mode'] ?? NULL;

    // If we're not on the full display, we don't want to load the search view.
    if ($view_mode !== 'full') {
      return;
    }

    $term = $variables['term'] ?? NULL;
    $bundle = $term?->bundle();

    // The vocabularies we allow as contextual filters in the embedded view.
    // ! IMPORTANT ! - The order in this array matters, as views does not allow
    // for named contextual filters - it MUST match the order that is set in
    // the Views UI.
    $allowed_contextual_vocabularies = [
      'categories',
      'tags',
    ];

    if (!($term instanceof TermInterface) ||
        !in_array($bundle, $allowed_contextual_vocabularies)) {
      return;
    }

    $contextual_filters = [];

    // Looping through the allowed vocabularies, and setting the current
    // term as a contextual filter, if the term is in that vocabulary.
    foreach ($allowed_contextual_vocabularies as $vocabulary) {
      if ($vocabulary === $bundle) {
        $contextual_filters[] = $term->id();
      }
      else {
        $contextual_filters[] = 'all';
      }
    }

    $view = Views::getView(DplSearchSettings::EDITORIAL_VIEW_ID);

    if (!($view instanceof ViewExecutable)) {
      return;
    }

    $view->setDisplay('term_page');
    $view->setArguments($contextual_filters);
    $view->execute();
    $view->setTitle($this->t(
      'Showing web results related to "@term" (@total_results)',
      ['@term' => (string) $term->label(), '@total_results' => $view->total_rows],
      ['context' => 'dpl_search']
    ));

    // We only want the view to show up - not the title, which cannot be
    // removed through the Drupal admin UI.
    unset($variables['content']);

    $variables['content']['view'] = $view->buildRenderable('term_page');
  }

}
