<?php

namespace Drupal\bnf_client\Entity\Form;

use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for bnf_subscription add/edit forms.
 */
class SubscriptionForm extends ContentEntityForm {

  use AutowireTrait;

  /**
   * {@inheritdoc}
   */
  protected function prepareEntity(): void {
    // The doc-comment of ContentEntityForm::entity is wrong.
    assert($this->entity instanceof ContentEntityInterface);

    if ($this->entity->isNew()) {
      $this->entity->set('subscription_uuid', $this->getRequest()->query->get('uuid', ''));
      $this->entity->set('label', $this->getRequest()->query->get('label', ''));
    }
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
    if ($this->entity->isNew()) {
      // A bit harsh error handling, but using a validate handler doesn't make
      // sense (as the user can't edit the field) and we're not supposed to get
      // here without the query argument.
      if (empty($this->entity->subscription_uuid->value)) {
        throw new \RuntimeException('Cannot create subscription without an UUID.');
      }

      $form['only_new_content'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Only import new content', [], ['context' => 'BNF']),
        '#description' => $this->t('If checked, only upcoming content related to this subscription will be imported.<br> "New content" is defined by content that has been saved, regardless of publishing date.', [], ['context' => 'BNF']),
        '#default_value' => TRUE,
      ];
    }

    return parent::form($form, $form_state);
  }

  /**
   * Saving the subscription, along with our non-editable UUID value.
   *
   * @param mixed[] $form
   *   A form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public function save(array $form, FormStateInterface $form_state): int {
    assert($this->entity instanceof Subscription);

    if ($this->entity->isNew()) {
      if ($form_state->getValue('only_new_content')) {
        $this->entity->setLast($this->time->getCurrentTime());
      }
    }

    $status = parent::save($form, $form_state);

    $form_state->setRedirect('entity.bnf_subscription.collection');

    return $status;
  }

}
