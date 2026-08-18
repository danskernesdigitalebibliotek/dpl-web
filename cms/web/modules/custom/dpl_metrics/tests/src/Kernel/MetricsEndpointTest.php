<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_metrics\Kernel;

use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\KernelTests\KernelTestBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tests the service wiring and the scrape endpoint end to end.
 *
 * The unit tests cover the behaviour of the classes. This covers the parts
 * only the container can prove: that the factory resolves, that the access
 * check is registered under the name the route asks for, and that the route
 * itself is reachable.
 */
class MetricsEndpointTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['system', 'user', 'dpl_metrics'];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->container->get('router.builder')->rebuild();
  }

  /**
   * The registry resolves from the container via its factory.
   */
  public function testRegistryResolvesFromContainer(): void {
    $this->assertInstanceOf(MetricsRegistry::class, $this->container->get(MetricsRegistry::class));
  }

  /**
   * With no token configured the endpoint is closed to anonymous requests.
   */
  public function testEndpointIsClosedByDefault(): void {
    $response = $this->request('/metrics');

    $this->assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
  }

  /**
   * A request carrying the configured token gets the metrics.
   */
  public function testEndpointServesMetricsWithToken(): void {
    $this->setSetting('dpl_metrics.token', 'sekrit');

    $this->container->get(MetricsRegistry::class)
      ->incrementCounter('logins_total', 'Logins.', ['result' => 'success']);

    $response = $this->request('/metrics', ['HTTP_AUTHORIZATION' => 'Bearer sekrit']);

    $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
    $this->assertStringContainsString('text/plain', (string) $response->headers->get('Content-Type'));
    $this->assertStringContainsString('result="success"} 1', (string) $response->getContent());
  }

  /**
   * The version collector is registered and runs on a real scrape.
   *
   * Note that dpl_admin is not installed here, so this also covers the module
   * being absent: the metric still reports, with an unknown version.
   */
  public function testScrapeIncludesCmsVersion(): void {
    $this->setSetting('dpl_metrics.token', 'sekrit');

    $response = $this->request('/metrics', ['HTTP_AUTHORIZATION' => 'Bearer sekrit']);

    $this->assertStringContainsString('dpl_cms_deployment_info{', (string) $response->getContent());
    $this->assertStringContainsString('version="unknown"', (string) $response->getContent());
  }

  /**
   * Every metric in a real scrape carries the site labels.
   *
   * The values come from whatever Lagoon injected, so this asserts that the
   * labels are present rather than what they contain.
   */
  public function testScrapeLabelsEveryMetricWithTheSite(): void {
    $this->setSetting('dpl_metrics.token', 'sekrit');

    $this->container->get(MetricsRegistry::class)
      ->incrementCounter('logins_total', 'Logins.');

    $body = (string) $this->request('/metrics', ['HTTP_AUTHORIZATION' => 'Bearer sekrit'])->getContent();

    foreach (['dpl_cms_logins_total{', 'dpl_cms_deployment_info{'] as $metric) {
      $line = $this->lineStartingWith($body, $metric);

      $this->assertStringContainsString('project="', $line);
      $this->assertStringContainsString('environment="', $line);
    }
  }

  /**
   * Finds the sample line for a metric.
   *
   * @param string $body
   *   The scrape body.
   * @param string $prefix
   *   The metric name, up to and including the opening brace.
   *
   * @return string
   *   The matching line.
   */
  private function lineStartingWith(string $body, string $prefix): string {
    foreach (explode("\n", $body) as $line) {
      if (str_starts_with($line, $prefix)) {
        return $line;
      }
    }

    $this->fail(sprintf('No sample for "%s" in: %s', $prefix, $body));
  }

  /**
   * The scrape must not be cached anywhere between Drupal and Prometheus.
   *
   * Pinned to the exact value rather than just looking for 'no-store'. The
   * controller's header is the only mechanism keeping this response out of
   * caches, and Drupal will silently replace it with a weaker 'no-cache,
   * private' if it ever stops counting as customised.
   *
   * @see \Drupal\Core\EventSubscriber\FinishResponseSubscriber::isCacheControlCustomized()
   */
  public function testEndpointIsNotCacheable(): void {
    $this->setSetting('dpl_metrics.token', 'sekrit');

    $response = $this->request('/metrics', ['HTTP_AUTHORIZATION' => 'Bearer sekrit']);

    $this->assertSame('no-store, private', $response->headers->get('Cache-Control'));
  }

  /**
   * Issues a request through the real HTTP kernel.
   *
   * @param string $path
   *   The path to request.
   * @param array<string, string> $server
   *   Additional server parameters, used here to carry headers.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   The response.
   */
  private function request(string $path, array $server = []): Response {
    $request = Request::create($path, 'GET', [], [], [], $server);

    $this->container->get('request_stack')->push($request);
    $response = $this->container->get('http_kernel')->handle($request);
    $this->container->get('request_stack')->pop();

    return $response;
  }

}
