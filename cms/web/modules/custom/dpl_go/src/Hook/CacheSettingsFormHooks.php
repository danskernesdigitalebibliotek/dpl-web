<?php

declare(strict_types=1);

namespace Drupal\dpl_go\Hook;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_go\GoRevalidator;

/**
 * Adds a "Clear Go cache" button to the DPL cache settings page.
 *
 * The Go front-end caches the content and configuration it reads from the CMS.
 * This puts a manual purge next to Drupal's own "Clear caches" button, so an
 * editor can force Go to drop that cache from the same place.
 */
class CacheSettingsFormHooks {

  use StringTranslationTrait;

  public function __construct(
    protected GoRevalidator $revalidator,
    protected MessengerInterface $messenger,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add the Go cache purge button to the cache settings form.
   *
   * @param array<string, mixed> $form
   *   The cache settings form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  #[Hook('form_dpl_cache_settings_form_alter')]
  public function alterCacheSettingsForm(array &$form, FormStateInterface $form_state): void {
    $form['go_cache_description'] = [
      '#markup' => $this->t(
        "<hr><h3>Go front-end</h3>
         <p>The Go front-end keeps its own cache of the content and configuration it reads from the CMS. A change here normally reaches Go on its own within a few minutes. Use this button to drop that cache right away.</p>",
        [], ['context' => 'dpl_go']
      ),
      '#weight' => 10,
    ];

    $form['go_cache_submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Clear Go cache', [], ['context' => 'dpl_go']),
      '#submit' => [[static::class, 'clearGoCache']],
      '#weight' => 11,
      '#attributes' => [
        'class' => [
          'action-link', 'action-link--danger', 'action-link--icon-trash',
        ],
      ],
    ];
  }

  /**
   * Submit handler: drop Go's cache of CMS content and configuration.
   *
   * @param array<string, mixed> $form
   *   The submitted form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public static function clearGoCache(array &$form, FormStateInterface $form_state): void {
    $revalidator = \Drupal::service(GoRevalidator::class);
    $messenger = \Drupal::messenger();

    if ($revalidator->revalidateEverything()) {
      $messenger->addMessage(t('Go cache cleared.', [], ['context' => 'dpl_go']));
    }
    else {
      $messenger->addWarning(t('Could not reach Go to clear its cache. See the logs for details.', [], ['context' => 'dpl_go']));
    }
  }

}
