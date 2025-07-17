<?php

namespace Drupal\dpl_fbi\Plugin\Field\FieldWidget;

use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Ajax\AfterCommand;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\InvokeCommand;
use Drupal\Core\Ajax\RemoveCommand;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;
use Drupal\dpl_fbi\FirstAccessionDateOperator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\parse_url;
use function Safe\preg_match;

/**
 * The CQL Search form widget.
 *
 * Includes AJAX logic, that allows the editor to paste in a link to a search
 * and have the fields automatically be filled out.
 *
 * @FieldWidget(
 *   id = "cql_search_widget",
 *   label = @Translation("CQL Search Widget"),
 *   field_types = {
 *     "dpl_fbi_cql_search"
 *   }
 * )
 */
class CqlSearchWidget extends WidgetBase {

  /**
   * The module handler, we use to get dpl_admin assets.
   */
  protected ModuleHandlerInterface $moduleHandler;

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings']
    );
  }

  /**
   * {@inheritdoc}
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form_state object.
   *
   * @return array<mixed>
   *   The altered form array.
   */
  public function settingsForm(array $form, FormStateInterface $form_state): array {
    $columns =
      $this->fieldDefinition->getFieldStorageDefinition()->getColumns();

    unset($columns['value']);
    $columns = array_keys($columns);

    $element['advanced'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enabled advanced fields', [], ['context' => 'dpl_fbi']),
      '#description' => $this->t('Allow editor to fill data into advanced fields (@fields)', [
        '@fields' => implode(', ', $columns),
      ], ['context' => 'dpl_fbi']),
      '#default_value' => $this->getSetting('advanced') ?? TRUE,
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   *
   * @return array<mixed>
   *   The default settings.
   */
  public static function defaultSettings():array {
    return [
      'advanced' => TRUE,
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   *
   * @return array<string>
   *   The summary strings.
   */
  public function settingsSummary(): array {
    $summary = [];

    $summary[] = $this->getSetting('advanced') ?
      $this->t(
        'Advanced fields enabled', [], ['context' => 'dpl_fbi']
      ) :
      $this->t(
        'Advanced fields NOT enabled', [], ['context' => 'dpl_fbi']
      );

    return $summary;
  }

  /**
   * {@inheritDoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $fieldStorageDefinition = $items->getFieldDefinition()->getFieldStorageDefinition();
    $linkWrapperId = Html::getUniqueId('cql-search-link-wrapper');

    $element['link'] = [
      '#type' => 'details',
      '#name' => $linkWrapperId,
      '#title' => $this->t('Fill out fields using link (optional)', [], ['context' => 'dpl_fbi']),
      '#open' => empty($items[$delta]->value),
      '#attributes' => [
        'id' => $linkWrapperId,
        'class' => ['link-details'],
      ],
    ];

    $element['link']['url'] = [
      '#type' => 'textarea',
      '#rows' => 4,
      '#title' => $this->t('Link to search', [], ['context' => 'dpl_fbi']),
      '#default_value' => $items[$delta]->link ?? '',
      '#prefix' => '<div>',
      '#suffix' => '</div>',
      '#attributes' => [
        'placeholder' => $this->t(
          'E.g. https://mitbibliotek.dk/advanced-search?advancedSearchCql=%27Harry+Potter%27',
          [], ['context' => 'dpl_fbi']
        ),
      ],
    ];

    $element['link']['submit_url'] = [
      '#type' => 'submit',
      '#name' => Html::getUniqueId('cql-search-link-submit'),
      '#value' => $this->t('Load filters from URL', [], ['context' => 'dpl_fbi']),
      '#ajax' => [
        'callback' => [$this, 'loadFilters'],
        'wrapper' => $linkWrapperId,
      ],
      '#executes_submit_callback' => FALSE,
      // Placing the button inside the textarea, to make it clear that they
      // are related.
      '#attributes' => [
        'class' => ['button--primary'],
        'style' => 'position: absolute; margin-top: -80px; right: 40px;',
      ],
    ];

    $element['filters'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Search filters', [], ['context' => 'dpl_fbi']),
      'cql' => [
        '#type' => 'textarea',
        '#rows' => 3,
        '#title' => $fieldStorageDefinition->getPropertyDefinition('value')?->getLabel(),
        '#default_value' => $items[$delta]->value ?? '',
        '#weight' => 0,
      ],
    ];

    if ($this->getSetting('advanced')) {
      $element['filters'] += [
        'sort' => [
          '#type' => 'select',
          '#weight' => -1,
          '#title' => $fieldStorageDefinition->getPropertyDefinition('sort')?->getLabel(),
          '#default_value' => $items[$delta]->sort ?? 'sort.latestpublicationdate.desc',
          '#options' => [
            'sort.latestpublicationdate.desc' => $this->t(
              'By publication date (descending)', [], ['context' => 'dpl_fbi']
            ),
            'sort.latestpublicationdate.asc' => $this->t(
              'By publication date (ascending)', [], ['context' => 'dpl_fbi']
            ),
            'sort.title.desc' => $this->t(
              'By title (descending)', [], ['context' => 'dpl_fbi']
            ),
            'sort.title.asc' => $this->t(
              'By title (ascending)', [], ['context' => 'dpl_fbi']
            ),
            'sort.creator.desc' => $this->t(
              'By creator (descending)', [], ['context' => 'dpl_fbi']
            ),
            'sort.creator.asc' => $this->t(
              'By creator (ascending)', [], ['context' => 'dpl_fbi']
            ),
            'relevance' => $this->t(
              'By relevance', [], ['context' => 'dpl_fbi']
            ),
          ],
        ],
        'location' => [
          '#type' => 'textarea',
          '#rows' => 2,
          '#title' => $fieldStorageDefinition->getPropertyDefinition('location')?->getLabel(),
          '#default_value' => $items[$delta]->location ?? '',
        ],
        'sublocation' => [
          '#type' => 'textarea',
          '#rows' => 2,
          '#title' => $fieldStorageDefinition->getPropertyDefinition('sublocation')?->getLabel(),
          '#default_value' => $items[$delta]->sublocation ?? '',
        ],
        'branch' => [
          '#type' => 'textarea',
          '#rows' => 2,
          '#title' => $fieldStorageDefinition->getPropertyDefinition('branch')
          ?->getLabel(),
          '#default_value' => $items[$delta]->branch ?? '',
        ],
        'department' => [
          '#type' => 'textarea',
          '#rows' => 2,
          '#title' => $fieldStorageDefinition->getPropertyDefinition('department')
          ?->getLabel(),
          '#default_value' => $items[$delta]->department ?? '',
        ],
        'onshelf' => [
          '#type' => 'checkbox',
          '#title' => $fieldStorageDefinition->getPropertyDefinition('onshelf')?->getLabel(),
          '#default_value' => $items[$delta]->onshelf ?? '',
        ],
        'first_accession_date' => [
          '#type' => 'fieldset',
          '#title' => $this->t('First accession date', [], ['context' => 'dpl_fbi']),

          'operator' => [
            '#title' => $fieldStorageDefinition->getPropertyDefinition('first_accession_date_operator')?->getLabel(),
            '#type' => 'select',
            '#default_value' => $items[$delta]->first_accession_date_operator ?? FirstAccessionDateOperator::LaterThan->value,
            '#options' => [
              FirstAccessionDateOperator::LaterThan->value => FirstAccessionDateOperator::LaterThan->label(),
              FirstAccessionDateOperator::ExactDate->value => FirstAccessionDateOperator::ExactDate->label(),
              FirstAccessionDateOperator::EarlierThan->value => FirstAccessionDateOperator::EarlierThan->label(),
            ],
          ],
          'value' => [
            '#type' => 'textfield',
            '#title' => $fieldStorageDefinition->getPropertyDefinition('first_accession_date_value')?->getLabel(),
            '#default_value' => $items[$delta]->first_accession_date_value ?? '',
            '#description' => $fieldStorageDefinition->getPropertyDefinition('first_accession_date_value')?->getDescription(),
          ],
        ],
      ];
    }

    return $element;
  }

  /**
   * AJAX callback, triggered when inputting URL in link field.
   *
   * When called, we'll find the supplied URL, and run some checks to see if
   * we can find filters such as CQL or location.
   *
   *  If we cannot, we will display a warning for the user.
   *
   * @param array<mixed> $form
   *   The form, as part of formElement().
   * @param \Drupal\Core\Form\FormStateInterface $formState
   *   The form state object, as part of formElement().
   */
  public function loadFilters(array &$form, FormStateInterface $formState): AjaxResponse {
    // As this is happening inside a paragraph, we need to actually find the
    // right subform. This can be done by looking at the triggering element
    // (the button that triggers this) and using 'array_parents' to loop
    // through $form and finding this form element.
    $triggeringElement = (array) $formState->getTriggeringElement();

    $array_parents = (array) $triggeringElement['#array_parents'];
    // We want the parent of the parent of the link field, as the link field
    // is also inside its own fieldset. Hence -2.
    $array_parents = array_slice($array_parents, 0, -2);
    $formElement = NestedArray::getValue($form, $array_parents);

    // We want to find the DOM selector for the outer-most container.
    // We'll do that, by looking up the form element that we have, and remove
    // everything after "subform" - that way, we have found the paragraph.
    $parentSelector = $formElement['#attributes']['data-drupal-selector'] ?? '';
    $parentSelector = strstr($parentSelector, 'subform', TRUE) . 'subform';
    $parentSelector = "[data-drupal-selector=\"$parentSelector\"]";

    // To load the value, we want to do something similar, but instead of
    // looking at #array_parents, we'll instead look at #parents.
    $parents = (array) $triggeringElement['#parents'];
    $parents = array_slice($parents, 0, -2);
    $values = $formState->getValue($parents);
    $link = $values['link']['url'] ?? '';

    // When pasting a link, spaces may be added unintentionally in the
    // beginning or end of the string. To avoid confusion, we'll just remove it.
    $link = trim($link);
    $linkName = $formElement['link']['url']['#name'];

    // The JS selector we use with AJAX.
    $linkSelector = "$parentSelector [name=\"$linkName\"]";

    $response = new AjaxResponse();

    $cqlName = $formElement['filters']['cql']['#name'];
    $cqlValue = $this->getFilter($link, 'advancedSearchCql');

    $warningClass = 'dpl-material-search-warning';

    // Remove warning that may have been set previously, due to invalid URL.
    $response->addCommand(new InvokeCommand($linkSelector, 'removeClass', ['error']));
    $response->addCommand(new RemoveCommand("$parentSelector .$warningClass"));

    // If the user inputted a link that we could not find any CQL data from,
    // we'll display a warning.
    if (!$cqlValue) {
      $warningMessage = $this->t(
        'The link you pasted is not valid.<br> See the guide, for how to find a correct link.',
        [], ['context' => 'dpl_fbi']
      );
      $warningMarkup = Markup::create(
        "<div class=\"dpl-form-warning $warningClass\">{$warningMessage->render()}</div>"
      );
      $response->addCommand(new InvokeCommand($linkSelector, 'addClass', ['error']));
      $response->addCommand(new AfterCommand($linkSelector, $warningMarkup));

      return $response;
    }

    // Empty out the link field, and hide it by closing the details.
    $response->addCommand(new InvokeCommand("$parentSelector [name=\"$linkName\"]", 'val', ['']));
    $response->addCommand(new InvokeCommand("$parentSelector .link-details", 'removeAttr', ['open']));

    // Setting the value of the CQL field.
    $response->addCommand(new InvokeCommand("$parentSelector [name=\"$cqlName\"]", 'val', [$cqlValue]));

    // Do not attempt to set advanced values if they are not enabled.
    if (!$this->getSetting('advanced')) {
      return $response;
    }

    // The onshelf is special, as it is a checkbox, and the value is sent along
    // as a string 'true'/'false'.
    $onshelfName = $formElement['filters']['onshelf']['#name'];
    $onshelfValue = (string) $this->getFilter($link, 'onshelf');
    $onshelfBoolValue = (strtolower($onshelfValue) === 'true');
    $response->addCommand(new InvokeCommand(
        "$parentSelector [name=\"$onshelfName\"]",
        'prop',
        ['checked', $onshelfBoolValue])
    );

    // The first accession date filter consists of two parts in one filter value
    // where each part corresponds to a separate form element.
    $firstAccessionDateValue = $this->getFilter($link, 'firstaccessiondateitem') ?? '';
    $firstAccessionDateFormElement = $formElement['filters']['first_accession_date'];
    // We expect formats like <2025-01-01 or >NOW - 90 DAYS.
    preg_match("/^\s*(?<operator>\W+)\s*(?<value>.*)\s*$/", $firstAccessionDateValue, $matches);

    $operatorValue = FirstAccessionDateOperator::tryFrom($matches['operator']) ?? FirstAccessionDateOperator::LaterThan;
    $operatorName = $firstAccessionDateFormElement['operator']['#name'];
    $response->addCommand(new InvokeCommand("$parentSelector [name=\"$operatorName\"]", 'val', [$operatorValue]));

    $valueValue = $matches['value'] ?? '';
    $valueName = $firstAccessionDateFormElement['value']['#name'];
    $response->addCommand(new InvokeCommand("$parentSelector [name=\"$valueName\"]", 'val', [$valueValue]));

    // Add remaining, simple filters, along with their default values.
    $filter_default_values = [
      'location' => '',
      'sublocation' => '',
      'branch' => '',
      'department' => '',
      'sort' => 'relevance',
    ];

    foreach ($filter_default_values as $filterKey => $filterDefaultValue) {
      $name = $formElement['filters'][$filterKey]['#name'];
      $value = $this->getFilter($link, $filterKey);
      $value = !empty($value) ? $value : $filterDefaultValue;

      $response->addCommand(new InvokeCommand("$parentSelector [name=\"$name\"]", 'val', [$value]));
    }

    return $response;
  }

  /**
   * We need to use extractFormValues, as we use fieldsets.
   *
   * Drupal does not understand the widget out-of-the-box, as the fields such
   * as 'cql' is not in the root of the form element array.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface $items
   *   {@inheritDoc}.
   * @param array<mixed> $form
   *   {@inheritDoc}.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   {@inheritDoc}.
   */
  public function extractFormValues(FieldItemListInterface $items, array $form, FormStateInterface $form_state): void {
    // Getting the subform values.
    $userInput = $form_state->getUserInput();
    $parents = $form['#parents'] ?? [];
    $input = NestedArray::getValue($userInput, $parents);

    foreach ($items as $delta => $item) {
      $values = $input[$this->fieldDefinition->getName()][$delta] ?? [];
      $value = [
        'value' => $values['filters']['cql'] ?? '',
        'location' => $values['filters']['location'] ?? '',
        'sublocation' => $values['filters']['sublocation'] ?? '',
        'branch' => $values['filters']['branch'] ?? '',
        'department' => $values['filters']['department'] ?? '',
        'onshelf' => !empty($values['filters']['onshelf']),
        'sort' => $values['filters']['sort'] ?? 'relevance',
        'first_accession_date_value' => $values['filters']['first_accession_date']['value'] ?? '',
        'first_accession_date_operator' => $values['filters']['first_accession_date']['operator'] ?? '',
      ];

      $items->set($delta, $value);
    }
  }

  /**
   * Finding a named key from a possible URL/URI input.
   *
   * This works, whether it's an absolute or relative URL, and regardless
   * which base site is used.
   */
  public static function getFilter(string $url, string $key): ?string {
    // Add HTTP prefix if missing to ensure parse_url works correctly.
    if (!preg_match('#^https?://#', $url)) {
      $url = 'https://' . trim($url, '/');
    }

    $parts = parse_url($url);

    if (isset($parts['query'])) {
      parse_str($parts['query'], $query);
      $result = $query[$key] ?? NULL;

      return is_string($result) ? ltrim($result) : NULL;
    }

    return NULL;
  }

}
