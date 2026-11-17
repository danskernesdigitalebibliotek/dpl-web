<?php

declare(strict_types=1);

namespace Drupal\media_twentythree\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\ConfigTarget;
use Drupal\Core\Form\FormStateInterface;
use Safe\Exceptions\UrlException;
use function Safe\parse_url;

/**
 * Configure which hosts TwentyThree videos may be added from.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'media_twentythree_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['media_twentythree.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['allowed_hosts'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Allowed host names', [], ['context' => 'media_twentythree']),
      '#description' => $this->t('The host names your TwentyThree videos are served from, one per line. For example: video.example.dk. Videos can only be added from these host names.', [], ['context' => 'media_twentythree']),
      '#rows' => 5,
      // The host names are validated by the constraints in the config schema.
      '#config_target' => new ConfigTarget(
        'media_twentythree.settings',
        'allowed_hosts',
        self::class . '::arrayToMultiLineString',
        self::class . '::multiLineStringToArray',
      ),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * Prepares the saved allowed_hosts property to be displayed in the form.
   *
   * @param string[]|null $value
   *   The value saved in config. NULL on sites that had the module enabled
   *   before the config was added, until the form is first saved.
   *
   * @return string
   *   The value of the form element.
   */
  public static function arrayToMultiLineString(?array $value): string {
    return implode("\n", $value ?? []);
  }

  /**
   * Prepares the submitted value to be stored in the allowed_hosts property.
   *
   * @param string $value
   *   The submitted value.
   *
   * @return string[]
   *   Unique, lower case host names.
   */
  public static function multiLineStringToArray(string $value): array {
    $hosts = [];

    foreach (array_filter(array_map('trim', explode("\n", $value))) as $line) {
      // Accept a pasted video URL as well as a bare host name. Anything we
      // cannot get a host from is passed on as-is, for validation to reject.
      try {
        $host = str_contains($line, '://') ? parse_url($line, PHP_URL_HOST) : $line;
      }
      catch (UrlException) {
        $host = NULL;
      }

      $hosts[] = mb_strtolower(is_string($host) ? $host : $line);
    }

    return array_values(array_unique($hosts));
  }

}
