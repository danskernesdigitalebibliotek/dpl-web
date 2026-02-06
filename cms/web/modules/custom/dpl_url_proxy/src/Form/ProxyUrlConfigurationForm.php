<?php

namespace Drupal\dpl_url_proxy\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerTrait;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;

/**
 * The administration form for handling the configuration of the DPL URL Proxy.
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
      DplUrlProxyInterface::CONFIG_NAME,
    ];
  }

  /**
   * Get the url proxy configuration.
   *
   * @return mixed[]
   *   The url proxy configuration.
   */
  protected function getConfiguration() {
    $config = $this->config(DplUrlProxyInterface::CONFIG_NAME);
    return $config->get('values') ?? [
      'prefix' => '',
      'hostnames' => [],
    ];
  }

  // Phpstan and phpcs is conflicting about the return type.
  // phpcs:disable Drupal.Commenting.FunctionComment.InvalidReturn

  /**
   * Create indexes used for the host names add more/delete part.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Drupal form state.
   * @param mixed[] $values
   *   Saved configuration.
   *
   * @return array<int|string>
   *   The indexes.
   */
  protected function constructHostnameIndexes(FormStateInterface $form_state, array $values): array {
    $indexes = $form_state->get('indexes');

    if ($indexes !== NULL) {
      return $indexes;
    }

    if ($values && !empty($values['hostnames'])) {
      return array_keys($values['hostnames']);
    }

    return [0];
  }

  // phpcs:enable

  /**
   * Creates a label for an "expression" fieldset if configured.
   *
   * @param mixed[] $element
   *   Host name element.
   */
  protected function regexIsConfiguredLabel(array $element): string {
    if (
      empty($element['expression']['regex'])
      && empty($element['expression']['replacement'])
    ) {
      return "";
    }

    return sprintf(
      '(%s)',
      $this->t('configured', [], ['context' => 'Url Proxy'])
    );
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $indexes = $this->constructHostnameIndexes($form_state, $this->getConfiguration());
    $form_state->set('indexes', $indexes);
    $saved_values = $this->getConfiguration();

    $form['#tree'] = TRUE;
    $form['description'] = [
      '#type' => 'item',
      '#markup' => $this->t(
        'This configuration form is for administering proxy url generation.',
        [],
        ['context' => 'Url Proxy']
      ),
    ];

    $form['prefix'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Proxy server URL prefix', [], ['context' => 'Url Proxy']),
      '#default_value' => $saved_values['prefix'] ?? '',
      '#description' => $this->t(
        'The prefix to use for proxy server URLs. This is the part of the URL
        that comes before the hostname',
        [],
        ['context' => 'Url Proxy']
      ),
      '#required' => TRUE,
    ];

    $form['hostnames'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Hostnames', [], ['context' => 'Url Proxy']),
      '#prefix' => '<div id="hostnames-fieldset-wrapper">',
      '#suffix' => '</div>',
    ];

    foreach ($indexes as $index) {
      $form['hostnames'][$index] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Host configuration', [], ['context' => 'Url Proxy']),
      ];
      $form['hostnames'][$index]['hostname'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Hostname', [], ['context' => 'Url Proxy']),
        '#default_value' => $saved_values['hostnames'][$index]['hostname'] ?? '',
        '#required' => TRUE,
      ];

      $form['hostnames'][$index]['expression'] = [
        '#type' => 'details',
        '#title' => $this->t(
          'Replacement %configured',
          [
            '%configured' =>
            $this->regexIsConfiguredLabel($saved_values['hostnames'][$index] ?? []),
          ],
          ['context' => 'Url Proxy']
        ),
      ];

      $form['hostnames'][$index]['expression']['regex'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Regular expression', [], ['context' => 'Url Proxy']),
        '#size' => 30,
        '#default_value' => $saved_values['hostnames'][$index]['expression']['regex'] ?? '',
        '#description' => $this->t(
          'Use regular expression to substitut parts of the url, e.g. "<em>%regex</em>".',
          ['%regex' => '/bib\w{5,6}/'],
          ['context' => 'Url Proxy']
        ),
      ];

      $form['hostnames'][$index]['expression']['replacement'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Replacement', [], ['context' => 'Url Proxy']),
        '#size' => 30,
        '#default_value' => $saved_values['hostnames'][$index]['expression']['replacement'] ?? '',
        '#description' => $this->t('The replacement value for the regular expression.', [], ['context' => 'Url Proxy']),
      ];

      $form['hostnames'][$index]['disable_prefix'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Do not use proxy prefix for this hostname', [], ['context' => 'Url Proxy']),
        '#default_value' => $saved_values['hostnames'][$index]['disable_prefix'] ?? FALSE,
      ];

      $form['hostnames'][$index]['remove_this'] = [
        '#name' => $index,
        '#type' => 'submit',
        '#value' => $this->t('Remove this', [], ['context' => 'Url Proxy']),
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
      '#value' => $this->t('Add one more', [], ['context' => 'Url Proxy']),
      '#submit' => ['::addOne'],
      '#limit_validation_errors' => [],
      '#ajax' => [
        'callback' => '::addmoreCallback',
        'wrapper' => 'hostnames-fieldset-wrapper',
      ],
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit', [], ['context' => 'Url Proxy']),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'proxy-url-configuration';
  }

  /**
   * Callback for the "Add one more" button.
   *
   * @param mixed[] $form
   *   Drupal form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Drupal form state object.
   *
   * @return mixed[]
   *   THe "hostnames" fieldset.
   */
  public function addmoreCallback(array &$form, FormStateInterface $form_state): array {
    return $form['hostnames'];
  }

  /**
   * Adds one more host name element.
   *
   * @param mixed[] $form
   *   Drupal form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Drupal form state.
   */
  public function addOne(array &$form, FormStateInterface $form_state): void {
    $indexes = $form_state->get('indexes');
    $last = end($indexes);
    $indexes[] = $last + 1;
    $form_state->set('indexes', $indexes);
    $form_state->setRebuild();
  }

  /**
   * Removed one host name element.
   *
   * @param mixed[] $form
   *   Drupal form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Drupal form state.
   */
  public function removeOne(array &$form, FormStateInterface $form_state): void {
    if ($triggerring_element = $form_state->getTriggeringElement()) {
      $remove_value = $triggerring_element['#name'];
      $key = array_search($remove_value, $form_state->get('indexes'));
      if ($key !== FALSE) {
        unset($form_state->get('indexes')[$key]);
      }
      $form_state->setRebuild();
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $values = [];
    if ($form_state->getValue('prefix')) {
      $values['prefix'] = $form_state->getValue('prefix');
    }
    $values['hostnames'] = array_reduce($form_state->getValue(['hostnames']),
      function ($carry, $item) {
        if (!empty($item['hostname'])) {
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
