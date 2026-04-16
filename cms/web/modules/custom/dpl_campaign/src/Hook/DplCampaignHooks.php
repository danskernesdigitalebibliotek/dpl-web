<?php

declare(strict_types=1);

namespace Drupal\dpl_campaign\Hook;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_campaign\CampaignWeight;

/**
 * Drupal hooks for the module. Modern alternative to .module file.
 */
class DplCampaignHooks {

  public function __construct(protected ModuleHandlerInterface $moduleHandler) {}

  /**
   * Alter campaign_weight field, only showing allowed options.
   *
   * National weights should only be available on the national site, and
   * vice-versa for the local weights.
   *
   * @param array<mixed> $element
   *   The actual form element.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param array<mixed> $context
   *   The context for the form.
   */
  #[Hook('field_widget_single_element_form_alter')]
  public function weightSelectAlter(array &$element, FormStateInterface $form_state, array $context): void {
    // If the bnf_server module is enabled, we must be on the national BNF site.
    $site_is_national = $this->moduleHandler->moduleExists('bnf_server');

    $field_name = $context['items']->getFieldDefinition()->getName();

    if ($field_name !== 'field_campaign_weight') {
      return;
    }

    $bnf_enums = CampaignWeight::getBnfEnums();
    $bnf_options = [];
    $all_options = $element['#options'];

    foreach ($bnf_enums as $bnf_enum) {
      $key = $bnf_enum->value;
      $option = $all_options[$key] ?? NULL;

      if ($option) {
        $bnf_options[$key] = $option;
      }
    }

    if ($site_is_national) {
      $element['#options'] = $bnf_options;
    }
    else {
      $element['#options'] = array_diff($all_options, $bnf_options);
    }

    // Make sure that the default option is available.
    // This can be a case if it's a BNF-imported article that is then edited
    // on the local site.
    $default_option_key = $element['#default_value'][0] ?? NULL;
    $default_option_value = $all_options[$default_option_key] ?? NULL;

    $element['#options'][$default_option_key] = $default_option_value;
  }

}
