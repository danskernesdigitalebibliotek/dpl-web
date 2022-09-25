<?php

namespace Drupal\dpl_url_proxy\Controller;

use Safe\Exceptions\JsonException;
use Drupal\Core\Controller\ControllerBase;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use function Safe\json_decode;
use function Safe\parse_url;
use function Safe\preg_replace;

/**
 * The controller for handling url proxy endpoint(s).
 */
class DplUrlProxyController extends ControllerBase {

  /**
   * Drupal\Core\Config\ConfigManagerInterface definition.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  protected $configManager;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): DplUrlProxyController {
    $instance = parent::create($container);
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
    // available. But Phpstan does not get it :).
    // phpcs:ignore
    /** @phpstan-ignore-next-line */
    return $this->configManager
      ->getConfigFactory()
      ->get(DplUrlProxyInterface::CONFIG_NAME)
      ->get('values', [
        'prefix' => '',
        'hostnames' => [],
      ]);
  }

  /**
   * Generate url endpoint.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   Either the generated url or the url that was given.
   */
  public function generateUrl(Request $request): JsonResponse {
    $conf = $this->getConfiguration();
    $url = '';

    try {
      if ($post_data = json_decode((string) $request->getContent(), TRUE)) {
        $url = $post_data['url'] ?? NULL;
      }
    }
    catch (JsonException $e) {
      throw new HttpException(400, 'Post body could not be decoded');
    }

    if (!$host = parse_url($url, PHP_URL_HOST)) {
      throw new HttpException(400, 'Provided url is not in the right format');
    }

    if (!$prefix = $conf['prefix'] ?? NULL) {
      throw new HttpException(500, 'Could not generate url. Insufficient configuration');
    }

    // Search host names.
    foreach ($conf['hostnames'] as $config) {
      if ($host == $config['hostname']) {
        // Rewrite/convert url using regex.
        if (
            (isset($config['expression']['regex']) && !empty($config['expression']['regex']))
            && (isset($config['expression']['replacement']) && !empty($config['expression']['replacement']))
          ) {
          $url = preg_replace(
              $config['expression']['regex'],
              $config['expression']['replacement'],
              $url
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

    return new JsonResponse(['data' => $url]);
  }

}
