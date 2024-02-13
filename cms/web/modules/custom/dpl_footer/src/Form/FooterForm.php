<?php

namespace Drupal\dpl_footer\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\multivalue_form_element\Element\MultiValue;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class FooterForm.
 *
 * A custom form for setting up the footer,
 * that is displayed on all tipi pages.
 */
class FooterForm extends FormBase {

  /**
   * State service.
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * Cache backend service.
   *
   * @var \Drupal\Core\Cache\CacheTagsInvalidatorInterface
   */
  protected $cacheTagsInvalidator;

  /**
   * The key that we use to set/get values from state.
   *
   * @var string
   */
  public $stateKey = 'dpl_footer_values';

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    /** @var static $form */
    $form = parent::create($container);

    $form->cacheTagsInvalidator = $container->get('cache_tags.invalidator');
    $form->state = $container->get('state');

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function getFormId() {
    return 'dpl_footer_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $default_values = $this->state->get($this->stateKey);

    $form['footer_items'] = [
      '#type' => 'multivalue',
      '#title' => $this->t('Footer item'),
      '#cardinality' => MultiValue::CARDINALITY_UNLIMITED,
      '#default_value' => $default_values['footer_items'] ?? [],
      'name' => [
        '#type' => 'textfield',
        '#title' => $this->t('Name'),
      ],
      'content' => [
        '#type' => 'text_format',
        '#title' => $this->t('content'),
        '#description' => $this->t('If there is no content the item will be removed.'),
        '#allowed_formats' => ['basic'],
      ],
    ];

    // Add a submit button that handles the submission of the form.
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $values = $form_state->getValues();

    // Filter out footer items where 'content' value is an empty string.
    if (isset($values['footer_items']) && is_array($values['footer_items'])) {
      $values['footer_items'] = array_filter($values['footer_items'], function ($item) {
        return isset($item['content']) && isset($item['content']['value']) && $item['content']['value'] !== '';
      });
    }

    $this->state->set($this->stateKey, $values);
    $this->cacheTagsInvalidator->invalidateTags(['dpl_footer']);
  }

}
