<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Hook;

use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\field\Entity\FieldConfig;
use Drupal\node\Form\NodeForm;

/**
 * Form hooks for dpl_paragraphs module.
 */
class FormHooks {

  /**
   * Prefill hero paragraph fields with values from the node.
   *
   * Prefills hero paragraph fields with default values from the parent node
   * to assist editors by reducing manual input. This is applied to certain
   * content types ('page', 'article').
   *
   * - Sets hero title from the node title.
   * - Sets hero description from the teaser text.
   * - Sets hero date from the publication date.
   * - Sets hero image from the teaser image.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param string $form_id
   *   The form ID.
   */
  #[Hook('form_alter')]
  public function prefillHeroFromNode(array &$form, FormStateInterface $form_state, string $form_id): void {
    if (!$form_state->getFormObject() instanceof NodeForm) {
      return;
    }

    /** @var \Drupal\node\NodeInterface $node */
    $node = $form_state->getFormObject()->getEntity();

    $content_types = [
      'page',
      'article',
    ];

    if (!$node->hasField('type') || !in_array($node->bundle(), $content_types)) {
      return;
    }

    if (!isset($form['field_paragraphs']['widget'])) {
      return;
    }

    $paragraphs_widget = &$form['field_paragraphs']['widget'];

    foreach ($paragraphs_widget as &$paragraph) {
      $is_hero_paragraph = is_array($paragraph) && isset($paragraph['#paragraph_type']) && $paragraph['#paragraph_type'] === 'hero';
      if (!$is_hero_paragraph || empty($paragraph['subform'])) {
        continue;
      }

      $subform = &$paragraph['subform'];

      if (isset($subform['field_hero_title']) && empty($subform['field_hero_title']['widget'][0]['value']['#default_value'])) {
        $subform['field_hero_title']['widget'][0]['value']['#default_value'] = $form["title"]["widget"][0]["value"]["#default_value"];
      }

      // Since 'hero_description' is a WYSIWYG field and 'field_teaser_text' is
      // a simple text field, we manually set the default values instead of
      // directly copying them.
      if (isset($subform['field_hero_description']) && empty($subform['field_hero_description']['widget'][0]['#default_value'])) {
        $teaser_text = $node->get('field_teaser_text')->value;
        $subform['field_hero_description']['widget'][0]['#default_value'] = $teaser_text;
        $subform['field_hero_description']['widget'][0]['format']['#default_value'] = 'basic';
      }

      if (isset($subform['field_hero_date']) && empty($subform['field_hero_date']['widget'][0]['value']['#default_value'])) {
        $subform['field_hero_date']['widget'][0]['value']['#default_value'] = $form["field_publication_date"]["widget"][0]["value"]["#default_value"];
      }

      if (isset($subform['field_hero_image']) && empty($subform['field_hero_image']['widget']['selection'][0])) {
        $subform['field_hero_image']['widget']['selection'] = $form['field_teaser_image']['widget']['selection'];
      }
    }
  }

  /**
   * Hide the navigation title of user registration items not in navigation.
   *
   * Adjusts the visibility of field_navigation_title based on
   * the state of field_display_in_navigation.
   *
   * @param array<mixed> $element
   *   The form element to be altered.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param array<mixed> $context
   *   An associative array containing contextual information about the field.
   */
  #[Hook('field_widget_single_element_paragraphs_form_alter')]
  public function toggleNavigationTitle(array &$element, FormStateInterface $form_state, array $context): void {
    /** @var \Drupal\Core\Field\FieldItemListInterface $items */
    $items = $context['items'];

    // Retrieve the field definition from the context.
    $field_definition = $items->getFieldDefinition();

    // Check if the field definition is an instance of FieldConfig
    // and matches the specific field ID.
    if ($field_definition instanceof FieldConfig &&
      $field_definition->id() === 'paragraph.user_registration_section.field_user_registration_items') {
      $field_name = $field_definition->getName();

      $widget_state = WidgetBase::getWidgetState($element['#field_parents'], $field_name, $form_state);

      /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph_instance */
      $paragraph_instance = $widget_state['paragraphs'][$element['#delta']]['entity'];
      $paragraph_type = $paragraph_instance->bundle();

      if ($paragraph_type == 'user_registration_item') {
        $parents = $element['#field_parents'][0] . '[' . $element['#field_parents'][1] . '][' . $element['#field_parents'][2] . ']';

        // Conditionally hide the field based on the state of another field.
        $element['subform']['field_navigation_title']['#states'] = [
          'invisible' => [
            ':input[name="' . $parents . '[' . $field_name . '][' . $element['#delta'] . '][subform][field_display_in_navigation][value]"]' => ['checked' => FALSE],
          ],
        ];
      }
    }
  }

}
