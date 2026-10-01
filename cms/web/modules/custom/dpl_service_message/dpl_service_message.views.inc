<?php

/**
 * @file
 * Views data for the service message overview.
 */

declare(strict_types=1);

use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Implements hook_views_data_alter().
 *
 * Three columns the overview needs that are not fields on the node: the
 * severity, which follows the placement; a readable summary of where the
 * message appears; and the toggle that activates it from the list.
 *
 * @param array<string, mixed> $data
 *   The views data, keyed by table.
 */
function dpl_service_message_views_data_alter(array &$data): void {
  $data['node_field_data']['svcmsg_level'] = [
    'title' => new TranslatableMarkup('Service message level', [], ['context' => 'dpl_service_message']),
    'help' => new TranslatableMarkup('The severity of a service message, which follows its placement.', [], ['context' => 'dpl_service_message']),
    'field' => [
      'id' => 'dpl_service_message_level',
      'click sortable' => FALSE,
    ],
  ];

  $data['node_field_data']['svcmsg_placement_summary'] = [
    'title' => new TranslatableMarkup('Service message placement', [], ['context' => 'dpl_service_message']),
    'help' => new TranslatableMarkup('A readable summary of the pages a service message appears on.', [], ['context' => 'dpl_service_message']),
    'field' => [
      'id' => 'dpl_service_message_placement_summary',
      'click sortable' => FALSE,
    ],
  ];

  $data['node_field_data']['svcmsg_publish_toggle'] = [
    'title' => new TranslatableMarkup('Service message publish toggle', [], ['context' => 'dpl_service_message']),
    'help' => new TranslatableMarkup('Publishes or unpublishes a service message from the overview.', [], ['context' => 'dpl_service_message']),
    'field' => [
      'id' => 'dpl_service_message_publish_toggle',
      'click sortable' => FALSE,
    ],
  ];
}
