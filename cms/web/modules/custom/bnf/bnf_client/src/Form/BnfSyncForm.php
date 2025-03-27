<?php

namespace Drupal\bnf_client\Form;

use Drupal\bnf_client\BnfScheduler;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\queue_ui\QueueUIBatchInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Full sync form.
 */
class BnfSyncForm implements FormInterface, ContainerInjectionInterface {

  use DependencySerializationTrait;
  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected BnfScheduler $scheduler,
    protected QueueUIBatchInterface $queueBatch,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get(BnfScheduler::class),
      $container->get('queue_ui.batch'),
      $container->get('string_translation'),
    );
  }

  /**
   * {@inheritDoc}
   */
  public function getFormId(): string {
    return 'bnf_import_sync_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['#title'] = $this->t('Refresh all subscriptions?', [], ['context' => 'BNF']);

    $form['description'] = [
      '#prefix' => '<p>',
      '#suffix' => '</p>',
      '#markup' => $this->t('This will check for new updates on subscriptions and content, and update if necessary.', [], ['context' => 'BNF']),
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Refresh subscriptions'),
    ];

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    // Nothing to validate.
  }

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->scheduler->queueAllSubscriptionsUpdate();
    $this->scheduler->queueAllNodesUpdate();

    $this->queueBatch->batch(['bnf_client_new_content', 'bnf_client_node_update']);
  }

}
