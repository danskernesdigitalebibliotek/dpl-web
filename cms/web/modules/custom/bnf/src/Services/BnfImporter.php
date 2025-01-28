<?php

namespace Drupal\bnf\Services;

use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\MangleUrl;
use Drupal\bnf\Exception\AlreadyExistsException;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\ParagraphInterface;
use GuzzleHttp\ClientInterface;
use Psr\Log\LoggerInterface;
use function Safe\json_decode;
use function Safe\preg_replace;

/**
 * Service related to importing content from an external source.
 *
 * This is both relevant for the client and the server:
 * The client can request BNF to import a certain content (see BnfExporter),
 * and the client can also choose to import a content from BNF.
 */
class BnfImporter {

  const ALLOWED_PARAGRAPHS = [
    'ParagraphTextBody' => 'text_body',
    'ParagraphAccordion' => 'accordion',
  ];

  /**
   * Constructor.
   */
  public function __construct(
    protected ClientInterface $httpClient,
    protected EntityFieldManagerInterface $entityFieldManager,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected TranslationInterface $translation,
    protected LoggerInterface $logger,
  ) {}

  /**
   * Loading the columns of a field, that we use to ask GraphQL for data.
   *
   * E.g. a WYSIWYG field will have both a "value" and a "format" that we want
   * to pull out.
   *
   * @return mixed[]
   *   Return an array of fields, along with their column keys.
   */
  protected function getFieldColumns(string $entityType, string $bundle): array {
    $values = [];
    $fields = [];
    $fieldDefinitions = $this->entityFieldManager->getFieldDefinitions($entityType, $bundle);

    foreach ($fieldDefinitions as $fieldKey => $fieldDefinition) {
      if ($fieldDefinition instanceof FieldConfig) {
        $fields[] = $fieldKey;
      }
    }

    foreach ($fields as $fieldKey) {
      $field = $this->entityTypeManager->getStorage('field_storage_config')->load("$entityType.$fieldKey");

      if ($field instanceof FieldStorageConfig) {
        $values[$fieldKey] = array_keys($field->getColumns());
      }
    }

    return $values;
  }

  /**
   * Builds the query used to get data from the source.
   */
  public function getQuery(string $uuid, string $queryName): string {
    // Start building the GraphQL query.
    $query = <<<GRAPHQL
    query {
      info {
        name
        url
      }
      $queryName(id: "$uuid") {
        title
        path
        canonicalUrl {
          url
        }
        paragraphs {

    GRAPHQL;

    // Loop through allowed paragraphs and add their structures.
    foreach (self::ALLOWED_PARAGRAPHS as $graphBundle => $drupalBundle) {
      $query .= <<<GRAPHQL
          ... on $graphBundle {
            __typename

        GRAPHQL;

      // Add field columns for the current paragraph type.
      $fieldColumns = $this->getFieldColumns('paragraph', $drupalBundle);
      foreach ($fieldColumns as $fieldKey => $columns) {
        $fieldKey = $this->drupalFieldToGraphField($fieldKey);

        $columnsString = implode("\r\n ", $columns);
        $query .= <<<GRAPHQL
            $fieldKey {
              $columnsString
            }

            GRAPHQL;
      }

      // Close the paragraph type block.
      $query .= <<<GRAPHQL
          }

        GRAPHQL;
    }

    // Close the paragraphs and main query block.
    $query .= <<<GRAPHQL
        }
      }
    }
    GRAPHQL;

    return $query;
  }

  /**
   * Turn GraphQL field format (camelCase) to Drupal format (snake_case).
   */
  protected function graphFieldToDrupalField(string $fieldKey): string {
    // Prefix all capitalized letters with an underscore.
    $fieldKey = preg_replace('/(?<!^)[A-Z]/', '_$0', $fieldKey);

    // Lowercase everything.
    $fieldKey = strtolower($fieldKey);

    // Prefix with "field_".
    return "field_$fieldKey";
  }

  /**
   * Turn Drupal format (snake_case) to GraphQL field format (camelCase).
   */
  protected function drupalFieldToGraphField(string $fieldKey): string {
    // Remove 'field_' prefix, if it exists.
    if (str_starts_with($fieldKey, 'field_')) {
      $fieldKey = substr($fieldKey, strlen('field_'));
    }

    // Replace underscores with spaces.
    $fieldKey = str_replace('_', ' ', $fieldKey);

    // Convert the first character of each word to uppercase.
    $fieldKey = ucwords($fieldKey);

    // Remove all spaces.
    $fieldKey = str_replace(' ', '', $fieldKey);

    // Make first letter lowercase, to match camelCase.
    return lcfirst($fieldKey);
  }

