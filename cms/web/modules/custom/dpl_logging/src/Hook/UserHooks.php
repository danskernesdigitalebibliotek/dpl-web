<?php

declare(strict_types=1);

namespace Drupal\dpl_logging\Hook;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Component\Utility\DiffArray;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\user\Entity\User;
use Psr\Log\LoggerAwareInterface;
use Psr\Log\LoggerAwareTrait;

/**
 * User hooks.
 */
class UserHooks implements LoggerAwareInterface {

  use AutowirePluginTrait;
  use LoggerAwareTrait;
  use StringTranslationTrait;

  public function __construct(TranslationInterface $stringTranslation) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Log user changes.
   *
   * When updating a user, we want to log the changes done - this is part of
   * a security policy by DDF.
   * For most fields, the old and new value gets logged, but others may be
   * ignored, or declared on a meta-level (such as password).
   */
  #[Hook('user_presave')]
  public function logUserSave(User $user): void {
    $original_user = $user->original;

    if (!($original_user instanceof User)) {
      return;
    }

    // We're not interested in logging changes to patron accounts.
    if ($user->hasRole('patron')) {
      return;
    }

    $original_values = $original_user->toArray();
    $values = $user->toArray();
    $updates = DiffArray::diffAssocRecursive($values, $original_values);

    // Some fields are so meta that we do not need to log their changes.
    $ignored_updates = ['changed', 'metatag', 'field_password_expiration'];
    $diffs = [];

    foreach ($updates as $key => $value) {
      if (in_array($key, $ignored_updates)) {
        continue;
      }

      if ($key === 'roles') {
        $original_roles = $original_user->getRoles();
        $new_roles = $user->getRoles();

        // This results in the machine names of the roles.
        // We could also do a look up, to find the translated labels also,
        // but it is probably overkill for what this log will be used for.
        $added_roles = array_diff($new_roles, $original_roles);
        $removed_roles = array_diff($original_roles, $new_roles);

        if (!empty($added_roles)) {
          $diffs['roles_added'] = $this->t(
            'New roles added to user: @roles',
            ['@roles' => implode(', ', $added_roles)],
            ['context' => 'DPL logging']
          )->render();
        }

        if (!empty($removed_roles)) {
          $diffs['roles_removed'] = $this->t(
            'Old roles removed from user: @roles',
            ['@roles' => implode(', ', $removed_roles)],
            ['context' => 'DPL logging']
          )->render();
        }

        continue;
      }

      if ($key === 'pass') {
        // The password always shows up, but it does not always have an actual
        // value inserted - in that case, we'll filter it out.
        if (!empty(array_filter($value[0]))) {
          // We don't want to log the actual password change. It is useless as
          // it is hashed regardless.
          $diffs[$key] = $this->t(
            'Password was updated',
            [],
            ['context' => 'DPL logging']
          )->render();
        }

        continue;
      }

      // Getting human-readable label, with machine name as fallback.
      $label = $user->getFieldDefinition($key)?->getLabel() ?? $key;

      // Make sure the label is a string. Sometimes getLabel returns
      // translation.
      $label = (string) $label;

      $original_value = $original_values[$key] ?? NULL;

      $diffs[$key] = $this->t(
        '@label (@key): @original_value changed to @value',
        [
          '@label' => $label,
          '@key' => $key,
          '@original_value' => $original_value[0]['value'] ?? '(not set)',
          '@value' => $value[0]['value'] ?? '(not set)',
        ],
        ['context' => 'DPL logging']
      )->render();
    }

    if (empty($diffs)) {
      return;
    }

    $values_string = implode("\r\n | ", $diffs);

    $this->logger?->notice('User @name (@id) has been updated with the following values: @values', [
      '@name' => $user->getAccountName(),
      '@id' => $user->id(),
      '@values' => $values_string,
    ]);
  }

}
