<?php

namespace Drupal\bnf\Services;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\GraphQL\Operations\GetNode;
use Drupal\bnf\GraphQL\Operations\GetNodeTitle;
use Drupal\bnf\GraphQL\Operations\NewContent;
use Drupal\bnf\MangleUrl;
use Drupal\bnf\SailorEndpointConfig;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Psr\Log\LoggerInterface;
use Safe\DateTimeImmutable;
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
    protected LoggerInterface $logger,
    protected BnfMapperManager $mapperManager,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Get node title from BNF.
   */
  public function getNodeTitle(string $uuid, string $endpointUrl): string {
    $this->setEndpoint($endpointUrl);

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
  public function importNode(string $uuid, string $endpointUrl): NodeInterface {
    $this->setEndpoint($endpointUrl);

    try {
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
      $node->set('status', $nodeData->status);

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

  /**
   * Get new content on subscription.
   *
   * Returns UUIDs of new/updated content, and the timestamp of the last change
   * (suitable for passing to this function as `since` the next time round).
   *
   * @return array{'uuids': string[], 'youngest': int}
   *   Updated content data.
   */
  public function newContent(string $uuid, int $since, string $endpointUrl): array {
    $this->setEndpoint($endpointUrl);

    try {
      $response = NewContent::execute($uuid, (new DateTimeImmutable("@$since"))->format(\DateTimeInterface::RFC3339));
      $newContent = $response->errorFree()->data->newContent;

      if ($newContent->errors) {
        foreach ($newContent->errors as $error) {
          $this->logger->error('GraphQL error querying new content: @message', ['@message' => $error->message]);
        }
      }

      if ($newContent->uuids) {
        return [
          'uuids' => $newContent->uuids,
          'youngest' => DateTimeImmutable::createFromFormat(\DateTimeInterface::RFC3339, $newContent->youngest)
            ->getTimestamp(),
        ];
      }
    }
    catch (\Throwable $e) {
      $this->logger->error('Error querying new content: @message', ['@message' => $e->getMessage()]);
    }

    // "nothing new" repsponse both when there aren't, and in case of error.
    return [
      'uuids' => [],
      'youngest' => $since,
    ];
  }

  /**
   * Set endpoint configuration for GraphQL client.
   */
  protected function setEndpoint(string $endpointUrl): void {
    $endpointConfig = new SailorEndpointConfig(MangleUrl::server($endpointUrl));

    // Each Sailor generated operation class points to which config file and
    // which endpoint in that file it uses. So in theory we should configure
    // each class. However, the Configuration class is a singleton, and we know
    // that all our operations are generated with the same config file and
    // endpoint, so we can just set it for one class, and it'll work for them
    // all.
    Configuration::setEndpointFor(GetNodeTitle::class, $endpointConfig);
  }

}
