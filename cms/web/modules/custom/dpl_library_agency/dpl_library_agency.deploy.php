<?php

use Drupal\node\NodeInterface;
use function Safe\preg_replace;
use function Safe\json_decode;

/**
 * @file
 * Deploy hooks.
 *
 * These get run AFTER config-import.
 */

/**
 * Migrating a branch node address fields field_address => field_address_dawa.
 */
function _dpl_library_agency_migrate_address(NodeInterface $node): bool {
  $address_field = $node->get('field_address');

  if ($address_field->isEmpty()) {
    return FALSE;
  }

  $address = $address_field->getValue()[0];
  $address_line = "{$address['address_line1']} {$address['address_line2']} {$address['address_line3']} {$address['postal_code']} {$address['locality']}";

  // Remove double spaces in the address.
  $address_line = preg_replace('/\s+/', ' ', $address_line);

  // Look up the existing address in DAWA.
  // If something goes wrong, we'll just bail out - it is not deeply critical
  // that these fields get migrated, as we'll ask the editors to double-check.
  try {
    $request = \Drupal::httpClient()->get('https://api.dataforsyningen.dk/adresser', [
      'query' => [
        'q' => $address_line,
        'per_side' => 1,
      ],
    ]);

    $results = $request->getBody()->getContents();
    $results = json_decode($results, TRUE);
    $result = $results[0] ?? NULL;

    if (empty($result)) {
      return FALSE;
    }

    $coords = $result['adgangsadresse']['adgangspunkt']['koordinater'] ?? [];

    $data = [
      'type' => 'adresse',
      'id' => $result['id'] ?? NULL,
      'status' => $result['status'] ?? NULL,
      'value' => $address_line,
      'lat' => $coords[0] ?? NULL,
      'lng' => $coords[1] ?? NULL,
      'data' => $result,
    ];

    $node->set('field_address_dawa', $data);
    $node->save();
    return TRUE;
  }
  catch (\Exception $exception) {
    \Drupal::logger('dpl_library_agency')->error('Could not migrate data for @branch with address @address. @message', [
      '@branch' => $node->label(),
      '@address' => $address_line,
      '@message' => $exception->getMessage(),
    ]);
    return FALSE;
  }
}

/**
 * Migrating branches address fields field_address => field_address_dawa.
 */
function dpl_library_agency_deploy_migrate_addresses(): string {
  /** @var \Drupal\node\NodeInterface[] $branches */
  $branches = \Drupal::entityTypeManager()->getStorage('node')
    ->loadByProperties(['type' => 'branch']);

  $updated_count = 0;

  foreach ($branches as $branch) {
    if (_dpl_library_agency_migrate_address($branch)) {
      $updated_count++;
    }
  }

  $total_count = count($branches);

  return "Migrated $updated_count/$total_count branch addresses to DAWA field.";
}
