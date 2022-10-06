<?php

namespace Drupal\dpl_url_proxy\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Safe\Exceptions\UrlException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use function Safe\parse_url as parse_url;
use function Safe\preg_replace as preg_replace;

// Descriptions quickly become long and Doctrine annotations have no good way
// of handling multiline strings.
// phpcs:disable Drupal.Files.LineLength.TooLong
/**
 * A resource for transforming urls to urls with proxy information added.
 *
 * @RestResource(
 *   id = "proxy-url",
 *   label = @Translation("Generate proxy url"),
 *   serialization_class = "",
 *
 *   uri_paths = {
 *     "canonical" = "/dpl-url-proxy",
 *   },
 *
 *   route_parameters = {
 *     "GET" = {
 *       "url" = {
 *          "name" = "url",
 *          "description" = "A url to an online resource which may be accessible through a proxy which requires rewriting of the url",
 *          "type" = "string",
 *          "in" = "query",
 *          "required" = TRUE,
 *       },
 *     },
 *   },
 *
 *   responses = {
 *     200 = {
 *       "description" = "OK",
 *       "schema" = {
 *         "type" = "object",
 *         "properties" = {
 *           "data" = {
 *             "type" = "object",
 *             "properties" = {
 *               "url" = {
 *                 "type" = "string",
 *                 "description" = "The url with any configured proxies applied",
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *     400 = {
 *       "description" = "Invalid url provided",
 *     },
 *     500 = {
 *       "description" = "Internal server error"
 *     },
 *   }
 * )
 */
class UrlProxyResource extends ResourceBase {
// phpcs:enable Drupal.Files.LineLength.TooLong

  /**
   * Drupal\Core\Config\ConfigManagerInterface definition.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  protected $configManager;

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
      $container->get('logger.factory')->get('rest')
    );

    $instance->configManager = $container->get('config.manager');
    return $instance;
  }

  /**
   * Get the url proxy configuration.
   *
   * @return mixed[]
   *   The url proxy configuration.
   */
  protected function getConfiguration(): array {
    // We need to provide a default value here if the configuration is not
    // available.
    return $this->configManager
      ->getConfigFactory()
      ->get(DplUrlProxyInterface::CONFIG_NAME)
      ->get('values') ?? [
        'prefix' => '',
        'hostnames' => [],
      ];
  }

  /**
   * Responds to entity GET requests.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The response containing "translated url".
   */
  public function get(Request $request) {
    $conf = $this->getConfiguration();
    $url_param = $request->get('url');
    $url = $url_param;

    if (!$url_param) {
      throw new HttpException(400, 'Url parameter is missing');
    }

    try {
      /** @var string $url_host */
      $url_host = parse_url($url_param, PHP_URL_HOST);
    }
    catch (UrlException $e) {
      throw new HttpException(400, "Url $url_param is not a valid url");
    }

    if (!$url_host) {
      throw new HttpException(400, "Url $url_param does not contain a host name. Urls to be proxied must contain a host name.");
    }

    if (!$prefix = $conf['prefix'] ?? NULL) {
      throw new HttpException(500, 'Could not generate url. Insufficient configuration');
    }

    // Search host names.
    foreach ($conf['hostnames'] as $config) {
      if ($url_host == $config['hostname']) {
        // Rewrite/convert url using regex.
        if (
          !empty($config['expression']['regex'])
          && !empty($config['expression']['replacement'])
        ) {
          $url = preg_replace($config['expression']['regex'],
            $config['expression']['replacement'],
            $url_param);
        }

        // Add prefix, if chosen.
        if (!$config['disable_prefix']) {
          // The URL is not encoded as it's send on to online resources proxies
          // (ezproxy), which fails if the url is encoded.
          $url = $prefix . $url;
        }

        // Exit the foreach loop.
        break;
      }
    }

    $cache_tags = $this->configManager
      ->getConfigFactory()
      ->get(DplUrlProxyInterface::CONFIG_NAME)
      ->getCacheTags();

    $response = new ResourceResponse(['data' => ['url' => $url]], 200);
    return $response
      ->addCacheableDependency(CacheableMetadata::createFromRenderArray([
        '#cache' => [
          'tags' => $cache_tags,
          'contexts' => ['url.query_args'],
        ],
      ]));
  }

}
