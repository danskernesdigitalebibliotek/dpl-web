<?php

namespace Drupal\dpl_url_proxy\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerTrait;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Class ProxyUrlConfigurationForm.
 *
 * @package Drupal\dpl_url_proxy\Form
 */
class ProxyUrlConfigurationForm extends ConfigFormBase {
  use StringTranslationTrait;
  use MessengerTrait;

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'dpl_url_proxy.settings',
    ];
  }

  protected function getSavedValues() {
    $config = $this->config('dpl_url_proxy.settings');
    return $config->get('values');
  }

  protected function getFormStateValues (FormStateInterface $form_state) {
    return array_reduce($form_state->getValue(['hostnames']), function($carry, $item) {
      if(!empty($item['name'])) {
        unset($item['remove_this']);
        $carry[] = $item;
      }
      return $carry;
    }, []);
  }

  protected function constructIndexes ($form_state, $values) {
    $indexes = $form_state->get('indexes');

    if ($indexes !== NULL) {
      return $indexes;
    }

    if ($values) {
      return array_keys($values);
    }

    return [0];
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['description'] = [
      '#type' => 'item',
      '#markup' => $this->t('This configuration form is for administering proxy url generation.'),
    ];

    $indexes = $this->constructIndexes($form_state, $this->getSavedValues());
    $form_state->set('indexes', $indexes);
    $saved_values = $this->getSavedValues();

    $form['#tree'] = TRUE;
    $form['hostnames'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Hostnames'),
      '#prefix' => '<div id="hostnames-fieldset-wrapper">',
      '#suffix' => '</div>',
    ];

    foreach($indexes as $index) {
      $form['hostnames'][$index] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Hostname'),
      ];
      $form['hostnames'][$index]['name'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Name'),
        '#default_value' => $saved_values[$index]['name'] ?? '',
      ];
      $form['hostnames'][$index]['shoe_size'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Shoe size'),
        '#default_value' => $saved_values[$index]['shoe_size'] ?? '',
      ];
      $form['hostnames'][$index]['remove_this'] = [
        '#name' => $index,
        '#type' => 'submit',
        '#value' => $this->t('Remove this'),
        '#submit' => ['::removeOne'],
        '#ajax' => [
          'callback' => '::addmoreCallback',
          'wrapper' => 'hostnames-fieldset-wrapper',
        ],
      ];
    }

    $form['hostnames']['actions'] = [
      '#type' => 'actions',
    ];
    $form['hostnames']['actions']['add'] = [
      '#type' => 'submit',
      '#value' => $this->t('Add one more'),
      '#submit' => ['::addOne'],
      '#ajax' => [
        'callback' => '::addmoreCallback',
        'wrapper' => 'hostnames-fieldset-wrapper',
      ],
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'form_api_example_ajax_addmore';
  }

  public function addmoreCallback(array &$form, FormStateInterface $form_state) {
    return $form['hostnames'];
  }

  public function addOne(array &$form, FormStateInterface $form_state) {
    $indexes = $form_state->get('indexes');
    $last = end($indexes);
    $indexes[] = $last + 1;
    $form_state->set('indexes', $indexes);
    $form_state->setRebuild();
  }


  public function removeOne(array &$form, FormStateInterface $form_state) {
    $remove_value = $form_state->getTriggeringElement()['#name'];
    $key = array_search($remove_value, $form_state->get('indexes'));
    if ($key !== false) {
      unset($form_state->get('indexes')[$key]);
    }
    $form_state->setRebuild();
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = array_reduce($form_state->getValue(['hostnames']), function($carry, $item) {
      if(!empty($item['name'])) {
        unset($item['remove_this']);
        $carry[] = $item;
      }
      return $carry;
    }, []);

    $output = json_encode($values, JSON_PRETTY_PRINT);
    $this->messenger()->addMessage($output);

    $this->config('dpl_url_proxy.settings')
      ->set('values', $values)
      ->save();

    parent::submitForm($form, $form_state);
  }
}
