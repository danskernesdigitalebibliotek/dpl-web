<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\views\field;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;
use Drupal\views\Attribute\ViewsField;
use Drupal\views\Plugin\views\field\FieldPluginBase;
use Drupal\views\ResultRow;

/**
 * Where a service message appears, in one readable line.
 *
 * The placement is spread over three fields. Listing them as three columns
 * would make the overview unreadable, so they collapse into a summary.
 */
#[ViewsField('dpl_service_message_placement_summary')]
class ServiceMessagePlacementSummary extends FieldPluginBase {

  /**
   * Beyond this many branches the names are replaced by a count.
   */
  protected const MAX_NAMES = 3;

  /**
   * {@inheritdoc}
   */
  public function query(): void {
    // Rendered from the loaded entity, so nothing to add to the query.
  }

  /**
   * {@inheritdoc}
   */
  public function render(ResultRow $values): string|TranslatableMarkup {
    $node = $this->getEntity($values);

    if (!($node instanceof NodeInterface) || $node->bundle() !== ServiceMessageLoader::BUNDLE) {
      return '';
    }

    if ($node->get('field_svcmsg_placement')->getString() === ServiceMessagePlacement::GlobalBar->value) {
      return $this->t('The whole site', [], ['context' => 'dpl_service_message']);
    }

    $parts = [];

    if ($node->get('field_svcmsg_frontpage')->value) {
      $parts[] = $this->t('Front page', [], ['context' => 'dpl_service_message']);
    }

    $branches = $node->get('field_svcmsg_branches')->referencedEntities();

    if (count($branches) > self::MAX_NAMES) {
      $parts[] = $this->formatPlural(
        count($branches),
        '1 branch',
        '@count branches',
        [],
        ['context' => 'dpl_service_message']
      );
    }
    else {
      foreach ($branches as $branch) {
        $parts[] = $branch->label();
      }
    }

    return implode(', ', array_map(strval(...), $parts));
  }

}
