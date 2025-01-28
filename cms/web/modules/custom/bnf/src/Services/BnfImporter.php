<?php

namespace Drupal\bnf\Services;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\Exception\AlreadyExistsException;
use Drupal\bnf\GraphQL\Operations\GetNode;
use Drupal\bnf\GraphQL\Operations\GetNodeTitle;
use Drupal\bnf\MangleUrl;
use Drupal\bnf\SailorEndpointConfig;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\node\NodeInterface;
use GuzzleHttp\ClientInterface;
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

  /**
   * Constructor.
   */
  public function __construct(
    protected ClientInterface $httpClient,
    protected EntityFieldManagerInterface $entityFieldManager,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected TranslationInterface $translation,
    protected LoggerInterface $logger,
    protected BnfMapperManager $mapperManager,
  ) {}

  /**
   * Get node title from BNF.
   */
  public function getNodeTitle(string $uuid, string $endpointUrl): string {
    $endpointConfig = new SailorEndpointConfig(MangleUrl::server($endpointUrl));
    Configuration::setEndpointFor(GetNodeTitle::class, $endpointConfig);
    $response = GetNodeTitle::execute($uuid);

    $nodeData = $response->data?->node;

    if (!$nodeData) {
      throw new \RuntimeException('Could not fetch content.');
    }

    return $nodeData->title;
  }

  /**
   * Importing a node from a GraphQL source endpoint.
   */
  public function importNode(string $uuid, string $endpointUrl, string $nodeType = 'article'): NodeInterface {
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

      $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::Imported->value);

      $node->set('status', NodeInterface::NOT_PUBLISHED);

      // @todo Deal with canonical URL.
      // CMS -> BNF: Set to site URL.
      // BNF -> CMS: Copy whatever BNF says.

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
