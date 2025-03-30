<?php

namespace Drupal\bnf_client\Form;

use Drupal\bnf\Services\BnfImporter;
use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Displaying a confirmation form, before setting up a BNF subscription.
 *
 * The user will have been redirected to this page, from Delingstjenesten.
 */
class BnfSubscriptionForm implements FormInterface, ContainerInjectionInterface {

  use AutowireTrait;
  use StringTranslationTrait;

  /**
   * The subscription storage.
   */
  protected EntityStorageInterface $subscriptionStorage;

  /**
   * {@inheritDoc}
   */
  public function __construct(
    protected RouteMatchInterface $routeMatch,
    protected RequestStack $requestStack,
    protected MessengerInterface $messenger,
    protected BnfImporter $bnfImporter,
    #[Autowire(service: 'logger.channel.bnf')]
    protected LoggerInterface $logger,
    EntityTypeManagerInterface $entityTypeManager,
  ) {
    $this->subscriptionStorage = $entityTypeManager->getStorage('bnf_subscription');
  }

  /**
   * {@inheritDoc}
   */
  public function getFormId(): string {
    return 'bnf_subscription_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $uuid = $this->routeMatch->getParameter('uuid');
    $label = $this->requestStack->getCurrentRequest()?->query->get('label');
    $form_state->set('uuid', $uuid);

    $form['uuid'] = [
      '#title' => 'UUID',
      '#type' => 'textfield',
      '#default_value' => $uuid,
      '#disabled' => TRUE,
    ];

    $form['label'] = [
      '#title' => $this->t('Subscription label', [], ['context' => 'BNF']),
      '#type' => 'textfield',
      '#default_value' => $label ?? NULL,
      '#disabled' => TRUE,
    ];

    $existingSubscriptions = $this->subscriptionStorage->loadByProperties(['subscription_uuid' => $uuid]);

    if (!empty($existingSubscriptions)) {
      $form['#title'] = $this->t('Confirm deletion of BNF subscription', [], ['context' => 'BNF']);

      $form['actions']['submit'] = [
        '#type' => 'submit',
        '#submit' => ['::deleteSubscription'],
        '#value' => $this->t('Delete subscription (and keep imported content)', [], ['context' => 'BNF']),
        '#attributes' => [
          'class' => [
            'button',
            'button--primary',
            'button--danger',
          ],
        ],
      ];

      return $form;
    }

    $form['#title'] = $this->t('Confirm creation of BNF subscription', [], ['context' => 'BNF']);

    $form['only_new_content'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Only import new content', [], ['context' => 'BNF']),
      '#description' => $this->t('If checked, only upcoming content related to this subscription will be imported', [], ['context' => 'BNF']),
      '#default_value' => TRUE,

    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#submit' => ['::createSubscription'],
      '#value' => $this->t('Create subscription'),
    ];

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {}

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {}

  /**
   * Callback, used when subscription is being deleted.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function deleteSubscription(array &$form, FormStateInterface $form_state): void {
    $uuid = $form_state->get('uuid');
    $existingSubscriptions = $this->subscriptionStorage->loadByProperties(['subscription_uuid' => $uuid]);

    try {
      $this->subscriptionStorage->delete($existingSubscriptions);

      $this->logger->info('Deleted BNF subscription @uuid', ['@uuid' => $uuid]);
      $this->messenger->addStatus($this->t(
        'Subscription deleted. Content imported with from this subscription has NOT been deleted.',
        [],
        ['context' => 'BNF']
      ));
    }
    catch (\Exception $e) {
      $this->messenger->addError($this->t('Could not delete subscription.', [], ['context' => 'BNF']));

      $this->logger->error(
        'Deleting BNF subscription @uuid failed. @message',
        ['@uuid' => $uuid, '@message' => $e->getMessage()]
      );
    }
  }

  /**
   * Callback, used when subscription is being created.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function createSubscription(array &$form, FormStateInterface $form_state): void {
    $uuid = $form_state->get('uuid');
    $existingSubscriptions = $this->subscriptionStorage->loadByProperties([
      'subscription_uuid' => $uuid,
    ]);

    // Even though we already have this check as part of the form building,
    // we want to make sure that even if the form submission is triggered anyway
    // we don't end up with duplicate subscriptions.
    if (!empty($existingSubscriptions)) {
      $form_state->setErrorByName('uuid', $this->t('This subscription already exists.', [], ['context' => 'BNF']));
      return;
    }

    try {
      /** @var \Drupal\bnf_client\Entity\Subscription $subscription */
      $subscription = $this->subscriptionStorage->create([
        'subscription_uuid' => $uuid,
      ]);

      if ($form_state->getValue('only_new_content')) {
        $subscription->setLast(time());
      }

      $subscription->save();

      $this->logger->info('BNF subscription connection created to @uuid', ['@uuid' => $uuid]);
      $this->messenger->addStatus($this->t('Subscription created. Related content will automatically be created when available.', [], ['context' => 'BNF']));

    }
    catch (\Exception $e) {
      $this->messenger->addError($this->t(
        'Could not create subscription.', [], ['context' => 'BNF']
      ));

      $this->logger->error(
        'BNF subscription creation to @uuid failed. @message',
        ['@uuid' => $uuid, '@message' => $e->getMessage()]
      );
    }
  }

}
