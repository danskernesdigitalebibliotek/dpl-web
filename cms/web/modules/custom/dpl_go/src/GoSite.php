<?php

declare(strict_types=1);

namespace Drupal\dpl_go;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\State\StateInterface;
use Drupal\dpl_lagoon\Services\LagoonRouteResolver;
use function Safe\parse_url;

/**
 * Service for getting Go site information.
 */
class GoSite {

  /**
   * Node storage.
   */
  protected EntityStorageInterface $nodeStorage;

  /**
   * Static node type cache.
   *
   * @var array<int, array<string, bool>>
   */
  protected $typeCoche = [];

  public function __construct(
    protected LagoonRouteResolver $lagoonRouteResolver,
    protected AccountInterface $currentUser,
    EntityTypeManagerInterface $entityTypeManager,
    protected StateInterface $state,
  ) {
    $this->nodeStorage = $entityTypeManager->getStorage('node');
  }

  /**
   * Is the current request considered "the Go site".
   *
   * This is true when the current user is the Go GraphQL consumer user that the
   * React front-end uses. Which is the only user given the "rewrite go urls"
   * permission.
   */
  public function isGoSite(): bool {
    // User 1 gets all permissions, but then they'll get redirected to the Go
    // site when they visit the site as the redirect to the front page that's
    // implicit in `/` gets rewritten, so exclude them. Means that user 1 can't
    // use the Go site, but they shouldn't be able to log into it anyway.
    return $this->currentUser->hasPermission('rewrite go urls') && $this->currentUser->id() != 1;
  }

  /**
   * Get the base URL for the CMS site.
   */
  public function getCmsBaseUrl(): string {
    $mainRoute = $this->lagoonRouteResolver->getMainRoute();

    if (!$mainRoute) {
      throw new \RuntimeException('Could not determine the CMS domain.');
    }

    return $mainRoute;
  }

  /**
   * Get the base URL for the Go site.
   */
  public function getGoBaseUrl(): string {
    // If the GO_DOMAIN environment variable is set,
    // it will override anything else.
    $goDomain = getenv('GO_DOMAIN') ?: NULL;

    if ($goDomain) {
      return $goDomain;
    }

    $urlParsed = parse_url($this->getCmsBaseUrl());

    // These two parts are required.
    if (isset($urlParsed['scheme']) || isset($urlParsed['host'])) {
      $host = $urlParsed['host'];

      if (str_starts_with($host, 'www.')) {
        $host = str_replace('www.', 'www.go.', $host);
      }
      else {
        $host = "go.{$host}";
      }

      $goDomain = sprintf('%s://%s%s', $urlParsed['scheme'], $host, $urlParsed['path'] ?? '');
    }

    if (!$goDomain) {
      throw new \RuntimeException('Could not determine the Go domain.');
    }

    return $goDomain;
  }

  /**
   * Determine if the given node is a Go node.
   */
  public function isGoNode(EntityInterface $node): bool {
    return str_starts_with($node->bundle(), 'go_');
  }

  /**
   * Determine if the given nid is a Go node.
   */
  public function isGoNid(string $nid): ?bool {
    // We store our cache of node types in chunks of 100 to limit the amount of
    // state items and queries. And we use state instead of cache as a nodes
    // type cannot be changed after creation anyway, and even CACHE_PERMANENT
    // entries are cleared on cache rebuild.
    $cache_num = floor(intval($nid) / 100);
    $state_id = "dpl_go.node_type_cache_{$cache_num}";

    // Use a static cache. This will drastically limit the amount of queries we
    // need to do.
    if (!isset($this->typeCoche[$cache_num])) {
      $this->typeCoche[$cache_num] = $this->state->get($state_id, []);
    }

    if (isset($this->typeCoche[$cache_num][$nid])) {
      return $this->typeCoche[$cache_num][$nid];
    }

    $this->typeCoche[$cache_num][$nid] = NULL;

    $node = $this->nodeStorage->load($nid);

    if ($node) {
      $this->typeCoche[$cache_num][$nid] = $this->isGoNode($node);
    }

    // Add in fresh copy of saved state to guard against race conditions.
    $this->typeCoche[$cache_num] += $this->state->get($state_id, []);

    // While the types of existing nodes don't change, the non-existence of a
    // node (signified by null values) might, so filter out the null values
    // before saving so it'll not stick around to future requests.
    $filtered = array_filter($this->typeCoche[$cache_num], fn ($val) => !is_null($val));
    if (!empty($filtered)) {
      $this->state->set($state_id, $filtered);
    }
    else {
      $this->state->delete($state_id);
    }

    return $this->typeCoche[$cache_num][$nid];
  }

}
