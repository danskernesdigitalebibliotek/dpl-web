<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Services;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Path\PathMatcherInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Url;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\handy_cache_tags\HandyCacheTagsManager;
use Drupal\link\Plugin\Field\FieldType\LinkItem;
use Drupal\node\NodeInterface;
use Drupal\path_alias\AliasManagerInterface;

/**
 * Finds the service messages that belong on the page being rendered.
 */
class ServiceMessageLoader {

  /**
   * The node bundle holding service messages.
   */
  public const BUNDLE = 'service_message';

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected RouteMatchInterface $routeMatch,
    protected PathMatcherInterface $pathMatcher,
    protected HandyCacheTagsManager $cacheTagsManager,
    protected AliasManagerInterface $aliasManager,
    protected ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * Build the global bar for the current page, if a message is active.
   *
   * @return array<string, mixed>
   *   A render array, empty if no global message is active.
   */
  public function buildGlobal(): array {
    $node = $this->loadGlobal();

    if (!$node instanceof NodeInterface) {
      // The bundle tag still has to be on the page: publishing the first
      // global message must invalidate pages rendered without one.
      return $this->emptyBuild(FALSE);
    }

    return [
      '#theme' => 'dpl_service_message_bar',
      '#message' => $this->messageVariables($node),
      '#cache' => $this->cacheMetadata(FALSE),
    ];
  }

  /**
   * Build the in-page container for the current page.
   *
   * @return array<string, mixed>
   *   A render array, empty if no message targets this page.
   */
  public function buildInPage(): array {
    $nodes = $this->loadInPage();

    if (!$nodes) {
      return $this->emptyBuild(TRUE);
    }

    return [
      '#theme' => 'dpl_service_messages',
      '#messages' => array_map($this->messageVariables(...), $nodes),
      '#cache' => $this->cacheMetadata(TRUE),
    ];
  }

  /**
   * Load the active global message.
   *
   * Only one global message is meant to be published at a time - see
   * GlobalMessageInvariant. Rendering picks the newest defensively rather
   * than trusting the data to hold a single one.
   */
  public function loadGlobal(): ?NodeInterface {
    $storage = $this->entityTypeManager->getStorage('node');

    $ids = $storage->getQuery()
      ->accessCheck(TRUE)
      ->condition('type', self::BUNDLE)
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('field_svcmsg_placement', ServiceMessagePlacement::GlobalBar->value)
      ->sort('created', 'DESC')
      ->range(0, 1)
      ->execute();

    if (!$ids) {
      return NULL;
    }

    $node = $storage->load(reset($ids));

    return $node instanceof NodeInterface ? $node : NULL;
  }

  /**
   * Load the in-page messages targeting the page being rendered.
   *
   * @return \Drupal\node\NodeInterface[]
   *   The messages, newest first.
   */
  public function loadInPage(): array {
    $branch = $this->currentBranch();
    $is_front = $this->isFrontPage();

    if (!$is_front && !$branch instanceof NodeInterface) {
      return [];
    }

    $storage = $this->entityTypeManager->getStorage('node');

    $query = $storage->getQuery()
      ->accessCheck(TRUE)
      ->condition('type', self::BUNDLE)
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('field_svcmsg_placement', ServiceMessagePlacement::InPage->value)
      ->sort('created', 'DESC');

    // A message can name the front page, a set of branches, or both, so the
    // two targets are an OR rather than separate queries.
    $targets = $query->orConditionGroup();

    if ($is_front) {
      $targets->condition('field_svcmsg_frontpage', TRUE);
    }

    if ($branch instanceof NodeInterface) {
      $targets->condition('field_svcmsg_branches', $branch->id());
    }

    $ids = $query->condition($targets)->execute();

    if (!$ids) {
      return [];
    }

    return array_values($storage->loadMultiple($ids));
  }

  /**
   * Whether the page being rendered is the site's front page.
   *
   * Not simply PathMatcher: it compares the route's internal path against
   * `system.site` `page.front` verbatim, and that setting is local to each
   * library. A site that has it as an alias - `/frontpage` rather than
   * `/node/21` - never matches, and no service message would reach any front
   * page there. Resolving the alias covers both spellings.
   */
  protected function isFrontPage(): bool {
    if ($this->pathMatcher->isFrontPage()) {
      return TRUE;
    }

    $front = (string) $this->configFactory->get('system.site')->get('page.front');

    if ($front === '' || $this->routeMatch->getRouteName() === NULL) {
      return FALSE;
    }

    try {
      $current = '/' . Url::fromRouteMatch($this->routeMatch)->getInternalPath();
    }
    catch (\Exception) {
      // A route without a path of its own is never the front page.
      return FALSE;
    }

    return $this->aliasManager->getPathByAlias($front) === $current;
  }

  /**
   * The branch node whose page is being rendered, if any.
   */
  protected function currentBranch(): ?NodeInterface {
    if ($this->routeMatch->getRouteName() !== 'entity.node.canonical') {
      return NULL;
    }

    $node = $this->routeMatch->getParameter('node');

    if (!($node instanceof NodeInterface) || $node->bundle() !== 'branch') {
      return NULL;
    }

    return $node;
  }

  /**
   * Flatten a message node into the variables a template needs.
   *
   * @return array<string, mixed>
   *   Heading, body and link, any of which may be empty.
   */
  protected function messageVariables(NodeInterface $node): array {
    $link = $node->get('field_svcmsg_link')->first();

    return [
      'heading' => $node->get('field_svcmsg_heading')->getString(),
      'body' => $node->get('field_svcmsg_body')->isEmpty()
        ? NULL
        : $node->get('field_svcmsg_body')->view(['label' => 'hidden']),
      'url' => $link instanceof LinkItem ? $link->getUrl()->toString() : NULL,
    ];
  }

  /**
   * Cache metadata for a build.
   *
   * @param bool $per_path
   *   TRUE when what is rendered depends on the page being rendered.
   *
   * @return array<string, mixed>
   *   Cache keys for a render array.
   */
  protected function cacheMetadata(bool $per_path): array {
    return [
      'tags' => [$this->cacheTagsManager->getBundleTag('node', self::BUNDLE)],
      // The global bar is the same everywhere; which in-page messages apply
      // is a question about this page.
      'contexts' => $per_path ? ['url.path'] : [],
    ];
  }

  /**
   * A build carrying only cache metadata, so nothing renders.
   *
   * @param bool $per_path
   *   TRUE when what would have rendered depends on the page.
   *
   * @return array<string, mixed>
   *   A render array without output.
   */
  protected function emptyBuild(bool $per_path): array {
    return ['#cache' => $this->cacheMetadata($per_path)];
  }

}
