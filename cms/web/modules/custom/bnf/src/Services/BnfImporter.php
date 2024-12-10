<?php

namespace Drupal\bnf\Services;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use function Safe\json_decode;

/**
 * Service related to importing content from an external source.
 *
 * This is both relevant for the client and the server:
 * The client can request BNF to import a certain content (see BnfExporter),
 * and the client can also choose to import a content from BNF.
 */
class BnfImporter {

  const UUID_FIELD = 'field_bnf_uuid';

  /**
   * Constructor.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected TranslationInterface $translation,
    protected LoggerInterface $logger,
  ) {}

  /**
   * Importing a node from a GraphQL source endpoint.
   */
  public function importNode(string $uuid, string $endpoint_url, string $node_type = 'article'): void {
    $node_storage = $this->entityTypeManager->getStorage('node');

    $existing_nodes =
      $node_storage->loadByProperties([self::UUID_FIELD => $uuid]);

    if (!empty($existing_nodes)) {
      $this->logger->error(
        'Cannot import @type @uuid from @url - Node already exists.',
        ['@type' => $node_type, '@uuid' => $uuid, '@url' => $endpoint_url]
      );

      throw new \Exception((string) $this->translation->translate(
        'Cannot import node - already exists.', [], ['context' => 'BNF']
      ));
    }

    // Example of GraphQL query: "nodeArticle".
    $query_name = 'node' . ucfirst($node_type);

    // For now, we only support the title of the nodes.
    $query = <<<GRAPHQL
    query {
      $query_name(id: "$uuid") {
        title
      }
    }
    GRAPHQL;

    $client = new Client();

    $response = $client->post($endpoint_url, [
      'headers' => [
        'Content-Type' => 'application/json',
      ],
      // @todo Implement actual authentication. Is it OK to use
      // username/password, or do we need to do oAuth as they do in React?
      'auth' => ['graphql_consumer', 'test'],
      'json' => [
        'query' => $query,
      ],
    ]);

    $data = json_decode($response->getBody()->getContents(), TRUE);
    $node_data = $data['data'][$query_name] ?? NULL;

    if (empty($node_data)) {
      $this->logger->error('Could not find any node data in GraphQL response.');

      throw new \Exception((string) $this->translation->translate(
        'Could not retrieve content values.', [], ['context' => 'BNF']
      ));
    }

    try {
      $node_data['type'] = $node_type;
      $node_data[self::UUID_FIELD] = $uuid;

      $node = $node_storage->create($node_data);
      $node->save();
    }
    catch (\Exception $e) {
      $this->logger->error(
        'Failed to create node data. @message',
        ['@message' => $e->getMessage()]
      );

      throw new \Exception((string) $this->translation->translate(
        'Could not save content.', [], ['context' => 'BNF']
      ));
    }

    $this->logger->info('Created new @node_type node with BNF ID @uuid', [
      '@uuid' => $uuid,
      '@node_type' => $node_type,
    ]);

  }

}
