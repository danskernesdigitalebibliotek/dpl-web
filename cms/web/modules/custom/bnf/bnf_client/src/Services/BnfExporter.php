<?php

namespace Drupal\bnf_client\Services;

use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\Exception\AlreadyExistsException;
use Drupal\bnf\MangleUrl;
use Drupal\bnf_client\Form\SettingsForm;
use Drupal\Core\Config\ConfigFactoryInterface;
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
   * The BNF site base URL.
   */
  protected string $baseUrl;

  /**
   * Constructor.
   */
  public function __construct(
    protected ClientInterface $httpClient,
    protected UrlGeneratorInterface $urlGenerator,
    protected TranslationInterface $translation,
    protected LoggerInterface $logger,
    ConfigFactoryInterface $configFactory,
  ) {
    $this->baseUrl = $configFactory->get(SettingsForm::CONFIG_NAME)->get('base_url');
  }

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
      $bnfServer = $this->baseUrl . 'graphql';

      $response = $this->httpClient->request('post', MangleUrl::server($bnfServer), [
        'headers' => [
          'Content-Type' => 'application/json',
        ],
        'auth' => ['bnf_graphql', getenv('BNF_GRAPHQL_CONSUMER_USER_PASSWORD')],
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

      if ($status === 'duplicate') {
        throw new AlreadyExistsException();
      }

      throw new \Exception($message);
    }

    $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::Exported->value);
    $node->save();

  }

}
