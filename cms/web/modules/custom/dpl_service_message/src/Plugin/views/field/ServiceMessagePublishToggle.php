<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\views\field;

use Drupal\Core\Url;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;
use Drupal\views\Attribute\ViewsField;
use Drupal\views\Plugin\views\field\FieldPluginBase;
use Drupal\views\ResultRow;

/**
 * A link that publishes or unpublishes a service message from the overview.
 *
 * A link rather than a checkbox with a save button: publishing a message is
 * the one thing an editor comes to this list to do, and a link works without
 * JavaScript and carries its own access check.
 */
#[ViewsField('dpl_service_message_publish_toggle')]
class ServiceMessagePublishToggle extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  public function query(): void {
    // Rendered from the loaded entity, so nothing to add to the query.
  }

  /**
   * {@inheritdoc}
   *
   * @return array<string, mixed>|string
   *   A link render array, or nothing for rows we cannot toggle.
   */
  public function render(ResultRow $values): array|string {
    $node = $this->getEntity($values);

    if (!($node instanceof NodeInterface) || $node->bundle() !== ServiceMessageLoader::BUNDLE) {
      return '';
    }

    if (!$node->access('update')) {
      return '';
    }

    $url = Url::fromRoute('dpl_service_message.toggle', ['node' => $node->id()]);

    return [
      '#type' => 'link',
      '#title' => $node->isPublished()
        ? $this->t('Unpublish', [], ['context' => 'dpl_service_message'])
        : $this->t('Publish', [], ['context' => 'dpl_service_message']),
      '#url' => $url,
      '#attributes' => ['class' => ['button', 'button--small']],
      '#cache' => ['tags' => $node->getCacheTags()],
    ];
  }

}
