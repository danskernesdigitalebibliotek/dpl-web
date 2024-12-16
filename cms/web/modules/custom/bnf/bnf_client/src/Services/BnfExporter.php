<?php

namespace Drupal\bnf_client\Services;

use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\node\NodeInterface;
use GuzzleHttp\ClientInterface;
use Psr\Log\LoggerInterface;
use function Safe\json_decode;
use function Safe\parse_url;

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
    protected ClientInterface $httpClient,
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
    /** @var string $callbackUrl */
    $callbackUrl = $this->urlGenerator->generateFromRoute(
      'graphql.query.graphql_compose_server',
      [],
      ['absolute' => TRUE]
    );

    $uuid = $node->uuid();

    $mutation = <<<GRAPHQL
    mutation {
      importRequest(uuid: "$uuid", callbackUrl: "$callbackUrl") {
        status
        message
      }
    }
    GRAPHQL;

    try {
      $bnfServer = (string) getenv('BNF_SERVER_GRAPHQL_ENDPOINT');

      if (!filter_var($bnfServer, FILTER_VALIDATE_URL)) {
        throw new \InvalidArgumentException('The provided BNF server URL is not valid.');
      }

      $parsedUrl = parse_url($bnfServer);
      $scheme = $parsedUrl['scheme'] ?? NULL;

      if ($scheme !== 'https') {
        throw new \InvalidArgumentException('The BNF server URL must use HTTPS.');
      }

      $response = $this->httpClient->request('post', $bnfServer, [
        'headers' => [
          'Content-Type' => 'application/json',
        ],
        'auth' => [getenv('GRAPHQL_USER_NAME'), getenv('GRAPHQL_USER_PASSWORD')],
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

      throw new \Exception('Could not export node to BNF.');
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
