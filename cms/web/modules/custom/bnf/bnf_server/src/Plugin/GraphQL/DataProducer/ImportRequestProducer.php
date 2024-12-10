<?php

namespace Drupal\bnf_server\Plugin\GraphQL\DataProducer;

use Drupal\bnf\Services\BnfImporter;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the `importRequest` mutation.
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
   * {@inheritdoc}
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
   * Resolves the mutation.
   *
   * @param string $uuid
   *   The client UUID.
   * @param string $callbackUrl
   *   The callback URL.
   *
   * @return string[]
   *   The response data.
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
