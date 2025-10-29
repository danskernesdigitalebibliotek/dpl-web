<?php

declare(strict_types=1);

namespace Drush\Commands;

use Drush\Attributes\Command;
use Drush\Attributes\Help;
use GuzzleHttp\ClientInterface;
use function Safe\json_decode;

/**
 * Commands for interacting with wiremock.
 *
 * For development.
 */
class WiremockCommands extends DrushCommands {

  use AutowireTrait;

  public function __construct(
    protected ClientInterface $client,
  ) {}

  /**
   * List unmatched requests.
   */
  #[Command(name: 'wiremock:unmatched')]
  #[Help(description: "Lists requests to wiremock which didn't match a configured fixture.")]
  public function unmatched(): void {
    $data = $this->get('/__admin/requests');
    if (!isset($data['requests'])) {
      return;
    }

    foreach ($data['requests'] as $request) {
      if ($request['wasMatched']) {
        continue;
      }

      $method = $request['request']['method'];
      $url = $request['request']['absoluteUrl'];
      $body = $request['request']['body'];
      $header = sprintf('%s %s', $method, $url);
      $this->io()->text($header);

      if ($method == 'POST') {
        $body = str_replace('\\n', PHP_EOL, $body);
        $this->io()->text($body);
      }

      $this->io()->text('');
    }
  }

  /**
   * Forget requests.
   */
  #[Command(name: 'wiremock:flush')]
  #[Help(description: "Flush recorded requests.")]
  public function flush(): void {
    $this->delete('/__admin/requests');
    $this->io()->success('Requests flushed');
  }

  /**
   * Make a GET request to wiremock and return decoded JSON.
   */
  protected function get(string $path): mixed {
    $response = $this->client->request('GET', 'http://wiremock' . $path);
    return json_decode($response->getBody()->getContents(), TRUE);
  }

  /**
   * Make a DELET request to wiremock.
   */
  protected function delete(string $path): void {
    $this->client->request('DELETE', 'http://wiremock' . $path);
  }

}
