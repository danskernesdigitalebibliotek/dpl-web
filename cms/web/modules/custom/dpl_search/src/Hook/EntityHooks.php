<?php

declare(strict_types=1);

namespace Drupal\dpl_search\Hook;

use Drupal\Core\Entity\Display\EntityViewDisplayInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_search\DplSearchSettings;
use Drupal\dpl_search\WebSearchTeaser;
use Drupal\node\NodeInterface;

/**
 * Entity hooks for dpl_search module.
 */
class EntityHooks {

  use StringTranslationTrait;

  public function __construct(
    protected GeneralSettings $generalSettings,
    protected WebSearchTeaser $webSearchTeaser,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Show the web search teaser on the zero hits page.
   *
   * The search result app redirects here when a material search has no hits,
   * carrying its q and facets query parameters, so the visitor can still
   * reach the web results for the same phrase.
   *
   * @param mixed[] $build
   *   The render array of the node.
   * @param \Drupal\node\NodeInterface $node
   *   The node being viewed.
   * @param \Drupal\Core\Entity\Display\EntityViewDisplayInterface $display
   *   The entity view display.
   * @param string $view_mode
   *   The view mode.
   */
  #[Hook('node_view')]
  public function addZeroHitsWebSearchTeaser(array &$build, NodeInterface $node, EntityViewDisplayInterface $display, string $view_mode): void {
    // Only the page bundle has a template that renders the teaser element.
    if ($view_mode !== 'full' || $node->bundle() !== 'page') {
      return;
    }

    // Which node is the zero hits page is configuration, so cached builds
    // must be invalidated when it changes.
    foreach ($this->generalSettings->getCacheTags() as $cache_tag) {
      $build['#cache']['tags'][] = $cache_tag;
    }

    if ((string) $node->id() !== $this->generalSettings->getZeroHitsSearchNodeId()) {
      return;
    }

    $build['#cache']['contexts'][] = 'url.query_args:' . DplSearchSettings::MATERIAL_QUERY_KEY;
    $build['#cache']['contexts'][] = 'url.query_args:' . DplSearchSettings::FACETS_QUERY_KEY;

    $cache_tags = [];
    $config = $this->webSearchTeaser->getConfig($cache_tags);

    foreach ($cache_tags as $cache_tag) {
      $build['#cache']['tags'][] = $cache_tag;
    }

    if (!$config) {
      return;
    }

    $build['web_search_teaser'] = [
      '#type' => 'inline_template',
      '#template' => '<p class="article-header__info">{{ link_text }} <a class="link-tag" href="{{ url }}">{{ phrase }} ({{ total }})</a></p>',
      '#context' => [
        // Same string and context as web-search-link-text in
        // DplReactAppsController, so both surfaces share one translation.
        'link_text' => $this->t('Switch to the results for the library content.', [], ['context' => 'Search Result']),
        'url' => $config['webSearchUrl'],
        'phrase' => $config['webSearchText'],
        'total' => $config['webSearchTotal'],
      ],
    ];
  }

}
