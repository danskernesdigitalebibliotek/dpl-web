<?php

declare(strict_types=1);

namespace Drupal\dpl_metrics\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\dpl_metrics\MetricsRegistry;
use Prometheus\RenderTextFormat;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves the Prometheus scrape endpoint.
 */
class MetricsController extends ControllerBase {

  /**
   * Constructs a metrics controller.
   *
   * @param \Drupal\dpl_metrics\MetricsRegistry $registry
   *   The metrics registry.
   * @param \Psr\Log\LoggerInterface $logger
   *   Logger for the dpl_metrics channel.
   */
  public function __construct(
    private readonly MetricsRegistry $registry,
    private readonly LoggerInterface $logger,
  ) {
  }

  /**
   * {@inheritdoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The Drupal service container.
   *
   * @return static
   *   The controller.
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get(MetricsRegistry::class),
      $container->get('logger.channel.dpl_metrics'),
    );
  }

  /**
   * Renders the current metrics.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   The scrape body, or 503 when the metrics store cannot be read.
   */
  public function metrics(): Response {
    try {
      $body = $this->registry->render();
    }
    catch (\Throwable $e) {
      $this->logger->error('Unable to render metrics: @message', [
        '@message' => $e->getMessage(),
      ]);

      // Failing the scrape is deliberate. Returning 200 with an empty body
      // would make Prometheus record a site with no traffic, which looks
      // identical to a genuine drop to zero and would not raise an alert.
      return new Response('Metrics unavailable.', Response::HTTP_SERVICE_UNAVAILABLE, [
        'Content-Type' => 'text/plain; charset=utf-8',
        'Cache-Control' => 'no-store',
      ]);
    }

    return new Response($body, Response::HTTP_OK, [
      'Content-Type' => RenderTextFormat::MIME_TYPE,
      // The only thing keeping this scrape out of caches, so do not drop it:
      // a route no_cache option would not help, as the page caches skip
      // non-cacheable responses like this one before consulting any policy.
      // Varnish decides from headers alone (see cms/lagoon/varnish/drupal.vcl)
      // and a cached scrape would flatten every rate() over these counters.
      // no-store rather than Drupal's no-cache: this body describes traffic
      // and is fetched with a bearer token, so nothing should store it.
      'Cache-Control' => 'no-store, private',
    ]);
  }

}
