<?php

use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\gsearch\Services\Gsearch;
use Drupal\node\NodeInterface;

/**
 * @file
 * Deploy hooks.
 *
 * These get run AFTER config-import.
 */

/**
 * Setting the default value for 'branch address search' setting.
 */
function dpl_library_agency_deploy_set_address_search(): string {
  $config_factory = \Drupal::configFactory();
  $config = $config_factory->getEditable('dpl_library_agency.general_settings');
  $config->set('enable_branch_address_search', GeneralSettings::ENABLE_BRANCH_ADDRESS_SEARCH);
  $config->save(TRUE);

  return "Default config value for branch address search set.";
}

/**
 * Attempting to set an address string onto a gsearch address field.
 */
function _dpl_library_agency_set_address(NodeInterface $node, string $value, string $field_name = 'field_address_gsearch'): void {
  \Drupal::logger('dpl_library_agency')->info('Setting address @address for branch @branch on @field', [
    '@branch' => $node->label(),
    '@address' => $value,
    '@field' => $field_name,
  ]);

  $gsearch = DrupalTyped::service(Gsearch::class, 'gsearch.address');
  $new_value = $gsearch->getFieldValue($value, TRUE);

  $node->set($field_name, $new_value);
  $node->save();
}

/**
 * Migrate a branch field_address|field_address_dawa => field_address_gsearch.
 */
function _dpl_library_agency_migrate_address_gsearch(NodeInterface $node): bool {
  $address_value = NULL;

  if (!$node->hasField('field_address_gsearch')) {
    return FALSE;
  }

  if ($node->hasField('field_address_dawa') && !$node->get('field_address_dawa')->isEmpty()) {
    $address_value = $node->get('field_address_dawa')->getValue()[0]['value'];
  }

  if (empty($address_value) && $node->hasField('field_address') && !$node->get('field_address')->isEmpty()) {
    $address = $node->get('field_address')->getValue()[0];
    $address_value = "{$address['address_line1']} {$address['address_line2']} {$address['postal_code']} {$address['locality']}";
  }

  if (empty($address_value)) {
    return FALSE;
  }

  try {
    _dpl_library_agency_set_address($node, $address_value);
    return TRUE;
  }
  catch (\Exception $exception) {
    \Drupal::logger('dpl_library_agency')->error(
      'Could not migrate data for address search. @message',
      [$exception->getMessage()]
    );
    return FALSE;
  }

}

/**
 * Migrate branches field_address|field_address_dawa => field_address_gsearch.
 */
function dpl_library_agency_deploy_migrate_addresses_gsearch(): string {
  /** @var \Drupal\node\NodeInterface[] $branches */
  $branches = \Drupal::entityTypeManager()->getStorage('node')
    ->loadByProperties(['type' => 'branch']);

  $updated_count = 0;

  foreach ($branches as $branch) {
    if (_dpl_library_agency_migrate_address_gsearch($branch)) {
      $updated_count++;
    }
  }

  $total_count = count($branches);

  return "Migrated $updated_count/$total_count branch addresses to GSearch field.";
}

/**
 * Re-enrich branch addresses missing coordinates from GSearch.
 *
 * Branches migrated without a valid GSearch token only have raw text stored.
 * This re-queries GSearch to populate latitude, longitude, and postal data.
 */
function dpl_library_agency_deploy_enrich_branch_coordinates(): string {
  /** @var \Drupal\node\NodeInterface[] $branches */
  $branches = \Drupal::entityTypeManager()->getStorage('node')
    ->loadByProperties(['type' => 'branch']);

  $updated_count = 0;

  foreach ($branches as $branch) {
    if (!$branch->hasField('field_address_gsearch') || $branch->get('field_address_gsearch')->isEmpty()) {
      continue;
    }

    $item = $branch->get('field_address_gsearch')->first();
    $lat = $item->get('latitude')->getValue();
    $lng = $item->get('longitude')->getValue();

    // Skip branches that already have coordinates.
    if (!empty($lat) && !empty($lng)) {
      continue;
    }

    $address_text = $item->get('value')->getValue();
    if (empty($address_text)) {
      continue;
    }

    try {
      _dpl_library_agency_set_address($branch, $address_text);
      $updated_count++;
    }
    catch (\Exception $exception) {
      \Drupal::logger('dpl_library_agency')->error(
        'Could not enrich coordinates for branch @branch. @message',
        [
          '@branch' => $branch->label(),
          '@message' => $exception->getMessage(),
        ]
      );
    }
  }

  $total_count = count($branches);

  return "Enriched coordinates for $updated_count/$total_count branches.";
}
