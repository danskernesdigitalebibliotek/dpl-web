<?php

namespace Drupal\dpl_breadcrumb\Services;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Breadcrumb\Breadcrumb;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\node\Entity\Node;
use Drupal\pathauto\AliasCleanerInterface;
use Drupal\taxonomy\TermInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Menu Helper service for DPL breadcrumb.
 */
class BreadcrumbHelper {

  /**
   * The entity type interface.
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * The language manager.
   */
  protected LanguageManagerInterface $languageManager;

  /**
   * PathAuto alias cleaner.
   */
  protected AliasCleanerInterface $aliasCleaner;

  /**
   * Translation interface.
   */
  protected TranslationInterface $translation;

  /**
   * Should the current page also be shown in the breadcrumb?
   */
  protected bool $includeCurrentPage = TRUE;

  /**
   * The vocabulary ID, of the taxonomy tree used for content structure.
   */
  protected string $structureVid = 'breadcrumb_structure';

  /**
   * The field name of the node dropdown field, for choosing space in structure.
   */
  protected string $structureFieldName = 'field_breadcrumb_parent';

  /**
   * Max breadcrumb items to show in URL alias.
   */
  protected int $maxItemsUrl = 5;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    LanguageManagerInterface $language_manager,
    AliasCleanerInterface $alias_cleaner,
    TranslationInterface $translation
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->languageManager = $language_manager;
    $this->aliasCleaner = $alias_cleaner;
    $this->translation = $translation;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('language.manager'),
      $container->get('pathauto.alias_cleaner'),
      $container->get('string_translation'),
    );
  }

  /**
   * The vocabulary ID, of the taxonomy tree used for content structure.
   */
  public function getStructureVid(): string {
    return $this->structureVid;
  }

  /**
   * The field name of the node dropdown field, for choosing space in structure.
   */
  public function getStructureFieldName(): string {
    return $this->structureFieldName;
  }

  /**
   * Getting the breadcrumb, as a url string (/page/page2/page4).
   */
  public function getBreadcrumbUrlString(Node $node): ?string {
    $breadcrumb = $this->getBreadcrumb($node);

    $links = $breadcrumb->getLinks();

    if (empty($links)) {
      return NULL;
    }

    $links = array_reverse($links);
    $breadcrumb_string = '';

    $i = 1;

    foreach ($links as $link) {
      if ($i > $this->maxItemsUrl) {
        break;
      }

      $text = $link->getText();
      $text = ($text instanceof MarkupInterface) ? $text->__toString() : $text;

      if (is_string($text)) {
        $lang_code = $this->languageManager->getCurrentLanguage()->getId();

        $text = $this->aliasCleaner->cleanString(
          $text,
          ['langcode' => $lang_code]
        );

        $breadcrumb_string .= "/$text";
      }

      $i++;
    }

    // If the breadcrumb does not include the current page, we want to
    // add it manually, for the URL.
    if (!$this->includeCurrentPage) {
      $breadcrumb_string .= "/{$node->label()}";
    }

    return $breadcrumb_string;
  }

  /**
   * Build the breadcrumb array.
   */
  public function getBreadcrumb(Node $node): Breadcrumb {
    $breadcrumb = new Breadcrumb();
    $field_name = $this->getStructureFieldName();

    if ($node->hasField($field_name)) {
      $this->getStructureBreadcrumb($node, $breadcrumb);
    }

    if ($node->hasField('field_categories')) {
      $this->getCategoryBreadcrumb($node, $breadcrumb);
    }

    $this->getBaseBreadcrumb($node, $breadcrumb);

    return $breadcrumb;
  }

  /**
   * Build the base breadcrumb, based on possible branch references.
   */
  private function getBaseBreadcrumb(Node $node, Breadcrumb $breadcrumb): Breadcrumb {
    $branch = NULL;

    if ($node->hasField('field_branch')) {
      $branches = $node->get('field_branch')->referencedEntities();
      $branch = reset($branches);
    }

    if ($branch instanceof Node) {
      $breadcrumb->addLink(Link::createFromRoute(
        $branch->label() ?? '',
        'entity.node.canonical',
        ['node' => $branch->id()]
      ));
    }

    if ($node->bundle() === 'article') {
      $breadcrumb->addLink(Link::createFromRoute(
        $this->translation->translate('Articles'),
        'view.articles.page_1'
      ));
    }

    return $breadcrumb;
  }

  /**
   * Build a breadcrumb array, based on field_categories.
   */
  public function getCategoryBreadcrumb(Node $node, Breadcrumb $breadcrumb): Breadcrumb {
    if ($this->includeCurrentPage) {
      $breadcrumb->addLink(Link::createFromRoute(
        $node->label() ?? '',
        'entity.node.canonical',
        ['node' => $node->id()]
      ));
    }

    $categories = $node->get('field_categories')->referencedEntities();

    $category = reset($categories);

    if ($category instanceof TermInterface) {
      $category_id = intval($category->id());
      // Get all parent categories, including current.
      $categories = $this->entityTypeManager->getStorage("taxonomy_term")
        ->loadAllParents($category_id);

      foreach ($categories as $category) {
        $breadcrumb->addLink(Link::createFromRoute(
          $category->getName(),
          // We do not have a term page ready yet, so we will not add a link.
          '<nolink>'
        ));
      }
    }

    return $breadcrumb;
  }

  /**
   * Find a breadcrumb item by node, if it is added to the content structure.
   */
  public function getBreadcrumbItem(Node $node): ?TermInterface {
    $storage = $this->entityTypeManager->getStorage('taxonomy_term');

    $nid = $node->id();

    if (!$nid) {
      return NULL;
    }

    $breadcrumb_items = $storage->loadByProperties([
      'field_content' => $node->id(),
      'vid' => $this->getStructureVid(),
    ]);

    $breadcrumb_item = reset($breadcrumb_items);

    if ($breadcrumb_item instanceof TermInterface) {
      return $breadcrumb_item;
    }

    return NULL;
  }

  /**
   * Find a breadcrumb item that is referenced by a node's breadcrumb field.
   */
  public function getReferencedBreadcrumbItem(Node $node): ?TermInterface {
    $field_key = $this->getStructureFieldName();

    if (!$node->hasField($field_key) || $node->get($field_key)->isEmpty()) {
      return NULL;
    }

    $breadcrumb_items = $node->get($field_key)->referencedEntities();

    return reset($breadcrumb_items);
  }

  /**
   * Build a breadcrumb array, based on the custom content structure.
   */
  public function getStructureBreadcrumb(Node $node, Breadcrumb $breadcrumb): Breadcrumb {
    $breadcrumb_item = $this->getBreadcrumbItem($node);

    if (!($breadcrumb_item instanceof TermInterface)) {
      $breadcrumb_item = $this->getReferencedBreadcrumbItem($node);

      if ($this->includeCurrentPage) {
        $breadcrumb->addLink(Link::createFromRoute(
          $node->label() ?? '',
          'entity.node.canonical',
          ['node' => $node->id()]
        ));
      }
    }

    if (!($breadcrumb_item instanceof TermInterface)) {
      return $breadcrumb;
    }

    $breadcrumb_items = $this->getStructureTree($breadcrumb_item);

    foreach ($breadcrumb_items as $item) {
      $breadcrumb->addLink(Link::createFromRoute(
        $item->getName(),
        'entity.node.canonical',
        ['node' => $item->get('field_content')->getString()]
      ));
    }

    return $breadcrumb;
  }

  /**
   * Get the full structure tree of this breadcrumb item (including the item).
   *
   * @return array<mixed>
   *   An array of breadcrumb items, to be rendered, with text and route info.
   */
  public function getStructureTree(TermInterface $breadcrumb_item): array {
    /** @var \Drupal\taxonomy\TermStorage $storage */
    $storage = $this->entityTypeManager->getStorage('taxonomy_term');
    $tid = $breadcrumb_item->id();

    if (empty($tid)) {
      return [];
    }

    $full_tree = $storage->loadAllParents(intval($tid));

    if (!empty($full_tree) && !$this->includeCurrentPage) {
      array_shift($full_tree);
    }

    return $full_tree;
  }

  /**
   * Get the possible parent of this breadcrumb item.
   */
  public function getStructureParent(TermInterface $breadcrumb_item): ?TermInterface {
    $parents = $this->getStructureTree($breadcrumb_item);

    // The first item is the actual current breadcrumb item.
    // We want the second item (if it exists).
    if (count($parents) < 2) {
      return NULL;
    }

    $slice = array_slice($parents, 1, 1, TRUE);

    return reset($slice);
  }

  /**
   * Get content that references this breadcrumb item, and render it.
   *
   * @return array<mixed>
   *   An array of rendered content entities.
   */
  public function getRenderedReferencingContent(TermInterface $breadcrumb_item, string $view_mode = 'nav_teaser'): array {
    $field_name = $this->getStructureFieldName();

    $node_storage = $this->entityTypeManager->getStorage('node');
    $query = $node_storage->getQuery();
    $nids = $query
      ->condition($field_name, $breadcrumb_item->id())
      ->accessCheck(TRUE)
      ->sort('title', 'ASC')
      ->execute();

    $nodes = $node_storage->loadMultiple($nids);

    $view_builder = $this->entityTypeManager->getViewBuilder('node');

    $rendered_nodes = [];

    foreach ($nodes as $node) {
      $rendered_nodes[] = $view_builder->view($node, $view_mode);
    }

    return $rendered_nodes;
  }

}
