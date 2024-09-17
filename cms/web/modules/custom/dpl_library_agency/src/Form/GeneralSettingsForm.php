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
use Drupal\dpl_library_agency\FbiProfileType;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_library_agency\ReservationSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\array_combine as array_combine;
use function Safe\preg_match as preg_match;
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
    protected BranchSettings $branchSettings,
    protected GeneralSettings $generalSettings,
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
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.general_settings')
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
      // Sort branches by ID/ISIL number. This order should mimic the expected
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
      '#title' => $this->t('Reservations', [], ['context' => 'Library Agency Configuration']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['reservations']['reservation_sms_notifications_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable SMS notifications for reservations', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('reservation_sms_notifications_enabled') ?? GeneralSettings::RESERVATION_SMS_NOTIFICATIONS_ENABLED,
      '#description' => $this->t('If checked, SMS notifications for patrons are enabled.', [], ['context' => 'Library Agency Configuration']),
    ];

    $form['reservations']['interest_periods_config'] = [
      '#type' => 'textarea',
      '#required' => TRUE,
      '#title' => $this->t('Interest periods for reservation', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('interest_periods_config') ?? GeneralSettings::INTEREST_PERIODS_CONFIG,
      '#description' => $this->t('Set the interest periods. The format should be [days]-[label]. New periods will first be available in "Default interest period for reservation" when the form has been saved.', [], ['context' => 'Library Agency Configuration']),
    ];

    $form['reservations']['default_interest_period_config'] = [
      '#type' => 'select',
      '#title' => $this->t('Default interest period for reservation', [], ['context' => 'Library Agency Configuration']),
      '#options' => $this->generalSettings->getInterestPeriods(),
      '#default_value' => $config->get('default_interest_period_config') ?? GeneralSettings::DEFAULT_INTEREST_PERIOD_CONFIG,
      '#description' => $this->t('Set the default interest period for reservations.', [], ['context' => 'Library Agency Configuration']),
    ];

    $form['reservations']['reservation_detail_allow_remove_ready_reservations'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Allow removing ready reservations', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('reservation_detail_allow_remove_ready_reservations') ?? GeneralSettings::RESERVATION_DETAIL_ALLOW_REMOVE_READY_RESERVATIONS,
    ];

    $form['reservations']['ereolen_my_page_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Ereolen my page link', [], ['context' => 'Library Agency Configuration']),
      '#description' => $this->t('My page in ereolen', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('ereolen_my_page_url') ?? GeneralSettings::EREOLEN_MY_PAGE_URL,
    ];

    $form['reservations']['ereolen_homepage_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Ereolen home link', [], ['context' => 'Library Agency Configuration']),
      '#description' => $this->t('Home page in ereolen', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $config->get('ereolen_homepage_url') ?? GeneralSettings::EREOLEN_HOMEPAGE_URL,
    ];

    $form['reservations']['pause_reservation_info_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Pause reservation link', [], ['context' => 'Library Agency Configuration']),
      '#description' => $this->t('The link with information about reservations. <br />
                                         You can add a relative url (e.g. /takster). <br />
                                         You can search for an internal url. <br />
                                         You can add an external url (starting with "http://" or "https://").', [], ['context' => 'Library Agency Configuration']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('pause_reservation_info_url') ?? GeneralSettings::PAUSE_RESERVATION_INFO_URL,
    ];

    $form['opening_hours_url'] = [
      '#type' => 'linkit',
      '#title' => $this->t('Opening Hours Link (remove link to enable sidebar)', [], ['context' => 'Library Agency Configuration']),
      '#description' => $this->t('The link with information about opening hours. <br />
                                         If no link is added, the opening hours sidebar modal is enabled. <br />
                                         You can add a relative url (e.g. /takster). <br />
                                         You can search for an internal url. <br />
                                         You can add an external url (starting with "http://" or "https://").', [], ['context' => 'Library Agency Configuration']),
      '#autocomplete_route_name' => 'linkit.autocomplete',
      '#autocomplete_route_parameters' => [
        'linkit_profile_id' => 'default',
      ],
      '#default_value' => $config->get('opening_hours_url') ?? GeneralSettings::OPENING_HOURS_URL,
    ];

    $form['expiration_warning'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Expiration warning', [], ['context' => 'Library Agency Configuration']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['expiration_warning']['expiration_warning_days_before_config'] = [
      '#type' => 'number',
      '#title' => $this->t('Set expiration warning', [], ['context' => 'Library Agency Configuration']),
      '#min' => 1,
      '#default_value' => $config->get('expiration_warning_days_before_config') ?? GeneralSettings::EXPIRATION_WARNING_DAYS_BEFORE_CONFIG,
      '#description' => $this->t('Insert the number of days before the expiration of the material, when the reminder "Expires soon" should appear.', [], ['context' => 'Library Agency Configuration']),
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

    $form['fbi_profiles'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('FBI profiles', [], ['context' => 'Library Agency Configuration']),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
      '#description' => $this->t('Administer which profile should be used in various contexts.', [], ['context' => 'Library Agency Configuration']),
    ];

    $fbi_profile_pattern = '[a-zA-Z_-]+';

    $form['fbi_profiles']['fbi_profile_default'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Default profile', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $this->generalSettings->getFbiProfile(FbiProfileType::DEFAULT),
      '#description' => $this->t('The default profile to use when using the FBI API.', [], ['context' => 'Library Agency Configuration']),
      '#pattern' => $fbi_profile_pattern,
      '#required' => TRUE,
    ];

    $form['fbi_profiles']['fbi_profile_local'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Search profile', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $this->generalSettings->getFbiProfile(FbiProfileType::LOCAL),
      '#description' => $this->t('The profile to use when searching for materials.', [], ['context' => 'Library Agency Configuration']),
      '#pattern' => $fbi_profile_pattern,
      '#required' => TRUE,
    ];

    $form['fbi_profiles']['fbi_profile_global'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Material profile', [], ['context' => 'Library Agency Configuration']),
      '#default_value' => $this->generalSettings->getFbiProfile(FbiProfileType::GLOBAL),
      '#description' => $this->t('The profile to use when requesting data about a material.', [], ['context' => 'Library Agency Configuration']),
      '#pattern' => $fbi_profile_pattern,
      '#required' => TRUE,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * Validates interest_periods_config and default_interest_period_config.
   *
   * The interest_periods_config is validated for the format [days]-[label].
   *
   * The validation for default_interest_period_config is checking
   * that the selected default value is present in interest_periods_config.
   *
   * {@inheritdoc}
   *
   * @throws \Safe\Exceptions\PcreException
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $default_interest_period = $form_state->getValue('default_interest_period_config');
    $interest_periods = explode(PHP_EOL, $form_state->getValue('interest_periods_config'));

    foreach ($interest_periods as $period) {
      if (!preg_match('/^\d+-[\wÆØÅæøå ]+$/m', trim($period))) {
        $form_state->setErrorByName('interest_periods_config',
          $this->t('The interest period @error, does not match the format [days]-[label].', ['@error' => $period], ['context' => 'Library Agency Configuration']));

        continue;
      }

      $interest_periods += GeneralSettings::splitInterestPeriodString($period);
    }

    if (!array_key_exists($default_interest_period, $interest_periods)) {
      $form_state->setErrorByName('default_interest_period_config',
        $this->t('The default interest period should be set to a value in "Interest periods for reservation" field.', [], ['context' => 'Library Agency Configuration']));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_library_agency.general_settings')
      ->set('expiration_warning_days_before_config', $form_state->getValue('expiration_warning_days_before_config'))
      ->set('reservation_detail_allow_remove_ready_reservations', $form_state->getValue('reservation_detail_allow_remove_ready_reservations'))
      ->set('interest_periods_config', $form_state->getValue('interest_periods_config'))
      ->set('default_interest_period_config', $form_state->getValue('default_interest_period_config'))
      ->set('reservation_sms_notifications_enabled', $form_state->getValue('reservation_sms_notifications_enabled'))
      ->set('pause_reservation_info_url', $form_state->getValue('pause_reservation_info_url'))
      ->set('ereolen_my_page_url', $form_state->getValue('ereolen_my_page_url'))
      ->set('ereolen_homepage_url', $form_state->getValue('ereolen_homepage_url'))
      ->set('opening_hours_url', $form_state->getValue('opening_hours_url'))
      ->set('fbi_profiles', [
        'default' => $form_state->getValue('fbi_profile_default'),
        'local' => $form_state->getValue('fbi_profile_local'),
        'global' => $form_state->getValue('fbi_profile_global'),
      ])
      ->save();

    $this->branchSettings->setExcludedAvailabilityBranches(array_filter($form_state->getValue('availability')));
    $this->branchSettings->setExcludedReservationBranches(array_filter($form_state->getValue('reservation')));
    $this->branchSettings->setExcludedSearchBranches(array_filter($form_state->getValue('search')));

    parent::submitForm($form, $form_state);
  }

}
