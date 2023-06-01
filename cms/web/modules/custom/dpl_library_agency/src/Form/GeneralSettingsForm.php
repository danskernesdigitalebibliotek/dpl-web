<?php

namespace Drupal\dpl_library_agency\Form;

use DanskernesDigitaleBibliotek\FBS\ApiException;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
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

    $form['fee_page'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Fee page', [], ['context' => 'Library Agency Configuration']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['fee_page']['fees_page_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Fee page url', [], ['context' => 'Loan list (settings)']),
      '#description' => $this->t('The link to the relevant fee page', [], ['context' => 'Loan list (settings)']),
      '#default_value' => $config->get('fees_page_url') ?? '',
    ];

    $form['reservations'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservations', [], ['context' => 'Library Agency Configuration']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['reservations']['reservation_sms_notifications_disabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable SMS notifications for reservations', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('reservation_sms_notifications_disabled'),
      '#description' => $this->t('If checked, SMS notifications for patrons will be disabled.', [], ['context' => 'Library Agency Configuration']),
    ];

    $form['reservations']['interest_periods_config'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Interest periods for reservation', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('interest_periods_config'),
    ];

    $form['reservations']['reservation_detail_allow_remove_ready_reservations_config'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Allow removing ready reservations', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('reservation_detail_allow_remove_ready_reservations_config'),
    ];

    $form['reservations']['ereolen_my_page_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Ereolen link', [], ['context' => 'Library Agency Configuration']),
      '#description' => $this->t('My page in ereolen', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('ereolen_my_page_url'),
    ];

    $form['reservations']['pause_reservation_info_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Pause reservation link', [], ['context' => 'Library Agency Configuration']),
      '#description' => $this->t('The link with infomation about reservations', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('pause_reservation_info_url') ?? '',
    ];

    $form['reservations']['pause_reservation_start_date_config'] = [
      '#type' => 'date',
      '#title' => $this->t('Start date', [], ['context' => 'Library Agency Configuration']),
      '#description' => $this->t('Pause reservation start date', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('pause_reservation_start_date_config'),
    ];

    $form['settings']['blocked_user'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Blocked user'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['settings']['blocked_user']['redirect_on_blocked_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Redirect blocked user link'),
      '#description' => $this->t('The link to redirect the blocked user to'),
      '#default_value' => $config->get('redirect_on_blocked_url') ?? '',
    ];

    $form['settings']['blocked_user']['blocked_patron_e_link_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Blocked user link for modal'),
      '#description' => $this->t('If a user has blocked status e, this link appears in the modal'),
      '#default_value' => $config->get('blocked_patron_e_link_url') ?? '',
    ];

    $form['thresholds'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Thresholds', [], ['context' => 'Library Agency Configuration']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['thresholds']['threshold_config'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Set thresholds', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('threshold_config'),
    ];

    $form['branches'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Excluded branches', [], ['context' => 'Library Agency Configuration']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
      '#description' => $this->t('Select which branches should be excluded in different parts of the system.', [], ['context' => 'Library Agency Configuration']),
    ];

    $form['branches']['search'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Search results', [], ['context' => 'Library Agency Configuration']),
      '#options' => $search_options,
      '#default_value' => $this->branchSettings->getExcludedSearchBranches(),
      '#description' => $this->t('Holdings belonging to the selected branches will not be shown in search results.', [], ['context' => 'Library Agency Configuration']),
      "#disabled" => $disabled,
    ];

    $form['branches']['availability'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Availability'),
      '#options' => $availability_options,
      '#default_value' => $this->branchSettings->getExcludedAvailabilityBranches(),
      '#description' => $this->t('Holdings belonging to the selected branches will not considered when showing work availability.', [], ['context' => 'Library Agency Configuration']),
      "#disabled" => $disabled,
    ];

    $form['branches']['reservation'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Reservations', [], ['context' => 'Library Agency Configuration']),
      '#options' => $reservation_options,
      '#default_value' => $this->branchSettings->getExcludedReservationBranches(),
      '#description' => $this->t('Selected branches will not be available as pickup locations for reservations.', [], ['context' => 'Library Agency Configuration']),
      "#disabled" => $disabled,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_library_agency.general_settings')
      ->set('threshold_config', $form_state->getValue('threshold_config'))
      ->set('reservation_detail_allow_remove_ready_reservations_config', $form_state->getValue('reservation_detail_allow_remove_ready_reservations_config'))
      ->set('interest_periods_config', $form_state->getValue('interest_periods_config'))
      ->set('fees_page_url', $form_state->getValue('fees_page_url'))
      ->set('reservation_sms_notifications_disabled', $form_state->getValue('reservation_sms_notifications_disabled'))
      ->set('pause_reservation_info_url', $form_state->getValue('pause_reservation_info_url'))
      ->set('redirect_on_blocked_url', $form_state->getValue('redirect_on_blocked_url'))
      ->set('blocked_patron_e_link_url', $form_state->getValue('blocked_patron_e_link_url'))
      ->set('ereolen_my_page_url', $form_state->getValue('ereolen_my_page_url'))
      ->set('pause_reservation_start_date_config', $form_state->getValue('pause_reservation_start_date_config'))
      ->save();

    $this->branchSettings->setExcludedAvailabilityBranches(array_filter($form_state->getValue('availability')));
    $this->branchSettings->setExcludedReservationBranches(array_filter($form_state->getValue('reservation')));
    $this->branchSettings->setExcludedSearchBranches(array_filter($form_state->getValue('search')));

    parent::submitForm($form, $form_state);
  }

}
