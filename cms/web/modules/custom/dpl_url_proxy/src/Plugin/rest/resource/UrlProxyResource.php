<?php

namespace Drupal\dpl_url_proxy\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Provides a Demo Resource.
 *
 * @RestResource(
 *   id = "proxy-url",
 *   label = @Translation("Generate proxy url"),
 *   serialization_class = "",
 *
 *   uri_paths = {
 *     "canonical" = "/dpl-url-proxy/{url}",
 *   }
 * )
 */
class UrlProxyResource extends ResourceBase {


  /**
   * Drupal\Core\Config\ConfigManagerInterface definition.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  protected $configManager;

  /**
   * {@inheritdoc}
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
   * {@inheritdoc}
   */
  protected function getBaseRoute($canonical_path, $method) {
    $route = parent::getBaseRoute($canonical_path, $method);
    $route->setOption('parameters', [
      'url' => [
        'type' => 'dpl_url_proxy',
      ],
    ]);

    return $route;
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
    // $this->configManager->getConfigFactory()
    // var_dump(array_keys((array) $this)); die;
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
    $url = "";

    if (!$url_param) {
      throw new HttpException(400, 'Url parameter is missing');
    }

    if (!$prefix = $conf['prefix'] ?? NULL) {
      throw new HttpException(500, 'Could not generate url. Insufficient configuration');
    }

    // Search host names.
    foreach ($conf['hostnames'] as $config) {
      if ($url_param->host == $config['hostname']) {
        // Rewrite/convert url using regex.
        if (
          !empty($config['expression']['regex'])
          && !empty($config['expression']['replacement'])
        ) {
          $url = preg_replace(
              $config['expression']['regex'],
              $config['expression']['replacement'],
              $url_param->url
            );
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

    $cacheTags = $this->configManager
      ->getConfigFactory()
      ->get(DplUrlProxyInterface::CONFIG_NAME)
      ->getCacheTags();

    $response = new ResourceResponse(['data' => ['url' => $url]], 200);
    return $response
      ->addCacheableDependency(CacheableMetadata::createFromRenderArray([
        '#cache' => [
          'tags' => $cacheTags,
          'contexts' => ['url.query_args'],
        ],
      ]));
  }

}
