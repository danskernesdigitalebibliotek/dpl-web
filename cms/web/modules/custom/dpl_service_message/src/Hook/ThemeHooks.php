<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\AdminContext;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;

/**
 * Theme hooks for dpl_service_message module.
 */
class ThemeHooks {

  public function __construct(
    protected ServiceMessageLoader $loader,
    protected AdminContext $adminContext,
  ) {}

  /**
   * Add the service messages for the current page to the page template.
   *
   * @param array<mixed> $variables
   *   The variables for the page template.
   */
  #[Hook('preprocess_page')]
  public function preprocessPage(array &$variables): void {
    // The admin theme shows no service messages.
    if ($this->adminContext->isAdminRoute()) {
      return;
    }

    $variables['service_message_global'] = $this->loader->buildGlobal();
    $variables['service_messages'] = $this->loader->buildInPage();
  }

  /**
   * Implements hook_theme().
   *
   * @return array<string, mixed>
   *   The theme hooks the module defines.
   */
  #[Hook('theme')]
  public function theme(): array {
    return [
      'dpl_service_message_bar' => [
        'variables' => ['message' => []],
      ],
      'dpl_service_messages' => [
        'variables' => ['messages' => []],
      ],
    ];
  }

}
