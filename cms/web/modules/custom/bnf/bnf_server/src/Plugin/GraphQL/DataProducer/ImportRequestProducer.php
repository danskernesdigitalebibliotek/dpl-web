<?php

namespace Drupal\bnf_server\Plugin\GraphQL\DataProducer;

use Drupal\bnf\Services\BnfImporter;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the `importRequest` mutation by handling content import requests.
 *
 * This class processes the `importRequest` mutation, which is part of the
 * GraphQL schema. It accepts a unique identifier (UUID) for the content to be
 * imported and a callback URL for querying the external system for node data.
 *
 * @DataProducer(
 *   id = "import_request_producer",
 *   name = "Import Request Producer",
 *   description = "Handles the importRequest mutation.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   ),
 *   consumes = {
 *     "uuid" = @ContextDefinition("string",
 *       label = "UUID"
 *     ),
 *     "callbackUrl" = @ContextDefinition("string",
 *       label = "Callback URL"
 *     )
 *   }
 * )
 */
class ImportRequestProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Creates an instance of the producer using dependency injection.
   *
   * This method ensures the necessary services, such as the logger and importer
   * are available for processing the import request.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('bnf.importer'),
      $container->get('logger.channel.bnf'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected BnfImporter $importer,
    protected LoggerInterface $logger,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Resolves the `importRequest` mutation by importing content based on UUID.
   *
   * This method processes an import request by using the provided UUID to
   * identify the content to import and a callback URL to get the node data.
   * Currently, it supports only articles as the content type, but it can be
   * extended in the future to handle other node types.
   *
   * @param string $uuid
   *   The unique identifier of the content to import. This UUID is used to
   *   locate the content in the external system.
   * @param string $callbackUrl
   *   The external GraphQL endpoint URL to pull node data from.
   *
   * @return string[]
   *   An associative array containing:
   *   - 'status': 'success' or 'failure'.
   *   - 'message': A detailed message about the result of the operation.
   */
  public function resolve(string $uuid, string $callbackUrl): array {
    // For now, we only support articles. In the future, this should be
    // sent along as a parameter, as GraphQL exposes different queries
    // for each node type (nodeArticle)
    $node_type = 'article';

    $this->logger->info('Received request to import @type content with UUID @uuid from @url', [
      '@uuid' => $uuid,
      '@type' => $node_type,
      '@url' => $callbackUrl,
    ]);

    try {
      $this->importer->importNode($uuid, $callbackUrl, $node_type);

      return [
        'status' => 'success',
        'message' => 'Node created successfully.',
      ];
    }
    catch (\Exception $e) {
      $this->logger->warning('Could not load node of type @node_type with UUID @uuid at @callbackUrl. @message', [
        '@uuid' => $uuid,
        '@node_type' => $node_type,
        '@callbackUrl' => $callbackUrl,
        '@message' => $e->getMessage(),
      ]);

      return [
        'status' => 'failure',
        'message' => $e->getMessage(),
      ];
    }
  }

}
