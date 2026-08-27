<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message;

/**
 * Where a service message is shown.
 *
 * The placement also decides the tone: a global message is always critical,
 * an in-page message is always informational. See adr-020-service-messages.md.
 */
enum ServiceMessagePlacement: string {

  // A bar above the header, on every page of the site.
  case GlobalBar = 'global';

  // A container on the front page and on selected branch pages.
  case InPage = 'in_page';

}
