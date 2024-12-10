<?php

namespace Drupal\bnf_client\Services;

use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\node\NodeInterface;
use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use function Safe\json_decode;

/**
 * Service, related to exporting our content to BNF.
 *
 * We send an Import Request to BNF using GraphQL, along with information
 * about the content and where they can access it using our GraphQL endpoint.
 */
class BnfExporter {

  /**
   * Constructor.
   */
  public function __construct(
    protected Client $httpClient,
    protected UrlGeneratorInterface $urlGenerator,
    protected TranslationInterface $translation,
    protected LoggerInterface $logger,
  ) {}

  /**
   * Requesting BNF server to import the supplied node.
   */
  public function exportNode(NodeInterface $node): void {
    // generateFromRoute returns a string if we do not pass TRUE as the
    // fourth argument.
    /** @var string $callback_url */
    $callback_url = $this->urlGenerator->generateFromRoute(
      'graphql.query.graphql_compose_server',
      [],
      ['absolute' => TRUE]
    );

    $uuid = $node->uuid();

    $mutation = <<<GRAPHQL
    mutation {
      importRequest(uuid: "$uuid", callbackUrl: "$callback_url") {
        status
        message
      }
    }
    GRAPHQL;

    // @todo This needs to be the server URL instead. What do we do about local
    // development?
    $bnf_server = $callback_url;

    try {
      $response = $this->httpClient->post($bnf_server, [
        'headers' => [
          'Content-Type' => 'application/json',
        ],
        // @todo Implement actual authentication. Is it OK to use
        // username/password, or do we need to do oAuth as they do in React?
        'auth' => ['graphql_consumer', 'test'],
        'json' => [
          'query' => $mutation,
        ],
      ]);

      $data = json_decode($response->getBody()->getContents(), TRUE);
    }
    catch (\Exception $e) {
      $this->logger->error(
        'Failed at exporting node to BNF server. @message',
        ['@message' => $e->getMessage()]);

      throw new \Exception((string) $this->translation->translate(
        'Could not export node to BNF.', [], ['context' => 'BNF']
      ));
    }

    $status = $data['data']['importRequest']['status'] ?? NULL;

    if ($status !== 'success') {
      $message = $data['data']['importRequest']['message'] ?? NULL;

      $this->logger->error(
        'Failed at exporting node to BNF server. @message',
        ['@message' => $message]);
      throw new \Exception($message);
    }

  }

}
