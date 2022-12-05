<?php

namespace Drupal\dpl_das\Plugin\rest\resource;

use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\dpl_das\Elba\Client;
use Drupal\dpl_das\Elba\Exception;
use Drupal\dpl_das\Elba\PlaceCopyRequest;
use Drupal\dpl_das\Input\ArticleOrder;
use Drupal\dpl_login\LibraryAgencyIdProvider;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponseInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Serializer\Exception\UnexpectedValueException;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Resource for managing orders of digital articles.
 *
 * Digitizing articles is managed by the Royal Danish Library. Ordering an
 * article is supported by the Elba webservices.
 *
 * Accessing this service requires a service account with an username and
 * password and is thus not designed for direct browser based access by patron.
 * Consequently it is exposed through the CMS instead.
 *
 * There is no canonical path for orders since this is not supported by the
 * service. Patrons will have to consult their mail for confirmation that an
 * order has been placed.
 *
 * @RestResource (
 *   id = "dpl_das_digital_article_order",
 *   label = @Translation("Digital Article Order"),
 *   uri_paths = {
 *     "create" = "/dpl_das/order",
 *   },
 *
 *   payload = {
 *     "name" = "order",
 *     "description" = "Digital article order",
 *     "in" = "body",
 *     "schema" = {
 *       "type" = "object",
 *       "properties" = {
 *         "pid" = {
 *           "type" = "string",
 *         },
 *         "email" = {
 *           "type" = "string",
 *         },
 *       },
 *     },
 *   },
 *
 *   responses = {
 *     201 = {
 *       "description" = "OK",
 *     },
 *     400 = {
 *      "descriptions" = "Invalid input",
 *     },
 *     500 = {
 *       "description" = "Internal server error",
 *     },
 *   }
 * )
 */
class DigitalArticleOrderResource extends ResourceBase {

  /**
   * Serializer used to validate/convert incoming requests to value objects.
   *
   * @var \Symfony\Component\Serializer\SerializerInterface
   */
  private SerializerInterface $serializer;

  /**
   * Elba client to pass incoming requests to.
   *
   * @var \Drupal\dpl_das\Elba\Client
   */
  private Client $client;

  /**
   * Access to local configuration.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  private ConfigManagerInterface $configManager;

  /**
   * Access to library agency id.
   *
   * @var \Drupal\dpl_login\LibraryAgencyIdProvider
   */
  private LibraryAgencyIdProvider $libraryAgencyIdProvider;

  /**
   * Creates an instance of the plugin.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The container to pull out services used in the plugin.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   *
   * @return static
   *   Returns an instance of this plugin.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest'),
    );

    $instance->serializer = $container->get('dpl_das.serializer');
    $instance->client = $container->get('dpl_das.client');
    $instance->configManager = $container->get('config.manager');
    $instance->libraryAgencyIdProvider = $container->get('dpl_login.library_agency_id_provider');

    return $instance;
  }

  /**
   * Receive incoming requests to order digital articles.
   */
  public function post(Request $request): ResourceResponseInterface {
    $order_data = $request->getContent();
    if (!$order_data) {
      throw new HttpException(400, 'No article order data provided');
    }

    try {
      /** @var \Drupal\dpl_das\Input\ArticleOrder $order */
      $order = $this->serializer->deserialize($order_data, ArticleOrder::class, 'json');
    }
    catch (UnexpectedValueException $e) {
      throw new HttpException(400, "Invalid article order data: {$e->getMessage()}}");
    }

    $config = $this->configManager->getConfigFactory()->get('dpl_das.settings');

    $request = new PlaceCopyRequest(
      $config->get('username'),
      $config->get("password"),
      $this->libraryAgencyIdProvider->getAgencyId(),
      $order->pid,
      $order->email
    );

    try {
      $this->client->placeCopy($request);
      $this->logger->info("Placed order for digital article %pid", ['%pid' => $order->pid]);
      return new ModifiedResourceResponse(NULL, 201);
    }
    catch (Exception $e) {
      throw new HttpException(500,
        "Unable to order digital copy of {$order->pid}: ({$e->getCode()}) {$e->getMessage()}", $e);
    }

  }

}
