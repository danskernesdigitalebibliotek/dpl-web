<?php

namespace Drupal\dpl_patron_page\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_library_agency\ReservationSettings;
use Drupal\dpl_patron_page\DplPatronPageSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides patron page.
 *
 * @Block(
 *   id = "dpl_patron_page_block",
 *   admin_label = "Patron page"
 * )
 */
class PatronPageBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * PatronPageBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_library_agency\ReservationSettings $reservationSettings
   *   Reservation settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   Branch settings.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   Branch repository.
   * @param \Drupal\dpl_react\DplReactConfigInterface $patronPageSettings
   *   Patron page settings.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected ReservationSettings $reservationSettings,
    private BranchSettings $branchSettings,
    private BranchRepositoryInterface $branchRepository,
    private DplReactConfigInterface $patronPageSettings
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_library_agency.reservation_settings'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      $container->get('dpl_patron_page.settings'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   *
   * @throws \Safe\Exceptions\JsonException
   */
  public function build() {
    $patron_page_settings = $this->patronPageSettings->loadConfig();

    $data = [
      // Configuration.
      // @todo write service for getting branches.
      'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
      'pincode-length-max-config' => $patron_page_settings->get('pincode_length_max') ?? DplPatronPageSettings::PINCODE_LENGTH_MAX,
      'pincode-length-min-config' => $patron_page_settings->get('pincode_length_min') ?? DplPatronPageSettings::PINCODE_LENGTH_MIN,
      'text-notifications-enabled-config' => (int) $this->reservationSettings->smsNotificationsIsEnabled(),

      // Urls.
      'always-available-ereolen-url' => dpl_react_apps_format_app_url($patron_page_settings->get('always_available_ereolen'), DplPatronPageSettings::ALWAYS_AVAILABLE_EREOLEN),
      'delete-patron-url' => dpl_react_apps_format_app_url($patron_page_settings->get('delete_patron_url'), DplPatronPageSettings::DELETE_PATRON_URL),
      'pause-reservation-info-url' => dpl_react_apps_format_app_url($patron_page_settings->get('pause_reservation_info_url'), GeneralSettings::PAUSE_RESERVATION_INFO_URL),

      // Texts.
      'patron-page-basic-details-address-label-text' => $this->t('Address', [], ['context' => 'Patron page']),
      'patron-page-basic-details-header-text' => $this->t('BASIC DETAILS', [], ['context' => 'Patron page']),
      'patron-page-basic-details-name-label-text' => $this->t('Name', [], ['context' => 'Patron page']),
      'patron-page-change-pickup-body-text' => $this->t('patron page change pickup body text', [], ['context' => 'Patron page']),
      'patron-page-change-pickup-header-text' => $this->t('RESERVATIONS', [], ['context' => 'Patron page']),
      'patron-page-delete-profile-link-text' => $this->t('Delete your profile', [], ['context' => 'Patron page']),
      'patron-page-delete-profile-text' => $this->t('Do you wish to delete your library profile?', [], ['context' => 'Patron page']),
      'patron-page-header-text' => $this->t('Patron profile page', [], ['context' => 'Patron page']),
      'patron-page-open-pause-reservations-section-aria-text' => $this->t('This checkbox opens a section where you can put your current reservations on a pause, when the time period picked has ended, the reservations will be resumed', [], ['context' => 'Patron page (aria)']),
      'patron-page-open-pause-reservations-section-text' => $this->t('Pause your reservations', [], ['context' => 'Patron page']),
      'patron-page-pause-reservations-body-text' => $this->t('patron page pause reservations body text', [], ['context' => 'Patron page']),
      'patron-page-pause-reservations-header-text' => $this->t('Pause physical reservations', [], ['context' => 'Patron page']),
      'patron-page-save-button-text' => $this->t('Save', [], ['context' => 'Patron page']),
      'patron-page-status-section-body-text' => $this->t('There is a number of materials without limitation to amounts of loans per month.', [], ['context' => 'Patron page']),
      'patron-page-status-section-header-text' => $this->t('DIGITAL LOANS (EREOLEN)', [], ['context' => 'Patron page']),
      'patron-page-status-section-link-text' => $this->t('Click here, to see titles always eligible to be loaned', [], ['context' => 'Patron page']),
      'patron-page-status-section-loan-header-text' => $this->t('Loans per month', [], ['context' => 'Patron page']),
      'patron-page-status-section-loans-audio-books-text' => $this->t('Audiobooks', [], ['context' => 'Patron page']),
      'patron-page-status-section-loans-ebooks-text' => $this->t('E-books', [], ['context' => 'Patron page']),
      'patron-page-status-section-out-of-aria-label-audio-books-text' => $this->t('You used @this audiobooks out of you quota of @that audiobooks', [], ['context' => 'Patron page (aria)']),
      'patron-page-status-section-out-of-aria-label-ebooks-text' => $this->t('You used @this ebooks out of you quota of @that ebooks', [], ['context' => 'Patron page (aria)']),
      'patron-page-status-section-out-of-text' => $this->t('@this out of @that', [], ['context' => 'Patron page']),
      'patron-page-status-section-reservations-text' => $this->t('You can reserve @countEbooks ebooks and @countAudiobooks audiobooks', [], ['context' => 'Patron page']),
      'patron-page-fee-text' => $this->t('patron page text fee text', [], ['context' => 'Patron page']),
      'patron-pin-saved-success-text' => $this->t('Your pincode was saved', [], ['context' => 'Patron page']),
      'patron-page-handle-response-information-text' => $this->t('Your changes are saved.', [], ['context' => 'Patron page']),
      'patron-page-loading-text' => $this->t('Loading...', [], ['context' => 'Patron page']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'patron-page',
      '#data' => $data,
    ];
  }

}
