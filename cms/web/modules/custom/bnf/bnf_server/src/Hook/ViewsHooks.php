<?php

declare(strict_types=1);

namespace Drupal\bnf_server\Hook;

use Drupal\bnf\Services\BnfImporter;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\views\ViewExecutable;

/**
 * Views hooks.
 */
class ViewsHooks {

  /**
   * Setting the allowed importable content types as contextual filter.
   */
  #[Hook('views_pre_build')]
  public function preBuild(ViewExecutable $view): void {
    if ($view->id() === 'importable_content') {
      $allowed_cts = BnfImporter::ALLOWED_CONTENT_TYPES;

      $view->setArguments([implode('+', $allowed_cts)]);
    }
  }

}
