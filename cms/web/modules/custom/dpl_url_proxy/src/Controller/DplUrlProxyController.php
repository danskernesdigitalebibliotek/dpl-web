<?php

namespace Drupal\dpl_url_proxy\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;
use Drupal\dpl_url_proxy\Form\ProxyUrlConfigurationForm;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class DplUrlProxyController.
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
  public static function create(ContainerInterface $container) {
    $instance = parent::create($container);
    $instance->configManager = $container->get('config.manager');
    // $logger_factory = $container->get('logger.factory');
    // $instance->loggger = $logger_factory->get('dpl_url_proxy');

    return $instance;
  }

  protected function getSavedValues() {
    return $this->configManager
    ->getConfigFactory()
    ->get(DplUrlProxyInterface::CONFIG_NAME)
    ->get('values', [
      'prefix' => '',
      'hostnames' => [],
    ]);
  }
  /**
   * John.
   *
   * @return string
   *   Return Hello string.
   */
  public function generateUrl(Request $request) {
    $t_opts = DplUrlProxyInterface::TRANSLATION_OPTIONS;
    $saved_values = $this->getSavedValues();
    $post_data = json_decode($request->getContent(), TRUE);
    $url = $post_data['url'] ?? NULL;

    if (!$host = parse_url($post_data['url'], PHP_URL_HOST)) {
      throw new HttpException(400, $this->t('Provided url is not in the right format', [], $t_opts));
    }

    if (!$prefix = $saved_values['prefix'] ?? null) {
      $this->getLogger('dpl_url_proxy')->error('Prefix is not set');
      throw new HttpException(500, $this->t('Could not resolve url. Insufficient configuration', [], $t_opts));
    }

    // Search host names.
    foreach ($saved_values['hostnames'] as $config) {
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
