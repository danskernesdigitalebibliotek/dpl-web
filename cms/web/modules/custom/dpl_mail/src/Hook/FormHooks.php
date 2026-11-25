<?php

declare(strict_types=1);

namespace Drupal\dpl_mail\Hook;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;

/**
 * Form hooks for dpl_mail module.
 */
class FormHooks {

  /**
   * Lock the site email in the site information form.
   *
   * The site email has to match the sender configured in Azure Communication
   * Services, and is enforced in all.settings.php.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_system_site_information_settings_alter')]
  public function disableSiteMailField(array &$form, FormStateInterface $form_state): void {
    $form['site_information']['site_mail']['#disabled'] = TRUE;
  }

}
