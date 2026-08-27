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
 * The severity of a service message.
 *
 * Not a field on the node: the tone follows the placement, so there is
 * nothing for an editor to set and nothing to store. The overview still
 * shows it, because that is what an editor scanning the list looks for.
 */
#[ViewsField('dpl_service_message_level')]
class ServiceMessageLevel extends FieldPluginBase {

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

    $global = $node->get('field_svcmsg_placement')->getString() === ServiceMessagePlacement::GlobalBar->value;

    return $global
      ? $this->t('Critical', [], ['context' => 'dpl_service_message'])
      : $this->t('Information', [], ['context' => 'dpl_service_message']);
  }

}
