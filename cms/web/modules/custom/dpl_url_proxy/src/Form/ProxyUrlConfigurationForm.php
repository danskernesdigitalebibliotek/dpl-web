<?php

namespace Drupal\dpl_url_proxy\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerTrait;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;

/**
 * Class ProxyUrlConfigurationForm.
 *
 * @package Drupal\dpl_url_proxy\Form
 */
class ProxyUrlConfigurationForm extends ConfigFormBase {
  use StringTranslationTrait;
  use MessengerTrait;

  public const CONFIG_NAME = 'dpl_url_proxy.settings';

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
     self::CONFIG_NAME,
    ];
  }

  protected function getSavedValues() {
    $config = $this->config(self::CONFIG_NAME);
    return $config->get('values', [
      'prefix' => '',
      'hostnames' => [],
    ]);
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

  protected function constructHostnameIndexes ($form_state, $values) {
    $indexes = $form_state->get('indexes');

    if ($indexes !== NULL) {
      return $indexes;
    }

    if ($values && !empty($values['hostnames'])) {
      return array_keys($values['hostnames']);
    }

    return [0];
  }

  protected function regexIsConfiguredLabel($values): string {
    if(
      empty($values['expression']['regex'])
      && empty($values['expression']['replacement'])
    ) {
      return "";
    }

    return sprintf(
      '(%s)',
      $this->t('configured', [], DplUrlProxyInterface::TRANSLATION_OPTIONS)
    );
  }

  public function buildForm(array $form, FormStateInterface $form_state): array {
    $t_opts = DplUrlProxyInterface::TRANSLATION_OPTIONS;
    $indexes = $this->constructHostnameIndexes($form_state, $this->getSavedValues());
    $form_state->set('indexes', $indexes);
    $saved_values = $this->getSavedValues();

    $form['#tree'] = TRUE;
    $form['description'] = [
      '#type' => 'item',
      '#markup' => $this->t(
        'This configuration form is for administering proxy url generation.',
        [],
        $t_opts
      ),
    ];

    $form['prefix'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Proxy server URL prefix'),
      '#default_value' => $saved_values['prefix'] ?? '',
      '#description' => $this->t(
        'The prefix to use for proxy server URLs. This is the part of the URL
        that comes before the hostname',
        [],
        $t_opts
      ),
      '#required' => TRUE,
    ];

    $form['hostnames'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Hostnames', [], $t_opts),
      '#prefix' => '<div id="hostnames-fieldset-wrapper">',
      '#suffix' => '</div>',
    ];

    foreach($indexes as $index) {
      $form['hostnames'][$index] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Host configuration', [], $t_opts),
      ];
      $form['hostnames'][$index]['hostname'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Hostname', [], $t_opts),
        '#default_value' => $saved_values['hostnames'][$index]['hostname'] ?? '',
        '#required' => TRUE,
      ];

      $form['hostnames'][$index]['expression'] = [
        '#type' => 'details',
        '#title' => $this->t(
          'Replacement %configured',
          [
            '%configured' =>
            $this->regexIsConfiguredLabel($saved_values['hostnames'][$index] ?? [])
          ],
          $t_opts
        ),
      ];

      $form['hostnames'][$index]['expression']['regex'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Regular expression'),
        '#size' => 30,
        '#default_value' => $saved_values['hostnames'][$index]['expression']['regex'] ?? '',
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
        '#default_value' => $saved_values['hostnames'][$index]['expression']['replacement'] ?? '',
        '#description' => $this->t('The replacement value for the regular expression.', [], $t_opts),
      ];

      $form['hostnames'][$index]['disable_prefix'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Do not use proxy prefix for this hostname', [], $t_opts),
        '#default_value' => isset($saved_values['hostnames'][$index]['disable_prefix'])
          ? $saved_values['hostnames'][$index]['disable_prefix']
          : FALSE,
      ];

      $form['hostnames'][$index]['remove_this'] = [
        '#name' => $index,
        '#type' => 'submit',
        '#value' => $this->t('Remove this', [], $t_opts),
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
      '#value' => $this->t('Add one more', [], $t_opts),
      '#submit' => ['::addOne'],
      '#limit_validation_errors' => [],
      '#ajax' => [
        'callback' => '::addmoreCallback',
        'wrapper' => 'hostnames-fieldset-wrapper',
      ],
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit', [], $t_opts),
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
    $values = [];
    if ($form_state->getValue('prefix')) {
      $values['prefix'] = $form_state->getValue('prefix');
    }
    $values['hostnames'] = array_reduce($form_state->getValue(['hostnames']), function($carry, $item) {
      if(!empty($item['hostname'])) {
        unset($item['remove_this']);
        $carry[] = $item;
      }
      return $carry;
    }, []);

    $this->config('dpl_url_proxy.settings')
      ->set('values', $values)
      ->save();

    parent::submitForm($form, $form_state);
  }

}
