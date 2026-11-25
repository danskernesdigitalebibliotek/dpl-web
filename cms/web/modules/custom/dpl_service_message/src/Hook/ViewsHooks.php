<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Views hooks for dpl_service_message module.
 */
class ViewsHooks {

  use StringTranslationTrait;

  /**
   * Add the service message columns for the overview.
   *
   * Three columns the overview needs that are not fields on the node: the
   * severity, which follows the placement; a readable summary of where the
   * message appears; and the toggle that activates it from the list.
   *
   * @param array<string, mixed> $data
   *   The views data, keyed by table.
   */
  #[Hook('views_data_alter')]
  public function addOverviewColumns(array &$data): void {
    $data['node_field_data']['svcmsg_level'] = [
      'title' => $this->t('Service message level', [], ['context' => 'dpl_service_message']),
      'help' => $this->t('The severity of a service message, which follows its placement.', [], ['context' => 'dpl_service_message']),
      'field' => [
        'id' => 'dpl_service_message_level',
        'click sortable' => FALSE,
      ],
    ];

    $data['node_field_data']['svcmsg_placement_summary'] = [
      'title' => $this->t('Service message placement', [], ['context' => 'dpl_service_message']),
      'help' => $this->t('A readable summary of the pages a service message appears on.', [], ['context' => 'dpl_service_message']),
      'field' => [
        'id' => 'dpl_service_message_placement_summary',
        'click sortable' => FALSE,
      ],
    ];

    $data['node_field_data']['svcmsg_publish_toggle'] = [
      'title' => $this->t('Service message publish toggle', [], ['context' => 'dpl_service_message']),
      'help' => $this->t('Publishes or unpublishes a service message from the overview.', [], ['context' => 'dpl_service_message']),
      'field' => [
        'id' => 'dpl_service_message_publish_toggle',
        'click sortable' => FALSE,
      ],
    ];
  }

}
