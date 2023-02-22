<?php

namespace Drupal\dpl_library_agency\Form;

use DanskernesDigitaleBibliotek\FBS\ApiException;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\Branch\IdBranchRepository;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\ReservationSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\array_combine as array_combine;
use function Safe\usort as usort;

/**
 * General Settings form for a library agency.
 */
class GeneralSettingsForm extends ConfigFormBase {

  /**
   * GeneralSettingsForm constructor.
   */
  public function __construct(
    ConfigFactoryInterface $configFactory,
    protected BranchRepositoryInterface $branchRepository,
    protected ReservationSettings $reservationSettings,
    protected BranchSettings $branchSettings
  ) {
    parent::__construct($configFactory);
  }

  /**
   * {@inheritdoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The Drupal service container.
   *
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('dpl_library_agency.branch.repository.cache'),
      $container->get('dpl_library_agency.reservation_settings'),
      $container->get('dpl_library_agency.branch_settings')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'dpl_library_agency_general_settings';
  }

  /**
   * Build an options array for form elements from an array of branches.
   *
   * @param \Drupal\dpl_library_agency\Branch\Branch[] $branches
   *   The branches to use.
   *
   * @return string[]
   *   The options array with keys for form values and values for labels.
   */
  public function buildBranchOptions(array $branches): array {
    return array_combine(
      array_map(function (Branch $branch) {
        return $branch->id;
      }, $branches),
      array_map(function (Branch $branch) {
        return $branch->title;
      }, $branches)
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'dpl_library_agency.general_settings',
    ];
  }

  /**
   * Translates a string to the current language or to a given language.
   *
   * @param string $string
   *   A string containing the English text to translate.
   * @param mixed[] $args
   *   Replacements to make after translation. Based on the first character of
   *   the key, the value is escaped and/or themed.
   * @param mixed[] $options
   *   An associative array of additional options.
   */
  protected function t($string, array $args = [], array $options = []): TranslatableMarkup {
    // Intentionally transfer the string originally passed to t().
    // phpcs:ignore Drupal.Semantics.FunctionT.NotLiteralString
    return parent::t($string, $args, array_merge($options, ['context' => 'Library Agency Configuration']));
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('dpl_library_agency.general_settings');

    try {
      $branches = $this->branchRepository->getBranches();
      // Sort branches by ID/ISIL number. This order should mimick the expected
      // order of the branches used elsewhere by library staff.
      usort($branches, function (Branch $a, Branch $b) {
        return strcmp($a->id, $b->id);
      });
      $branch_options = $this->buildBranchOptions($branches);
      $availability_options = $search_options = $reservation_options = $branch_options;

      $disabled = FALSE;
    }
    catch (ApiException $api_exception) {
      $this->logger('dpl_library_agency')->error('Unable to retrieve agency branches: %message', ['%message' => $api_exception->getMessage()]);
      $this->messenger()->addError('Unable to retrieve branch information from FBS.');

      // Build options from the stored configuration. This way we at least have
      // something to show in the UI.
      $availability_options = $this->buildBranchOptions((new IdBranchRepository($this->branchSettings->getExcludedAvailabilityBranches()))->getBranches());
      $reservation_options = $this->buildBranchOptions((new IdBranchRepository($this->branchSettings->getExcludedReservationBranches()))->getBranches());
      $search_options = $this->buildBranchOptions((new IdBranchRepository($this->branchSettings->getExcludedSearchBranches()))->getBranches());

      $disabled = TRUE;
    }

    $form['reservations'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservations'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['reservations']['reservation_sms_notifications_disabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable SMS notifications for reservations'),
      '#default_value' => $config->get('reservation_sms_notifications_disabled'),
      '#description' => $this->t('If checked, SMS notifications for patrons will be disabled.'),
    ];

    $form['settings']['pause_reservation_info_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Pause reservation link'),
      '#description' => $this->t('The link with infomation about reservations'),
      '#default_value' => $config->get('pause_reservation_info_url') ?? '',
    ];

    $form['settings']['pause_reservation_start_date_config'] = [
      '#type' => 'date',
      '#title' => $this->t('Start date'),
      '#description' => $this->t('Pause reservation start date'),
      '#default_value' => $config->get('pause_reservation_start_date_config'),
    ];

    $form['thresholds'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Thresholds'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['thresholds']['threshold_config'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Set thresholds'),
      '#default_value' => $config->get('threshold_config') ?? '{ "colorThresholds": { "danger": "0", "warning": "6" } }',
    ];

    $form['branches'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Excluded branches'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
      '#description' => $this->t('Select which branches should be excluded in different parts of the system.'),
    ];
    $form['branches']['search'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Search results'),
      '#options' => $search_options,
      '#default_value' => $this->branchSettings->getExcludedSearchBranches(),
      '#description' => $this->t('Holdings belonging to the selected branches will not be shown in search results.'),
      "#disabled" => $disabled,
    ];
    $form['branches']['availability'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Availability'),
      '#options' => $availability_options,
      '#default_value' => $this->branchSettings->getExcludedAvailabilityBranches(),
      '#description' => $this->t('Holdings belonging to the selected branches will not considered when showing work availability.'),
      "#disabled" => $disabled,
    ];
    $form['branches']['reservation'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Reservations'),
      '#options' => $reservation_options,
      '#default_value' => $this->branchSettings->getExcludedReservationBranches(),
      '#description' => $this->t('Selected branches will not be available as pickup locations for reservations.'),
      "#disabled" => $disabled,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $feesUrl = $form_state->getValue('pause_reservation_info_url');
    if (!filter_var($feesUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('pause_reservation_info_url', $this->t('The url "%url" is not a valid URL.', ['%url' => $feesUrl]));
    }

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_library_agency.general_settings')
      ->set('threshold_config', $form_state->getValue('threshold_config'))
      ->set('reservation_sms_notifications_disabled', $form_state->getValue('reservation_sms_notifications_disabled'))
      ->set('pause_reservation_info_url', $form_state->getValue('pause_reservation_info_url'))
      ->set('pause_reservation_start_date_config', $form_state->getValue('pause_reservation_start_date_config'))
      ->save();

    $this->branchSettings->setExcludedAvailabilityBranches(array_filter($form_state->getValue('availability')));
    $this->branchSettings->setExcludedReservationBranches(array_filter($form_state->getValue('reservation')));
    $this->branchSettings->setExcludedSearchBranches(array_filter($form_state->getValue('search')));

    parent::submitForm($form, $form_state);
  }

}
