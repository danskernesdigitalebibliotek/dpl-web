<?php

declare(strict_types=1);

namespace Drupal\dpl_biblio\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\RedundantEditableConfigNamesTrait;

/**
 * Biblio adapter setting form.
 */
class BiblioSettingsForm extends ConfigFormBase {

  use RedundantEditableConfigNamesTrait;

  const CONFIG_NAME = 'dpl_biblio.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_biblio_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Dpl Biblio']),
      '#tree' => FALSE,
    ];

    $form['settings']['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use the Biblio adapter for digital materials', [], ['context' => 'Dpl Biblio']),
      '#description' => $this->t('When enabled the web apps will use the Biblio adapter instead of Publizon. Leave disabled to keep using Publizon.', [], ['context' => 'Dpl Biblio']),
      '#config_target' => self::CONFIG_NAME . ':enabled',
    ];

    // TEMPORARY - remove once Biblio has taken over the reservation queue.
    $form['settings']['publizon_reservations_closed_react'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Close Publizon reservations on the website', [], ['context' => 'Dpl Biblio']),
      '#description' => $this->t('Temporary. While Biblio migrates the reservation queue away from Publizon it has to stand still: with this enabled patrons can neither reserve a digital material through Publizon nor cancel a reservation they already have, and the website tells them why. Loans are unaffected. This covers the website only - GO freezes in its own period and has its own setting.', [], ['context' => 'Dpl Biblio']),
      '#config_target' => self::CONFIG_NAME . ':publizon_reservations_closed_react',
    ];

    // TEMPORARY - remove when the catalogue and the adapter agree on which
    // materials exist.
    $form['settings']['tolerate_unknown_materials'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show materials the adapter does not know as unavailable', [], ['context' => 'Dpl Biblio']),
      '#description' => $this->t('Temporary. The catalogue lists digital materials that are not yet provisioned in WeDoBooks, and the adapter answers "Material not found" for those. With this enabled such a material is shown as unavailable; without it the material page fails. Publizon is never asked either way.', [], ['context' => 'Dpl Biblio']),
      '#config_target' => self::CONFIG_NAME . ':tolerate_unknown_materials',
    ];

    return parent::buildForm($form, $form_state);
  }

}
