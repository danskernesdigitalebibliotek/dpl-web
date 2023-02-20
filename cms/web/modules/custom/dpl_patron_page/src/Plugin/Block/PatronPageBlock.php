<?php

namespace Drupal\dpl_patron_page\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\Branch\Branch;


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
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

  /**
   * PatronPageBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory, protected BranchSettings $branchSettings, protected BranchRepositoryInterface $branchRepository) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
    $this->configFactory = $configFactory;
    $this->branchSettings = $branchSettings;
    $this->branchRepository = $branchRepository;

  }


  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
    );
  }


  /**
   * Build a string of JSON data containing information about branches.
   *
   * Uses the format:
   *
   * [{
   *    "branchId":"DK-775120",
   *    "title":"Højbjerg"
   * }, {
   *    "branchId":"DK-775122",
   *    "title":"Beder-Malling"
   * }]
   *
   * This is to be used as props/attributes for React apps.
   *
   * @param \Drupal\dpl_library_agency\Branch\Branch[] $branches
   *   The branches to build the string with.
   */
  protected function buildBranchesJsonProp(array $branches) : string {
    return json_encode(array_map(function (Branch $branch) {
      return [
        'branchId' => $branch->id,
        'title' => $branch->title,
      ];
    }, $branches));
  }

  /**
   * Builds a comma separated list of branch ids.
   *
   * This is to be used as props/attributes for React apps.
   *
   * @param string[] $branchIds
   *   The ids of the branches to use.
   */
  protected function buildBranchesListProp(array $branchIds) : string {
    return implode(',', $branchIds);
  }


  /**
   * Checks whether the library has enable text messages.
   *
   * @return string
   *  true on enabled, false on disabled
   */
  public function textNotificationsEnabled(): string {
    $patron_page_settings = $this->configFactory->get('patron_page.settings');
    return empty($patron_page_settings->get('text_notifications_enabled')) ? 'false' : 'true';
  }



  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $context = ['context' => 'Patron page list'];
    $contextAria = ['context' => 'Patron page list (Aria)'];

    $fbsConfig = $this->configFactory->get('dpl_fbs.settings');
    $publizonConfig = $this->configFactory->get('dpl_publizon.settings');
    $patron_page_settings = $this->configFactory->get('patron_page.settings');
    $general_config =  $this->configFactory->get('dpl_library_agency.general_settings');
    
    $dateConfig = $general_config->get('pause_reservation_start_date_config');
    if (is_null($dateConfig)) {
      $dateConfig = "";
    }

    $data = [
      'text-notifications-enabled-config' => $this->textNotificationsEnabled(),
      'blacklisted-pickup-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => $this->buildBranchesJsonProp($this->branchRepository->getBranches()),
      'pincode-length-min-config' => $patron_page_settings->get('pincode_length_min'),
      'pincode-length-max-config' => $patron_page_settings->get('pincode_length_max'),
      'pause-reservation-info-url' => $general_config->get('pause_reservation_info_url'),
      'pause-reservation-start-date-config' => $dateConfig,
      'pause-reservation-modal-aria-description-text' => $this->t('This modal makes it possible to pause your physical reservations', [], $context),
      'pause-reservation-modal-header-text' => $this->t('Pause reservations on physical items', [], $context),
      'pause-reservation-modal-body-text' => $this->t('Pause your reservations early, since reservations that are already being processed, will not be paused.', [], $context),
      'pause-reservation-modal-close-modal-text' => $this->t('Close pause reservations modal', [], $context),
      'date-inputs-start-date-label-text' => $this->t('Start date', [], $context),
      'date-inputs-end-date-label-text' => $this->t('End date', [], $context),
      'pause-reservation-modal-below-inputs-text-text' => $this->t('Pause reservation below inputs text', [], $context),
      'pause-reservation-modal-link-text' => $this->t('Read more', [], $context),
      'pause-reservation-modal-save-button-label-text' => $this->t('Save', [], $context),
      'delete-patron-url' => $patron_page_settings->get('delete_patron_url'),
      'always-available-ereolen-url' => $patron_page_settings->get('always_available_ereolen'),
      'patron-page-header-text' => $this->t('Patron profile page'),
      'patron-page-basic-details-header-text' => $this->t('BASIC DETAILS'),
      'patron-page-basic-details-name-label-text' => $this->t('Name'),
      'patron-page-text-fee-text' => $this->t('patron page text fee text'),
      'patron-page-basic-details-address-label-text' => $this->t('Address'),
      'patron-page-contact-info-header-text' => $this->t('CONTACT INFORMATION'),
      'patron-page-contact-info-body-text' => $this->t('patron page contact info body text'),
      'patron-page-contact-phone-label-text' => $this->t('Phone number'),
      'patron-page-contact-phone-checkbox-text' => $this->t('Receive text messages about your loans, reservations, and so forth'),
      'patron-page-contact-email-label-text' => $this->t('E-mail'),
      'patron-page-contact-email-checkbox-text' => $this->t('Receive emails about your loans, reservations, and so forth'),
      'patron-page-status-section-header-text' => $this->t('DIGITAL LOANS (EREOLEN)'),
      'patron-page-status-section-body-text' => $this->t('There is a number of materials without limitation to amounts of loans per month.'),
      'patron-page-status-section-link-text' => $this->t('Click here, to see titles always eligible to be loaned'),
      'patron-page-status-section-loan-header-text' => $this->t('Loans per month'),
      'patron-page-status-section-loans-ebooks-text' => $this->t('E-books'),
      'patron-page-status-section-loans-audio-books-text' => $this->t('Audiobooks'),
      'patron-page-change-pickup-header-text' => $this->t('RESERVATIONS'),
      'patron-page-change-pickup-body-text' => $this->t('patron page change pickup body text'),
      'pickup-branches-dropdown-label-text' => $this->t('Choose pickup branch'),
      'pickup-branches-dropdown-nothing-selected-text' => $this->t('Nothing selected'),
      'patron-page-pause-reservations-header-text' => $this->t('Pause physical reservations'),
      'patron-page-pause-reservations-body-text' => $this->t('patron page pause reservations body text'),
      'patron-page-open-pause-reservations-section-text' => $this->t('Pause your reservations'),
      'patron-page-open-pause-reservations-section-aria-text' => $this->t('This checkbox opens a section where you can put your current reservations on a pause, when the time period picked has ended, the reservations will be resumed'),
      'date-inputs-start-date-label-text' => $this->t('From'),
      'date-inputs-end-date-label-text' => $this->t('To'),
      'patron-page-change-pincode-header-text' => $this->t('PINCODE'),
      'patron-page-change-pincode-body-text' => $this->t('Change current pin by entering a new pin and saving'),
      'patron-page-pincode-label-text' => $this->t('New pin'),
      'patron-page-confirm-pincode-label-text' => $this->t('Confirm new pin'),
      'patron-pin-saved-success-text' => $this->t('Your pincode was saved'),
      'patron-page-pincode-too-short-validation-text' => $this->t('The pincode should be minimum @pincodeLengthMin and maximum @pincodeLengthMax characters long'),
      'patron-page-pincodes-not-the-same-text' => $this->t('The pincodes are not the same'),
      'patron-page-save-button-text' => $this->t('Save'),
      'patron-page-delete-profile-text' => $this->t('Do you wish to delete your library profile?'),
      'patron-page-delete-profile-link-text' => $this->t('Delete your profile'),
      'patron-page-status-section-reservations-text' => $this->t('You can reserve @countEbooks ebooks and @countAudiobooks audiobooks'),
      'patron-page-status-section-out-of-text' => $this->t('@this out of @that'),
      'patron-page-status-section-out-of-aria-label-audio-books-text' => $this->t('You used @this audiobooks out of you quota of @that audiobooks'),
      'patron-page-status-section-out-of-aria-label-ebooks-text' => $this->t('You used @this ebooks out of you quota of @that ebooks'),
    ] + DplReactAppsController::externalApiBaseUrls();

    $app = [
      '#theme' => 'dpl_react_app',
      "#name" => 'patron-page',
      '#data' => $data,
    ];

    return $app;
  }

}