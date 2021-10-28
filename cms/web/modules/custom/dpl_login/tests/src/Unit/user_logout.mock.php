<?php

/**
 * @file
 * Overrides the user_logout global Drupal function.
 */

if (!function_exists('user_logout')) {

  /**
   * Mocked version of Drupal's user_logout function.
   */
  function user_logout(): void {

  }

}
