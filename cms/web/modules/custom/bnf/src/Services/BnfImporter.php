<?php

namespace Drupal\bnf\Services;

use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\Exception\AlreadyExistsException;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use GuzzleHttp\ClientInterface;
use Psr\Log\LoggerInterface;
use function Safe\json_decode;
use function Safe\parse_url;

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
    protected EntityTypeManagerInterface $entityTypeManager,
    protected TranslationInterface $translation,
    protected LoggerInterface $logger,
  ) {}

  /**
   * Importing a node from a GraphQL source endpoint.
   */
  public function importNode(string $uuid, string $endpointUrl, string $nodeType = 'article'): void {
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

    // Example of GraphQL query: "nodeArticle".
    $queryName = 'node' . ucfirst($nodeType);

    // For now, we only support the title of the nodes.
    $query = <<<GRAPHQL
    query {
      $queryName(id: "$uuid") {
        title
      }
    }
    GRAPHQL;

    if (!filter_var($endpointUrl, FILTER_VALIDATE_URL)) {
      throw new \InvalidArgumentException('The provided callback URL is not valid.');
    }

    $parsedUrl = parse_url($endpointUrl);
    $scheme = $parsedUrl['scheme'] ?? NULL;

    if ($scheme !== 'https') {
      throw new \InvalidArgumentException('The provided callback URL must use HTTPS.');
    }

    $response = $this->httpClient->request('post', $endpointUrl, [
      'headers' => [
        'Content-Type' => 'application/json',
      ],
      'auth' => [getenv('GRAPHQL_USER_NAME'), getenv('GRAPHQL_USER_PASSWORD')],
      'json' => [
        'query' => $query,
      ],
      // Make sure that the server is HTTPS.
      'verify' => TRUE,
    ]);

    $data = json_decode($response->getBody()->getContents(), TRUE);
    $nodeData = $data['data'][$queryName] ?? NULL;

    if (empty($nodeData)) {
      $this->logger->error('Could not find any node data in GraphQL response.');

      throw new \Exception('Could not retrieve content values.');
    }

    try {
      $nodeData['type'] = $nodeType;
      $nodeData['uuid'] = $uuid;

      $node = $nodeStorage->create($nodeData);
      $node->save();

      $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::Imported->value);
      $node->save();
    }
    catch (\Exception $e) {
      $this->logger->error(
        'Failed to create node data. @message',
        ['@message' => $e->getMessage()]
      );

      throw new \Exception('Could not save content.');
    }

    $this->logger->info('Created new @type node with BNF ID @uuid', [
      '@uuid' => $uuid,
      '@type' => $nodeType,
    ]);

  }

}
