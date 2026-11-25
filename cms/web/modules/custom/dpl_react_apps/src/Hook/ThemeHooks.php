<?php

declare(strict_types=1);

namespace Drupal\dpl_react_apps\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Url;
use Drupal\dpl_fbi\Fbi;

/**
 * Theme hooks for dpl_react_apps module.
 */
class ThemeHooks {

  public function __construct(
    protected RouteMatchInterface $routeMatch,
    protected ConfigFactoryInterface $configFactory,
    protected Fbi $fbi,
    protected ModuleHandlerInterface $moduleHandler,
    protected ModuleExtensionList $moduleExtensionList,
  ) {}

  /**
   * Add Open Graph meta tags, with work and series details where relevant.
   *
   * @param mixed[] $variables
   *   The variables for the html template.
   */
  #[Hook('preprocess_html')]
  public function addOpenGraphTags(array &$variables): void {
    // @todo Move site general meta tags to a more appropriate module (which
    // needs to be created).
    $site_name = $this->configFactory->get('system.site')->get('name');
    $current_url = Url::fromRoute('<current>')->setAbsolute();

    $tags = [
      'og:site_name' => $site_name,
      'og:url' => $current_url->toString(),
      // Documentation on valid og:types is sordidly lacking, and the few that
      // seems to be agreement on doesn't cover most of our material types. The
      // old Ding2 just used 'website', so we'll roll with that.
      'og:type' => 'website',
    ];

    if ($this->routeMatch->getRouteName() === 'dpl_react_apps.work') {
      $wid = $this->routeMatch->getParameter('wid');
      try {
        $tags['og:title'] = $this->fbi->getWorkTitle($wid);
        $tags['og:description'] = $this->fbi->getWorkAbstract($wid);
        $coverInfo = $this->fbi->getWorkCoverInfo($wid);

        if ($coverInfo) {
          $tags['og:image'] = $coverInfo->url;
          $tags['og:image:url'] = $coverInfo->url;
          $tags['og:image:height'] = $coverInfo->height;
          $tags['og:image:width'] = $coverInfo->width;
        }
      }
      catch (\Throwable $e) {
        // Keep calm and carry on.
      }
    }
    elseif ($this->routeMatch->getRouteName() === 'dpl_react_apps.series') {
      $series_id = $this->routeMatch->getParameter('series_id');
      try {
        // An empty og tag tells a sharing site less than no tag at all - it
        // suppresses the fallbacks the site would otherwise use - so title and
        // description are only emitted when FBI has something to say. Around a
        // third of series have no description.
        $title = $this->fbi->getSeriesTitle($series_id);

        if ($title) {
          $tags['og:title'] = $title;
        }

        $description = $this->fbi->getSeriesDescription($series_id);

        if ($description) {
          $tags['og:description'] = $description;
        }

        $coverInfo = $this->fbi->getSeriesCoverInfo($series_id);

        if ($coverInfo) {
          $tags['og:image'] = $coverInfo->url;
          $tags['og:image:url'] = $coverInfo->url;
          $tags['og:image:height'] = $coverInfo->height;
          $tags['og:image:width'] = $coverInfo->width;
        }
      }
      catch (\Throwable $e) {
        // Keep calm and carry on.
      }
    }

    foreach ($tags as $name => $value) {
      $meta_tag = [
        '#tag' => 'meta',
        '#attributes' => [
          'property' => $name,
          'content' => $value,
        ],
      ];

      $variables['page']['#attached']['html_head'][] = [$meta_tag, "meta-{$name}"];
    }
  }

  /**
   * Add the data other modules provide for React apps as data attributes.
   *
   * @param mixed[] $variables
   *   The variables for the theme hook.
   */
  #[Hook('preprocess_dpl_react_app')]
  public function addReactAppsData(array &$variables): void {
    // The hook implementations fill in the subarrays by reference, which
    // PHPStan cannot see, so type the values as mixed.
    /** @var array<string, mixed> $data */
    $data = [
      'urls' => [],
      'texts' => [],
      'configs' => [],
    ];
    $this->moduleHandler->invokeAll('dpl_react_apps_data', [&$data, &$variables]);
    foreach ($data as $scope => $values) {
      if (!is_array($values)) {
        continue;
      }
      foreach ($values as $key => $value) {
        $variables['attributes'] += [
          implode('-', ['data', $key, rtrim($scope, 's')]) => $value,
        ];
      }
    }
  }

  /**
   * Use the module's template for the system messages block.
   *
   * @param mixed[] $theme_registry
   *   The theme registry.
   */
  #[Hook('theme_registry_alter')]
  public function overrideSystemMessagesTemplate(array &$theme_registry): void {
    $theme_registry['block__system_messages_block']['path'] = $this->moduleExtensionList->getPath('dpl_react_apps') . '/templates';
  }

}
