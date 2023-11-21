<?php

namespace Drupal\dpl_react_apps\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\dpl_fbs\Form\FbsSettingsForm;
use Drupal\dpl_instant_loan\DplInstantLoanSettings;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;
use Drupal\dpl_library_agency\ReservationSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\json_encode as json_encode;
use function Safe\sprintf;

/**
 * Controller for rendering full page DPL React apps.
 */
class DplReactAppsController extends ControllerBase {

  /**
   * DdplReactAppsController constructor.
   */
  public function __construct(
    protected RendererInterface $renderer,
    protected ReservationSettings $reservationSettings,
    protected BranchSettings $branchSettings,
    protected BranchRepositoryInterface $branchRepository,
    protected DplInstantLoanSettings $instantLoanSettings,
  ) {}

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
      $container->get('renderer'),
      $container->get('dpl_library_agency.reservation_settings'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      $container->get('dpl_instant_loan.settings'),
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
   *
   * @todo This should be moved into an service to make it more sharable
   *       between modules.
   *
   * @throws \Safe\Exceptions\JsonException
   */
  public static function buildBranchesJsonProp(array $branches) : string {
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
   *
   * @todo This should be moved into an service to make it more sharable
   *       between modules.
   */
  public static function buildBranchesListProp(array $branchIds) : string {
    return implode(',', $branchIds);
  }

  /**
   * Render search result app.
   *
   * @return mixed[]
   *   Render array.
   */
  public function search(): array {
    $data = [
      // Config.
      'blacklisted-availability-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'blacklisted-search-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedSearchBranches()),
      'branches-config' => $this->buildBranchesJsonProp($this->branchRepository->getBranches()),
      // Add external API base urls.
    ] + self::externalApiBaseUrls();

    $app = [
      '#theme' => 'dpl_react_app',
      "#name" => 'search-result',
      '#data' => $data,
    ];

    $this->renderer->addCacheableDependency($app, $this->branchSettings);

    return $app;
  }

  /**
   * Render advanced search app.
   *
   * @return mixed[]
   *   Render array.
   */
  public function advancedSearch(): array {
    $data = [
      // Config.
      'blacklisted-availability-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'blacklisted-search-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedSearchBranches()),
      'branches-config' => $this->buildBranchesJsonProp($this->branchRepository->getBranches()),
    // Add external API base urls.
    ] + self::externalApiBaseUrls();

    $app = [
      '#theme' => 'dpl_react_app',
      "#name" => 'advanced-search',
      '#data' => $data,
    ];

    $this->renderer->addCacheableDependency($app, $this->branchSettings);

    return $app;
  }

  /**
   * Get a string with interest periods.
   *
   * @return string
   *   A string with interest periods
   */
  public static function getInterestPeriods(): string {
    // @todo the general setting should be converted into an settings object and
    // injected into the places it is needed and then remove thies static
    // functions.
    return \Drupal::configFactory()->get('dpl_library_agency.general_settings')->get('interest_periods_config') ?? GeneralSettingsForm::INTEREST_PERIODS_CONFIG;
  }

  /**
   * Render work page.
   *
   * @param string $wid
   *   A work id.
   *
   * @return mixed[]
   *   Render array.
   */
  public function work(string $wid): array {
    $data = [
      'wid' => $wid,
      // Config.
      // Data attributes can only be strings
      // so we need to convert the boolean to a number (0/1).
      'blacklisted-availability-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'blacklisted-pickup-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      // @todo Remove when instant loans branches are used.
      'blacklisted-instant-loan-branches-config' => "",
      'branches-config' => $this->buildBranchesJsonProp($this->branchRepository->getBranches()),
      'sms-notifications-for-reservations-enabled-config' => (int) $this->reservationSettings->smsNotificationsIsEnabled() ?? ReservationSettings::RESERVATION_SMS_NOTIFICATIONS_ENABLED,
      'instant-loan-config' => $this->instantLoanSettings->getConfig(),
      "interest-periods-config" => $this->getInterestPeriods(),
      // Add external API base urls.
    ] + self::externalApiBaseUrls();

    $app = [
      '#theme' => 'dpl_react_app',
      "#name" => 'material',
      '#data' => $data,
    ];

    $this->renderer->addCacheableDependency($app, $this->reservationSettings);
    $this->renderer->addCacheableDependency($app, $this->branchSettings);
    $this->renderer->addCacheableDependency($app, $this->instantLoanSettings);

    return $app;
  }

  /**
   * Get the base url of the API's exposed by this site.
   *
   * @return mixed[]
   *   An array of base urls.
   */
  public static function externalApiBaseUrls(): array {
    $react_apps_settings = \Drupal::configFactory()->get('dpl_react_apps.settings');
    $fbs_settings = \Drupal::config(FbsSettingsForm::CONFIG_KEY);

    /** @var \Drupal\dpl_publizon\DplPublizonSettings $publizon_settings*/
    $publizon_settings = \Drupal::service('dpl_publizon.settings');

    // Get base urls from this module.
    $services = $react_apps_settings->get('services') ?? [];

    // Get base urls from other modules.
    $services['fbs'] = ['base_url' => $fbs_settings->get('base_url')];
    $services['publizon'] = ['base_url' => $publizon_settings->loadConfig()->get('base_url')];

    $urls = [];
    foreach ($services as $api => $definition) {
      $urls[sprintf('%s-base-url', $api)] = $definition['base_url'];
    }

    return $urls;
  }

  /**
   * Get the strings and config for blocked user.
   *
   * @return mixed[]
   *   An array of strings and config.
   */
  public static function getBlockedSettings(): array {
    $blockedSettings = \Drupal::configFactory()->get('dpl_library_agency.general_settings');
    $blockedData = [
      'redirect-on-blocked-url' => dpl_react_apps_format_app_url($blockedSettings->get('redirect_on_blocked_url'), GeneralSettingsForm::REDIRECT_ON_BLOCKED_URL),
      'blocked-patron-e-link-url' => dpl_react_apps_format_app_url($blockedSettings->get('blocked_patron_e_link_url'), GeneralSettingsForm::BLOCKED_PATRON_E_LINK_URL),
    ];

    return $blockedData;
  }

}
