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
    return array_reduce($form_state->getValue(['hostnames']), function(
      $carry, $item
    ) {
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

  protected function regexIsConfiguredLabel($values): string {
    if(
      empty($values['regex'])
      && empty($values['replacement'])
    ) {
      return "";
    }

    return sprintf('(%s)', $this->t('configured'), [], self::translateOptions());
  }

  protected static function translateOptions(): array {
    return [
      'context' => 'dpl_url_proxy',
    ];
  }

  public function buildForm(array $form, FormStateInterface $form_state): array {
    $t_opts = self::translateOptions();
    $indexes = $this->constructIndexes($form_state, $this->getSavedValues());
    $form_state->set('indexes', $indexes);
    $saved_values = $this->getSavedValues();

    $form['#tree'] = TRUE;
    $form['description'] = [
      '#type' => 'item',
      '#markup' => $this->t(
        'This configuration form is for administering proxy url generation.'
      ),
    ];

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
      $form['hostnames'][$index]['hostname'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Hostname'),
        '#default_value' => $saved_values[$index]['hostname'] ?? '',
        '#required' => TRUE,
      ];

      $form['hostnames'][$index]['expression'] = [
        '#type' => 'details',
        '#title' => $this->t(
          'Replacement %configured',
          [
            '%configured' =>
            $this->regexIsConfiguredLabel($saved_values[$index]['expression'])
          ],
          $t_opts
        ),
      ];

      $form['hostnames'][$index]['expression']['regex'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Regular expression'),
        '#size' => 30,
        '#default_value' => $saved_values[$index]['expression']['regex'] ?? '',
        '#description' => $this->t(
          'Use regular expression to substitut parts of the url, e.g. "<em>%regex</em>".',
          ['%regex' => '/bib\w{5,6}/'],
          $t_opts
        ),
      ];

      $form['hostnames'][$index]['expression']['replacement'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Replacement'),
        '#size' => 30,
        '#default_value' => $saved_values[$index]['expression']['replacement'] ?? '',
        '#description' => $this->t('The replacement value for the regular expression.'),
      ];

      $form['hostnames'][$index]['disable_prefix'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Do not use proxy prefix for this hostname'),
        '#default_value' => isset($saved_values[$index]['disable_prefix'])
          ? $saved_values[$index]['disable_prefix']
          : FALSE,
      ];

      $form['hostnames'][$index]['remove_this'] = [
        '#name' => $index,
        '#type' => 'submit',
        '#value' => $this->t('Remove this'),
        '#submit' => ['::removeOne'],
        '#limit_validation_errors' => [],
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
      '#limit_validation_errors' => [],
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
  public function getFormId(): string {
    return 'form_api_example_ajax_addmore';
  }

  public function addmoreCallback(array &$form, FormStateInterface $form_state): array {
    return $form['hostnames'];
  }

  public function addOne(array &$form, FormStateInterface $form_state): void {
    $indexes = $form_state->get('indexes');
    $last = end($indexes);
    $indexes[] = $last + 1;
    $form_state->set('indexes', $indexes);
    $form_state->setRebuild();
  }


  public function removeOne(array &$form, FormStateInterface $form_state): void {
    $remove_value = $form_state->getTriggeringElement()['#name'];
    $key = array_search($remove_value, $form_state->get('indexes'));
    if ($key !== false) {
      unset($form_state->get('indexes')[$key]);
    }
    $form_state->setRebuild();
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $values = array_reduce($form_state->getValue(['hostnames']), function($carry, $item) {
      if(!empty($item['hostname'])) {
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
