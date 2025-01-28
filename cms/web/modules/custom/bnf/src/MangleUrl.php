<?php

declare(strict_types=1);

namespace Drupal\bnf;

use function Safe\parse_url;
use function Safe\preg_match;

/**
 * Mangle URLs in the development docker setup.
 *
 * In the development setup, the URLs the developer uses to view the site
 * doesn't exist for the code running inside the containers and the hostnames
 * the containers can use to communicate doesn't exist outside. This makes it
 * rather difficult to configure the BNF modules with an URL that's both valid
 * for server to server communication, and can be used in the UI.
 *
 * Furthermore, getting the sites to communicate using HTTPS, with a validating
 * certificate, is involved, so our HTTPS requirement for URLs is another
 * challenge.
 *
 * This sidesteps the issue by replacing the "outside" URL with the "inside"
 * HTTP URL for site to site connections. Code that sends the URL to the browser
 * should just use the configured URL, while code thot does cross site requests
 * should pass the URL through `MangleUrl::server()` first, and not worry about
 * HTTPS as that's handled for them.
 */
class MangleUrl {

  /**
   * Return the proper server URL.
   */
  public static function server(string $url): string {
    $parsedUrl = parse_url($url);
    $host = $parsedUrl['host'] ?? '';

    if (preg_match('/(docker|local)$/', $host)) {
      if (preg_match('/^bnf-/', $host)) {
        return 'http://bnfnginx:8080/graphql';
      }

      return 'http://nginx:8080/graphql';
    }

    $scheme = $parsedUrl['scheme'] ?? NULL;

    if ($scheme !== 'https') {
      throw new \InvalidArgumentException('The BNF server URL must use HTTPS.');
    }

    return $url;
  }

}
