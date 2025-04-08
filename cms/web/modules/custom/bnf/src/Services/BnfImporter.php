<?php

namespace Drupal\bnf\Services;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\Exception\AlreadyExistsException;
use Drupal\bnf\GraphQL\Operations\GetNode;
use Drupal\bnf\GraphQL\Operations\GetNodeMetaData;
use Drupal\bnf\GraphQL\Operations\GetNodeMetaData\Node\NodeArticle as NodeArticleMetaData;
use Drupal\bnf\GraphQL\Operations\GetNodeMetaData\Node\NodeGoArticle as NodeGoArticleMetaData;
use Drupal\bnf\GraphQL\Operations\GetNodeMetaData\Node\NodeGoCategory as NodeGoCategoryMetaData;
use Drupal\bnf\GraphQL\Operations\GetNodeMetaData\Node\NodeGoPage as NodeGoPageMetaData;
use Drupal\bnf\GraphQL\Operations\GetNodeMetaData\Node\NodePage as NodePageMetaData;
use Drupal\bnf\MangleUrl;
use Drupal\bnf\SailorEndpointConfig;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Psr\Log\LoggerInterface;
use Spawnia\Sailor\Configuration;

/**
 * Service related to importing content from an external source.
 *
 * This is both relevant for the client and the server:
 * The client can request BNF to import a certain content (see BnfExporter),
 * and the client can also choose to import a content from BNF.
 */
class BnfImporter {

  const ALLOWED_CONTENT_TYPES = [
    'article',
    'page',
    'go_article',
    'go_category',
    'go_page',
  ];

  /**
   * Constructor.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected LoggerInterface $logger,
    protected BnfMapperManager $mapperManager,
  ) {}

  /**
   * Get node meta data from BNF.
   */
  public function getNodeMetaData(string $uuid, string $endpointUrl): NodeArticleMetaData|NodePageMetaData|NodeGoArticleMetaData|NodeGoCategoryMetaData|NodeGoPageMetaData {
    $endpointConfig = new SailorEndpointConfig(MangleUrl::server($endpointUrl));
    Configuration::setEndpointFor(GetNodeMetaData::class, $endpointConfig);
    $response = GetNodeMetaData::execute($uuid);

    $nodeData = $response->data?->node;

    if (!$nodeData) {
      throw new \RuntimeException('Could not fetch content.');
    }

    return $nodeData;
  }

  /**
   * Importing a node from a GraphQL source endpoint.
   */
  public function importNode(string $uuid, string $nodeType, string $endpointUrl): NodeInterface {
    if (!in_array($nodeType, self::ALLOWED_CONTENT_TYPES)) {
      throw new \InvalidArgumentException('The requested content type is not allowed.');
    }

    $nodeStorage = $this->entityTypeManager->getStorage('node');

    $existingNodes =
      $nodeStorage->loadByProperties(['uuid' => $uuid]);

    if (!empty($existingNodes)) {
      $this->logger->error(
        'Cannot import @type @uuid from @url - Node already exists.',
        ['@type' => $nodeType, '@uuid' => $uuid, '@url' => $endpointUrl]
      );

      throw new AlreadyExistsException('Cannot import node - already exists.');
    }

    try {
      $endpointConfig = new SailorEndpointConfig(MangleUrl::server($endpointUrl));
      Configuration::setEndpointFor(GetNode::class, $endpointConfig);
      $response = GetNode::execute($uuid);

      $nodeData = $response->data?->node;

      if (!$nodeData) {
        throw new \RuntimeException('Could not fetch content.');
      }

      $node = $this->mapperManager->map($nodeData);
      $info = $response->data?->info;

      if ($info?->name) {
        $node->set('bnf_source_name', $info->name);
      }

      // If no canonical URL is set explicitly, we'll set the path of
      // the original library.
      if ($node->hasField('field_canonical_url') && $node->get('field_canonical_url')->isEmpty()) {
        $node->set('field_canonical_url', [
          'uri' => $nodeData->url,
        ]);
      }

      $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::Imported);

      $node->set('status', NodeInterface::NOT_PUBLISHED);

      $node->save();
    }
    catch (\Throwable $e) {
      $this->logger->error(
        'Failed to import content. @message',
        ['@message' => $e->getMessage()]
      );

      throw new \RuntimeException('Could not import content.');
    }

    $this->logger->info('Created new @type node with BNF ID @uuid', [
      '@uuid' => $uuid,
      '@type' => $node->bundle(),
    ]);

    return $node;
  }

}
