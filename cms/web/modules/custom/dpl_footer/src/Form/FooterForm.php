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
      '#title' => $this->t('Footer columns', [], ['context' => 'DPL admin UX']),
      '#cardinality' => MultiValue::CARDINALITY_UNLIMITED,
      '#default_value' => $default_values['footer_items'] ?? [],
      'name' => [
        '#type' => 'textfield',
        '#title' => $this->t('Name', [], ['context' => 'DPL admin UX']),
      ],
      'content' => [
        '#type' => 'text_format',
        '#title' => $this->t('Content', [], ['context' => 'DPL admin UX']),
        '#description' => $this->t('If there is no content the item will be removed.', [], ['context' => 'DPL admin UX']),
        '#allowed_formats' => ['basic'],
      ],
    ];

    $form['secondary_links'] = [
      '#type' => 'multivalue',
      '#title' => $this->t('Secondary links'),
      '#cardinality' => MultiValue::CARDINALITY_UNLIMITED,
      '#default_value' => $default_values['secondary_links'] ?? [],
      'name' => [
        '#type' => 'textfield',
        '#title' => $this->t('Link title', [], ['context' => 'DPL admin UX']),
      ],
      'content' => [
        '#type' => 'linkit',
        '#autocomplete_route_name' => 'linkit.autocomplete',
        '#autocomplete_route_parameters' => [
          'linkit_profile_id' => 'default',
        ],
        '#title' => $this->t('Link'),
        '#description' => $this->t('If there is no content the item will be removed.', [], ['context' => 'DPL admin UX']),
      ],
    ];

    $social_medias = [
      'facebook' => $this->t('Facebook'),
      'instagram' => $this->t('Instagram'),
      'youtube' => $this->t('Youtube'),
      'spotify' => $this->t('Spotify'),
    ];

    $form['socials'] = [
      '#type' => 'fieldset',
      '#title' => $this->t("Social media URLs", [], ['context' => 'DPL admin UX']),
      '#description' => $this->t('The link will only be displayed if there is content.', [], ['context' => 'DPL admin UX']),
    ];

    foreach ($social_medias as $key => $name) {
      $form['socials'][$key] = [
        '#type' => 'url',
        '#title' => $name,
        '#default_value' => $default_values[$key] ?? [],
      ];
    }

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
        return !empty($item['content']['value']);
      });
    }

    // Filter out secondary links where 'content' value is an empty string.
    if (isset($values['secondary_links']) && is_array($values['secondary_links'])) {
      $values['secondary_links'] = array_filter($values['secondary_links'], function ($item) {
        return !empty($item['content']);
      });
    }

    $this->state->set($this->stateKey, $values);
    $this->cacheTagsInvalidator->invalidateTags(['dpl_footer']);
  }

}
