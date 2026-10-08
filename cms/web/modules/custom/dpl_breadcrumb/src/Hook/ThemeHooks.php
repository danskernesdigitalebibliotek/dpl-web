<?php

declare(strict_types=1);

namespace Drupal\dpl_breadcrumb\Hook;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_breadcrumb\Services\BreadcrumbHelper;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\TermInterface;

/**
 * Theme hooks for dpl_breadcrumb module.
 */
class ThemeHooks {

  use StringTranslationTrait;

  public function __construct(
    protected RouteMatchInterface $routeMatch,
    protected BreadcrumbHelper $helper,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Prepares dynamic items for automatically displaying breadcrumb children.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_paragraph__breadcrumb_children')]
  public function prepareDynamicBreadcrumbChildren(array &$variables): void {
    $paragraph = $variables['paragraph'] ?? NULL;

    // In the preview (AKA backend view), we don't want to load dynamics.
    if (!($paragraph instanceof Paragraph) || $variables['view_mode'] === 'preview') {
      return;
    }

    $breadcrumb_items = $paragraph->get('field_breadcrumb_target')->referencedEntities();
    $breadcrumb_item = reset($breadcrumb_items);

    if (!($breadcrumb_item instanceof TermInterface)) {
      return;
    }

    $variables['items'] = $this->helper->getRenderedReferencingNodes($breadcrumb_item);

    if ($paragraph->hasField('field_show_subtitles')) {
      $variables['show_subtitles'] = (bool) $paragraph->get('field_show_subtitles')->value;
    }
    // Drupal will cache the whole paragraph, as it does not know that it is
    // embedding a dynamic list. We'll add a simple cache tag, so it be
    // invalidated if any nodes have been updated - e.g. the same kind of
    // cache tag that a view has.
    $variables['#cache']['tags'][] = 'node_list';
  }

  /**
   * Prepares breadcrumb based on a node's field_breadcrumb_parent.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_page')]
  public function preparePageBreadcrumb(array &$variables): void {
    $entity = $this->routeMatch->getParameter('node');

    if (empty($entity)) {
      $event_series = $this->routeMatch->getParameter('eventseries');
      $event_instance = $this->routeMatch->getParameter('eventinstance');

      $entity = $event_series ?? $event_instance;
    }

    if (!($entity instanceof FieldableEntityInterface)) {
      return;
    }

    // Building the breadcrumb, displayed at the top of the page.
    $variables['breadcrumb'] = $this->helper->getBreadcrumb($entity);

    // If this entity is part of the structure tree, we might display an
    // automatic list of the related children.
    // This is separate from the breadcrumb that is displayed on the page.
    $breadcrumb_item = $this->helper->getBreadcrumbItem($entity);

    if ($breadcrumb_item instanceof TermInterface &&
        $breadcrumb_item->get('field_show_children')->getString() == '1') {
      // Turning a checkbox field into a TRUE/FALSE.
      $show_subtitles = $breadcrumb_item->hasField('field_show_children_subtitles') &&
        $breadcrumb_item->get('field_show_children_subtitles')->getString() == '1';

      $custom_title = $breadcrumb_item->hasField('field_children_title') ?
        $breadcrumb_item->get('field_children_title')->getString() : NULL;

      $default_title = $this->t(
        'Related content for "@title"',
        ['@title' => $breadcrumb_item->getName()],
        ['context' => 'DPL breadcrumb']
      );

      $variables['related_children'] = [
        'items' => $this->helper->getRenderedReferencingNodes($breadcrumb_item),
        'title' => !empty($custom_title) ? $custom_title : $default_title,
        'show_subtitles' => $show_subtitles,
      ];

      // Drupal will cache the whole page, as it does not know that it is
      // embedding a dynamic list. We'll add a simple cache tag, so it be
      // invalidated if any nodes have been updated - e.g. the same kind of
      // cache tag that a view has.
      // You could expand this to be a more specific cache tag, but it will only
      // affect this one page, so node_list should be sufficient.
      $variables['#cache']['tags'][] = 'node_list';
    }
  }

}
