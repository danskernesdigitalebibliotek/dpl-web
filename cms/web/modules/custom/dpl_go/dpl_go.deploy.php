<?php

/**
 * Make sure that we have properly configured the Next Site.
 */
function dpl_go_deploy_0001_create_next_go_site_configuration(): string {
  if (
    getenv('LAGOON_ENVIRONMENT_TYPE') === 'production' &&
    (!getenv('DRUPAL_PREVIEW_SECRET') || !getenv('DRUPAL_REVALIDATE_SECRET'))
  ) {
    throw new \Exception('The secrets DRUPAL_PREVIEW_SECRET and DRUPAL_REVALIDATE_SECRET must be set in production.');
  }

  /** @var \Drupal\dpl_go\GoSite $go_site */
  $go_site = \Drupal::service('dpl_go.go_site');
  if (!$base_url = $go_site->getGoBaseUrl()) {
    return 'Could not determine the Go base URL.';
  }

  $preview_url = sprintf('%s/preview', $base_url);

  // Default revalidate URL and preview/revalidates for development.
  $revalidate_url = sprintf('%s/cache/revalidate', 'http://host.docker.internal:3000');
  $preview_secret = 'HRGx27rJGAB8Dy8mJDRd';
  $revalidate_secret = 'CeXF8E2Rd9wXZ2sswFHR';

  // Set the revalidate URL and preview/revalidates for production.
  if (getenv('LAGOON_ENVIRONMENT_TYPE') === 'production') {
    $revalidate_url = sprintf('%s/cache/revalidate', $base_url);
    $preview_secret = getenv('DRUPAL_PREVIEW_SECRET');
    $revalidate_secret = getenv('DRUPAL_REVALIDATE_SECRET');
  }

  // Define the entity data.
  $entity_data = [
    'langcode' => 'en',
    'status' => TRUE,
    'id' => 'go',
    'label' => 'Go',
    'base_url' => $base_url,
    'preview_url' => $preview_url,
    'preview_secret' => $preview_secret,
    'revalidate_url' => $revalidate_url,
    'revalidate_secret' => $revalidate_secret,
  ];

  // Create the Go site entity.
  $entity = \Drupal::entityTypeManager()
    ->getStorage('next_site')
    ->create($entity_data);
  // Save the entity.
  $entity->save();

  return 'The "Go" next_site has been created.';
}
