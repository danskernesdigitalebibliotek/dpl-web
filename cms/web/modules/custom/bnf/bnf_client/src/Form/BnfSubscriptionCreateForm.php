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
 * Displaying a confirmation form, before setting up a BNF subscription.
 *
 * The user will have been redirected to this page, from Delingstjenesten.
 */
class BnfSubscriptionCreateForm implements FormInterface, ContainerInjectionInterface {

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
    return 'bnf_subscription_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $uuid = $this->routeMatch->getParameter('uuid');
    $label = $this->routeMatch->getParameter('label');
    $form_state->set('uuid', $uuid);
    $form_state->set('label', $label);
    $form['#title'] = $this->t('Confirm creation of BNF subscription', [], ['context' => 'BNF']);

    $existingSubscriptions = $this->subscriptionStorage->loadByProperties(['subscription_uuid' => $uuid]);
    $isEditable = empty($existingSubscriptions);

    if (!$isEditable) {
      $form['warning'] = [
        '#type' => 'container',
        '#prefix' => '<div class="dpl-form-warning">',
        '#markup' => $this->t(
          'This subscription already exists. <a href="@url">Do you want to delete it?</a>',
          [
            '@url' => Url::fromRoute(
              'bnf_client.subscription.delete_form',
              ['uuid' => $uuid, 'label' => $label]
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

    $form['only_new_content'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Only import new content', [], ['context' => 'BNF']),
      '#description' => $this->t('If checked, only upcoming content related to this subscription will be imported', [], ['context' => 'BNF']),
      '#default_value' => TRUE,
      '#disabled' => !$isEditable,
    ];

    $form['categories'] = $this->getTermFormElement('categories');
    $form['categories']['#disabled'] = !$isEditable;
    $form['tags'] = $this->getTermFormElement('tags');
    $form['tags']['#disabled'] = !$isEditable;

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#disabled' => !$isEditable,
      '#value' => $this->t('Create subscription', [], ['context' => 'BNF']),
    ];

    return $form;
  }

  /**
   * Building a term-reference form element.
   *
   * @return mixed[]
   *   A form element, to be used in $form.
   */
  private function getTermFormElement(string $vid): array {
    $options = [];

    $terms = $this->termStorage->loadByProperties(['vid' => $vid]);

    foreach ($terms as $term) {
      $options[$term->id()] = $term->label();
    }

    return [
      '#title' => $this->t('Map content to @vocabulary', ['@vocabulary' => $vid], ['context' => 'BNF']),
      '#description' => $this->t('When content is added through this subscription, these terms will be automatically added. <strong>If the content only supports a single term, only the first will be added.</strong>', [], ['context' => 'BNF']),
      "#type" => "select2",
      "#options" => $options,
      "#multiple" => TRUE,
      "#target_type" => "taxonomy_term",
      "#selection_handler" => "default:taxonomy_term",
      "#selection_settings" => [
        "match_operator" => "CONTAINS",
        "match_limit" => 10,
        "sort" => [
          "field" => "name",
        ],
        "target_bundles" => [
          $vid => $vid,
        ],
      ],
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $uuid = $form_state->get('uuid');
    $existingSubscriptions = $this->subscriptionStorage->loadByProperties(['subscription_uuid' => $uuid]);

    if (!empty($existingSubscriptions)) {
      $form_state->setErrorByName(
        'uuid',
        $this->t('Could not create subscription - this subscription already exists.', [], ['context' => 'BNF'])
      );
    }
  }

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
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

      if (!empty($form_state->getValue('categories'))) {
        $category_ids = array_column($form_state->getValue('categories'), 'target_id');
        $subscription->setCategories($category_ids);
      }

      if (!empty($form_state->getValue('tags'))) {
        $tag_ids = array_column($form_state->getValue('tags'), 'target_id');
        $subscription->setTags($tag_ids);
      }

      $subscription->save();

      $label = $form_state->get('label');

      $this->logger->info('BNF subscription connection created to @uuid', ['@uuid' => $uuid]);
      $this->messenger->addStatus($this->t('Subscription created. Related content will automatically be created when available.', [], ['context' => 'BNF']));
      $form_state->setRedirect('bnf_client.subscription.delete_form', ['uuid' => $uuid, 'label' => $label]);

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
