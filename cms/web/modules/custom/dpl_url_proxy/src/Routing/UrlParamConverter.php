<?php

namespace Drupal\dpl_url_proxy\Routing;

use Drupal\Core\ParamConverter\ParamConverterInterface;
use Symfony\Component\Routing\Route;

use function Safe\json_decode;
use function Safe\parse_url;

/**
 * Parameter converter for up casting proxy url to an url proxy argument object
 *
 * In order to use it you should specify some additional options in your route:
 *
 * @code
 * example.route:
 *   path: foo/{url}
 *   options:
 *     parameters:
 *       url:
 *         type: dpl_url_proxy
 * @endcode
 */
class UrlParamConverter implements ParamConverterInterface {

  /**
   * {@inheritdoc}
   */
  public function applies($definition, $name, Route $route): bool {
    return $definition['type'] === 'dpl_url_proxy';
  }

  /**
   * {@inheritdoc}
   */
  public function convert($value, $definition, $name, array $defaults): stdClass {
    $url_components = json_decode($value);
    $url = sprintf('%s://%s%s%s%s%s',
      $url_components->scheme,
      $url_components->host,
      $url_components->port ? ':' . $url_components->port : '',
      $url_components->path,
      $url_components->query ? '?' . $url_components->query : '',
      $url_components->fragment ? '#' . $url_components->fragment : ''
    );

    if (!$host = parse_url($url, PHP_URL_HOST)) {
      throw new HttpException(400, 'Provided url is not in the right format');
    }

    return (object) ['host' => $host, 'url' => $url];
  }

}
