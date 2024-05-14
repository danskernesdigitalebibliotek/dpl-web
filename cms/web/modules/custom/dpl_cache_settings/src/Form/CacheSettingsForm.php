<?php

namespace Drupal\dpl_cache_settings\Form;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * A custom 'cache clear' admin page, along with consequence description.
 */
class CacheSettingsForm extends FormBase {

  /**
   * Our logger.
   */
  protected LoggerInterface $logger;

  /**
   * The module handler.
   */
  protected ModuleHandlerInterface $moduleHandler;

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container): self {
    $form = parent::create($container);
    $form->logger = $container->get('logger.channel.dpl_cache_settings');
    $form->moduleHandler = $container->get('module_handler');

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function getFormId() {
    return 'dpl_cache_settings_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['#attributes']['class'][] = 'layout-column layout-column--half';

    $form['description'] = [
      '#markup' => $this->t(
        "<p>In previous versions of Drupal, you could clear the cache frequently without major consequences.<br> From Drupal 8 onwards, the caching system has been improved, allowing you to manage the cache more specifically and effectively, which enhances response times on the website.</p>
         <p><strong>Be aware that clearing the entire cache can now slow down the website more than before. It's best to clear the cache only when necessary and report any persistent issues, so they can be further investigated.</strong></p>",
        [], ['context' => 'DPL admin UX']
      ),
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Clear caches', [], ['context' => 'DPL admin UX']),
      '#attributes' => [
        'class' => [
          'action-link', 'action-link--danger', 'action-link--icon-trash',
        ],
      ],
    ];

    return $form;
  }

  /**
   * When submitting the form, we want to clear the caches.
   *
   * These lines of code are taken from a contrib module that does almost the
   * same thing as us, but without the confirmation step that we need.
   *
   * @see https://www.drupal.org/project/cacheflush
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    if ($this->moduleHandler->moduleExists('views')) {
      views_invalidate_cache();
    }
    drupal_flush_all_caches();

    $this->logger->info($this->t(
      'Cache has been cleared manually.', [], ['context' => 'DPL admin UX']));

    $this->messenger()->addMessage($this->t('All caches cleared.', [], ['context' => 'DPL admin UX']));
  }

}
