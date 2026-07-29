<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_event\EventListPaging;
use Drupal\dpl_event\Form\SettingsForm;
use Drupal\views\ViewExecutable;

/**
 * Applies the editor-configured paging mode to the events list view.
 */
class EventListPagingHooks {

  public function __construct(protected ConfigFactoryInterface $configFactory) {}

  /**
   * Implements hook_views_pre_build().
   *
   * Sets how many events the events list shows per load. This must run before
   * the query is built. Whether further events load automatically or behind a
   * "Show more" button is set in viewsPreRender().
   */
  #[Hook('views_pre_build')]
  public function viewsPreBuild(ViewExecutable $view): void {
    $mode = $this->listPagingMode($view);
    if ($mode === NULL) {
      return;
    }

    // Applied to the pager when it initialises, or immediately if the pager has
    // already been initialised for this build.
    // @see \Drupal\views\ViewExecutable::initPager()
    $view->setItemsPerPage($mode->itemsPerPage());
  }

  /**
   * Implements hook_views_pre_render().
   *
   * Sets whether the events list loads further events automatically while
   * scrolling (infinite scroll) or behind a "Show more" button.
   *
   * This is done here, not in viewsPreBuild(), on purpose: in a real page
   * request the pager plugin is already instantiated before pre_build runs, so
   * changing the option on the display would be ignored by the existing pager.
   * By pre_render the pager is always initialised, so we set the option
   * directly on the pager instance - which is still before the pager is
   * rendered.
   */
  #[Hook('views_pre_render')]
  public function viewsPreRender(ViewExecutable $view): void {
    $mode = $this->listPagingMode($view);
    if ($mode === NULL) {
      return;
    }

    // The pager is always initialised by pre_render (see above), so we can set
    // the option directly on the instance.
    $view->pager->options['views_infinite_scroll']['automatically_load_content'] = $mode->automaticallyLoadContent();

    // The rendered list depends on the paging mode, so invalidate it whenever
    // the event settings change - otherwise an editor's change would not take
    // effect until the next cache clear.
    $view->element['#cache']['tags'] = Cache::mergeTags(
      $view->element['#cache']['tags'] ?? [],
      $this->configFactory->get(SettingsForm::CONFIG_NAME)->getCacheTags()
    );
  }

  /**
   * Resolves the editor-configured paging mode for the events list view.
   *
   * The mode (see the event settings form) determines how many events are shown
   * per load and whether further events load automatically while scrolling
   * (infinite scroll) or behind a "Show more" button.
   *
   * @return \Drupal\dpl_event\EventListPaging|null
   *   The paging mode, or NULL when $view is not the events list rendered with
   *   the infinite scroll pager - in which case callers must leave it
   *   untouched.
   */
  protected function listPagingMode(ViewExecutable $view): ?EventListPaging {
    if ($view->id() !== 'events') {
      return NULL;
    }

    // The events list is built around the infinite scroll pager. If a site has
    // switched it to a different pager there is nothing for us to configure.
    if (($view->display_handler->getOption('pager')['type'] ?? NULL) !== 'infinite_scroll') {
      return NULL;
    }

    $mode_value = $this->configFactory->get(SettingsForm::CONFIG_NAME)->get('list_paging_mode');
    return EventListPaging::tryFrom($mode_value ?? '') ?? EventListPaging::DEFAULT_MODE;
  }

}
