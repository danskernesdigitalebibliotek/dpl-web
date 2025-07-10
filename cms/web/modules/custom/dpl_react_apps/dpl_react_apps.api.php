<?php

/**
 * @file
 * Hooks provided by the dpl_react_apps module.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Provide API URLs to the React apps.
 *
 * These will be available to the React apps in a 'data-<name>-base-url'
 * attribute.
 *
 * @return array<string, string>
 *   Name to URL mapping.
 */
function hook_dpl_react_apps_api_urls(): array {
  return [
    'my-service' => 'https://example.org/graphql',
  ];
}

/**
 * @} End of "addtogroup hooks".
 */
