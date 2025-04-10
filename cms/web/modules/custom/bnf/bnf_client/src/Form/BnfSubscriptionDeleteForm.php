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
use Drupal\Core\Url;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Displaying a confirmation form, before deleting a BNF subscription.
 *
 * The user will have been redirected to this page, from Delingstjenesten, if
 * they have tried to toggle an existing subscription.
 */
class BnfSubscriptionDeleteForm implements FormInterface, ContainerInjectionInterface {

  use AutowireTrait;
  use StringTranslationTrait;

  /**
   * The subscription storage.
   */
  protected EntityStorageInterface $subscriptionStorage;

  /**
   * The subscription storage.
   */
  protected EntityStorageInterface $termStorage;

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
    $this->termStorage = $entityTypeManager->getStorage('taxonomy_term');
  }

  /**
   * {@inheritDoc}
   */
  public function getFormId(): string {
    return 'bnf_subscription_delete_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $uuid = $this->routeMatch->getParameter('uuid');
    $label = $this->routeMatch->getParameter('label');
    $form_state->set('uuid', $uuid);
    $form['#title'] = $this->t('Confirm deletion of BNF subscription', [], ['context' => 'BNF']);

    $existingSubscriptions = $this->subscriptionStorage->loadByProperties(['subscription_uuid' => $uuid]);
    $isDeletable = !empty($existingSubscriptions);

    if (!$isDeletable) {
      $form['warning'] = [
        '#type' => 'container',
        '#prefix' => '<div class="dpl-form-warning">',
        '#markup' => $this->t(
          'This subscription does not exist. <a href="@url">Do you want to create it?</a>',
          [
            '@url' => Url::fromRoute(
              'bnf_client.subscription.create_form',
              ['uuid' => $uuid, 'label' => $label],
            )->toString(),
          ],
          ['context' => 'BNF']
        ),
        '#suffix' => '</div>',
      ];
    }

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

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Delete subscription (and keep imported content)', [], ['context' => 'BNF']),
      '#disabled' => !$isDeletable,
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

  /**
   * {@inheritDoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $uuid = $form_state->get('uuid');
    $existingSubscriptions = $this->subscriptionStorage->loadByProperties(['subscription_uuid' => $uuid]);

    if (empty($existingSubscriptions)) {
      $form_state->setErrorByName(
        'uuid',
        $this->t('Could not find subscription to be deleted.', [], ['context' => 'BNF'])
      );
    }
  }

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
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

      // We don't want to redirect to the create form, as that will just be
      // confusing. We should update this to redirect to the list of
      // subscriptions when it has been developed.
      $form_state->setRedirect('<front>');
    }
    catch (\Exception $e) {
      $this->messenger->addError($this->t('Could not delete subscription.', [], ['context' => 'BNF']));

      $this->logger->error(
        'Deleting BNF subscription @uuid failed. @message',
        ['@uuid' => $uuid, '@message' => $e->getMessage()]
          );
    }
  }

}
