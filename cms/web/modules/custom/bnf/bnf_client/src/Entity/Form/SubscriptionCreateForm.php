<?php

namespace Drupal\bnf_client\Entity\Form;

use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form controller for bnf_subscription add/edit forms.
 */
class SubscriptionCreateForm extends ContentEntityForm {

  /**
   * Route Matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * Route Matcher.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): SubscriptionCreateForm {
    $form = parent::create($container);
    $form->routeMatch = $container->get('current_route_match');
    $form->entityTypeManager = $container->get('entity_type.manager');
    return $form;
  }

  /**
   * Building the form, where we check if the subscription UUID already exists.
   *
   * @param mixed[] $form
   *   A form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return mixed[]
   *   The form array, to be rendered.
   */
  public function form(array $form, FormStateInterface $form_state): array {

    $uuid = $this->routeMatch->getParameter('uuid');

    $existingSubscriptions = $this->entityTypeManager->getStorage('bnf_subscription')->loadByProperties([
      'subscription_uuid' => $uuid,
    ]);

    $existingSubscription = reset($existingSubscriptions);

    if ($existingSubscription instanceof Subscription) {
      $form['warning'] = [
        '#type' => 'container',
        '#prefix' => '<div class="dpl-form-warning">',
        '#markup' => $this->t(
          'This subscription already exists. <a href="@url">Do you want to edit/delete it?</a>',
          [
            '@url' => Url::fromRoute(
              'entity.bnf_subscription.edit_form',
              ['bnf_subscription' => $existingSubscription->id()]
            )->toString(),
          ],
          ['context' => 'BNF']
        ),
        '#suffix' => '</div>',
      ];

      return $form;
    }

    $form_state->set('uuid', $uuid);

    $form = parent::form($form, $form_state);

    $form['only_new_content'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Only import new content', [], ['context' => 'BNF']),
      '#description' => $this->t('If checked, only upcoming content related to this subscription will be imported', [], ['context' => 'BNF']),
      '#default_value' => TRUE,
    ];

    $label = $this->routeMatch->getParameter('label');
    $form['label']['widget'][0]['value']['#default_value'] = $label;

    return $form;
  }

  /**
   * {@inheritdoc}
   */

  /**
   * Saving the subscription, along with our non-editable UUID value.
   *
   * @param mixed[] $form
   *   A form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public function save(array $form, FormStateInterface $form_state): int {
    if (!($this->entity instanceof Subscription)) {
      $this->messenger()->addError(
        $this->t('Could not create subscription.', [], ['context' => 'BNF'])
      );

      return 0;
    }

    $this->entity->subscription_uuid->value = $form_state->get('uuid');

    if ($form_state->getValue('only_new_content')) {
      $this->entity->setLast($this->time->getCurrentTime());
    }

    $this->messenger()->addMessage(
      $this->t('Created subscription', [], ['context' => 'BNF'])
    );

    $status = $this->entity->save();

    $form_state->setRedirect('entity.bnf_subscription.collection');
    return $status;
  }

}
