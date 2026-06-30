<?php

declare(strict_types=1);

namespace Drupal\dpl_app;

/**
 * Type of app.
 *
 * There's three different apps, this enum is used to distinguish between them.
 */
enum AppType: string {
  case MyBiblo = 'MYBIBLO';
  case Biblo = 'BIBLO';
  case BibloGo = 'BIBLOGO';
}
