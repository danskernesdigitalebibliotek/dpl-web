<?php

declare(strict_types=1);

namespace Drupal\dpl_admin\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\dpl_admin\Services\VersionHelper;

/**
 * Toolbar hooks for dpl_admin module.
 */
class ToolbarHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected VersionHelper $versionHelper,
  ) {}

  /**
   * Implements hook_toolbar_alter().
   *
   * @phpstan-ignore missingType.iterableValue ($items is a complex array)
   */
  #[Hook('toolbar_alter')]
  public function toolbarAlter(array &$items): void {
    $version = $this->versionHelper->getVersion();

    if (empty($version)) {
      return;
    }

    $items['cms_version'] = [
      '#type' => 'toolbar_item',
      'tab' => [
        '#type' => 'link',
        '#title' => $this->t('CMS version: @version', ['@version' => $version], ['context' => 'DPL admin UX']),
        '#url' => Url::fromRoute('system.status'),
      ],
    ];
  }

}