  /**
   * Parses paragraphs from GraphQL node data into Drupal-compatible structures.
   *
   * @param mixed[] $nodeData
   *   The GraphQL node data containing paragraphs.
   *
   * @return mixed[]
   *   Array of paragraph values, that we can use to create paragraph entities.
   */
  protected function parseGraphParagraphs(array $nodeData) {
    $parsedParagraphs = [];

    // Ensure paragraphs exist in the GraphQL response.
    if (empty($nodeData['paragraphs'])) {
      return $parsedParagraphs;
    }

    foreach ($nodeData['paragraphs'] as $paragraphData) {
      $type = $paragraphData['__typename'] ?? '';

      // Convert typename to Drupal paragraph bundle name.
      $bundleName = self::ALLOWED_PARAGRAPHS[$type] ?? NULL;

      if (empty($bundleName)) {
        continue;
      }

      $paragraph = ['type' => $bundleName];

      // Map fields dynamically.
      foreach ($paragraphData as $key => $value) {
        if ($key === '__typename') {
          continue;
        }

        // Assume Drupal uses field names like "field_{key}".
        $drupalFieldName = $this->graphFieldToDrupalField($key);
        $paragraph[$drupalFieldName] = $value;
      }

      $parsedParagraphs[] = $paragraph;
    }

    return $parsedParagraphs;
  }

  /**
   * Creating the paragraphs, that we will add to the nodes.
   *
   * @param mixed[] $nodeData
   *   The GraphQL node data containing paragraphs.
   *
   * @return \Drupal\paragraphs\ParagraphInterface[]
   *   The paragraph entities.
   */
  protected function getParagraphs(array $nodeData): array {
    $parsedParagraphs = $this->parseGraphParagraphs($nodeData);
    $storage = $this->entityTypeManager->getStorage('paragraph');
    $paragraphs = [];
    foreach ($parsedParagraphs as $paragraphData) {
      $paragraph = $storage->create($paragraphData);

      if ($paragraph instanceof ParagraphInterface) {
        $paragraph->save();
        $paragraphs[] = $paragraph;
      }
    }

    return $paragraphs;
  }

  /**
   * Loading the data from a GraphQL endpoint.
   *
   * @return mixed[]
   *   Array of node values, that we can use to create node entities.
   */
  public function loadData(string $uuid, string $endpointUrl, string $nodeType = 'article'): array {
    $queryName = 'node' . ucfirst($nodeType);

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

    if (!filter_var($endpointUrl, FILTER_VALIDATE_URL)) {
      throw new \InvalidArgumentException('The provided callback URL is not valid.');
    }

    $parsedUrl = parse_url($endpointUrl);
    $scheme = $parsedUrl['scheme'] ?? NULL;

    // Setting up valid HTTPS in the dual site docker setup is involved, so we
    // have this env variable to allow regular HTTP. Apart from this exception,
    // HTTPS should always be used as basic HTTP auth is pretty close to sending
    // the password in plain-text.
    if (empty(getenv('BNF_ALLOW_HTTP'))) {
      if ($scheme !== 'https') {
        throw new \InvalidArgumentException('The provided callback URL must use HTTPS.');
      }
    }

    $query = $this->getQuery($uuid, $queryName);

    $response = $this->httpClient->request('post', MangleUrl::server($endpointUrl), [
      'headers' => [
        'Content-Type' => 'application/json',
      ],
      'auth' => ['bnf_graphql', getenv('BNF_GRAPHQL_CONSUMER_USER_PASSWORD')],
      'json' => [
        'query' => $query,
      ],
      // Make sure that the server is HTTPS.
      'verify' => TRUE,
    ]);

    $data = json_decode($response->getBody()->getContents(), TRUE);
    $nodeData = $data['data'] ?? NULL;

    if (empty($nodeData)) {
      $this->logger->error(
        'Could not find any node data in GraphQL response. @query',
        ['@query' => $query]
      );

      throw new \Exception('Could not retrieve content values.');
    }
    return $nodeData;

  }

  /**
   * Importing a node from a GraphQL source endpoint.
   */
  public function importNode(string $uuid, string $endpointUrl, string $nodeType = 'article'): NodeInterface {
    $nodeStorage = $this->entityTypeManager->getStorage('node');
    try {
      $data = $this->loadData($uuid, $endpointUrl, $nodeType);
      // Find node data, e.g. nodeArticle, nodePage etc.
      $nodeDataKeys = preg_grep('/^node[A-Z]/', array_keys($data));
      $nodeDataKey = $nodeDataKeys ? reset($nodeDataKeys) : [];
      $nodeData = $data[$nodeDataKey] ?? [];

      $baseUrl = $data['info']['url'] ?? NULL;
      $nodePath = $nodeData['path'] ?? NULL;
      $canonicalUrl = $nodeData['canonicalUrl']['url'] ?? NULL;
      $canonicalTitle = $nodeData['canonicalUrl']['title'] ?? NULL;

      // If no custom canonical URL is set, we'll set the context of where
      // we have exported the data from.
      if (empty($canonicalUrl) && $baseUrl && $nodePath) {
        $canonicalUrl = "$baseUrl$nodePath";
        $canonicalTitle = $data['info']['name'] ?? NULL;
      }

      $nodeCreation = [
        'status' => NodeInterface::NOT_PUBLISHED,
        'type' => $nodeType,
        'uuid' => $uuid,
        'title' => $nodeData['title'],
        'field_paragraphs' => $this->getParagraphs($nodeData),
        'field_canonical_url' => [
          'uri' => $canonicalUrl,
          'title' => $canonicalTitle,
        ],
      ];

      /** @var \Drupal\node\NodeInterface $node */
      $node = $nodeStorage->create($nodeCreation);
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

    return $node;
  }

}
