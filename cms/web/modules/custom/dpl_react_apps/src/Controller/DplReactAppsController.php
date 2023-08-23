<?php

namespace Drupal\dpl_react_apps\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Url;
use Drupal\dpl_instant_loan\DplInstantLoanSettings;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
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
      // Urls.
      'auth-url' => self::authUrl(),
      'dpl-cms-base-url' => self::dplCmsBaseUrl(),
      'material-url' => self::materialUrl(),
      'search-url' => self::searchResultUrl(),
      // Text.
      'add-more-filters-text' => $this->t('+ more filters', [], ['context' => 'Search Result']),
      'available-text' => $this->t('Available', [], ['context' => 'Search Result']),
      'by-author-text' => $this->t('By', [], ['context' => 'Search Result']),
      'clear-all-text' => $this->t('Clear all', [], ['context' => 'Search Result']),
      'et-al-text' => $this->t('et. al.', [], ['context' => 'Search Result']),
      'facet-access-types-text' => $this->t('Access types', [], ['context' => 'Search Result']),
      'facet-browser-modal-close-modal-aria-label-text' => $this->t('Close facet browser modal', [], ['context' => 'Search Result']),
      'facet-browser-modal-screen-reader-modal-description-text' => $this->t('Modal for facet browser', [], ['context' => 'Search Result']),
      'facet-children-or-adults-text' => $this->t('Children or adults', [], ['context' => 'Search Result']),
      'facet-creators-text' => $this->t('Creators', [], ['context' => 'Search Result']),
      'facet-fiction-nonfiction-text' => $this->t('Fiction or non-fiction', [], ['context' => 'Search Result']),
      'facet-fictional-characters-text' => $this->t('Fictional characters', [], ['context' => 'Search Result']),
      'facet-genre-and-form-text' => $this->t('Genre and form', [], ['context' => 'Search Result']),
      'facet-main-languages-text' => $this->t('Main languages', [], ['context' => 'Search Result']),
      'facet-material-types-text' => $this->t('Material types', [], ['context' => 'Search Result']),
      'facet-subjects-text' => $this->t('Subjects', [], ['context' => 'Search Result']),
      'facet-work-types-text' => $this->t('Work types', [], ['context' => 'Search Result']),
      'filter-list-text' => $this->t('Filter list', [], ['context' => 'Search Result']),
      'in-series-text' => $this->t('In series', [], ['context' => 'Search Result']),
      'no-search-result-text' => $this->t('Your search has 0 results', [], ['context' => 'Search Result']),
      'number-description-text' => $this->t('Nr.', [], ['context' => 'Search Result']),
      'out-of-text' => $this->t('out of', [], ['context' => 'Search Result']),
      'result-pager-status-text' => $this->t('Showing @itemsShown out of @hitcount results', [], ['context' => 'Search Result']),
      'results-text' => $this->t('results', [], ['context' => 'Search Result']),
      'show-more-text' => $this->t('Show more', [], ['context' => 'Search Result']),
      'show-results-text' => $this->t('Show results', [], ['context' => 'Search Result']),
      'showing-results-for-text' => $this->t('Showing results for "@query"', [], ['context' => 'Search Result']),
      'showing-text' => $this->t('Showing', [], ['context' => 'Search Result']),
      'subject-number-text' => $this->t('Subject number', [], ['context' => 'Search Result']),
      'unavailable-text' => $this->t('Unavailable', [], ['context' => 'Search Result']),
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
   * Get a string with interest periods.
   *
   * @return string
   *   A string with interest periods
   */
  public static function getInterestPeriods(): string {
    // @todo the general setting should be converted into an settings object and
    // injected into the places it is needed and then remove thies static
    // functions.
    return \Drupal::configFactory()->get('dpl_library_agency.general_settings')->get('interest_periods_config');
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
      'sms-notifications-for-reservations-enabled-config' => (int) $this->reservationSettings->smsNotificationsIsEnabled(),
      'instant-loan-config' => $this->instantLoanSettings->getConfig(),
      "interest-periods-config" => $this->getInterestPeriods(),
      // Urls.
      'auth-url' => self::authUrl(),
      'dpl-cms-base-url' => self::dplCmsBaseUrl(),
      'material-url' => self::materialUrl(),
      'search-url' => self::searchResultUrl(),
      // Text.
      'already-reserved-text' => $this->t('Already reserved', [], ['context' => 'Work Page']),
      'approve-reservation-text' => $this->t('Approve reservation', [], ['context' => 'Work Page']),
      'audience-text' => $this->t('Audience', [], ['context' => 'Work Page']),
      'available-text' => $this->t('Available', [], ['context' => 'Work Page']),
      'cannot-see-review-text' => $this->t('The review is not accessible', [], ['context' => 'Work Page']),
      'cant-reserve-text' => $this->t("Can't be reserved", [], ['context' => 'Work Page']),
      'cant-view-review-text' => $this->t('Cannot view review', [], ['context' => 'Work Page']),
      'cant-view-text' => $this->t('Can\'t be viewed', [], ['context' => 'Work Page']),
      'change-email-text' => $this->t('Change email', [], ['context' => 'Work Page']),
      'change-pickup-location-text' => $this->t('Change pickup location', [], ['context' => 'Work Page']),
      'change-sms-number-text' => $this->t('Change SMS number', [], ['context' => 'Work Page']),
      'changeInterestPeriodText' => $this->t('Change interest period', [], ['context' => 'Work Page']),
      'choose-one-text' => $this->t('Choose one', [], ['context' => 'Work Page']),
      'close-text' => $this->t('Close', [], ['context' => 'Work Page']),
      'contributors-text' => $this->t('Contributors', [], ['context' => 'Work Page']),
      'copies-there-is-text' => $this->t('copies there is', [], ['context' => 'Work Page']),
      'creators-are-missing-text' => $this->t('Creators are missing', [], ['context' => 'Work Page']),
      'days-text' => $this->t('Days', [], ['context' => 'Work Page']),
      'description-headline-text' => $this->t('Description', [], ['context' => 'Work Page']),
      'details-list-audience-text' => $this->t('Audience', [], ['context' => 'Work Page']),
      'details-list-authors-text' => $this->t('Authors', [], ['context' => 'Work Page']),
      'details-list-contributors-text' => $this->t('Contributors', [], ['context' => 'Work Page']),
      'details-list-edition-text' => $this->t('Edition', [], ['context' => 'Work Page']),
      'details-list-first-edition-year-text' => $this->t('Edition year', [], ['context' => 'Work Page']),
      'details-list-first-edition-year-unknown-text' => $this->t('Unknown', [], ['context' => 'Work Page']),
      'details-list-genre-and-form-text' => $this->t('Genre and form', [], ['context' => 'Work Page']),
      'details-list-isbn-text' => $this->t('Isbn', [], ['context' => 'Work Page']),
      'details-list-language-text' => $this->t('Language', [], ['context' => 'Work Page']),
      'details-list-original-title-text' => $this->t('Original title', [], ['context' => 'Work Page']),
      'details-list-play-time-text' => $this->t('Play time', [], ['context' => 'Work Page']),
      'details-list-publisher-text' => $this->t('Publisher', [], ['context' => 'Work Page']),
      'details-list-scope-text' => $this->t('Scope', [], ['context' => 'Work Page']),
      'details-list-type-text' => $this->t('Type', [], ['context' => 'Work Page']),
      'details-of-the-material-text' => $this->t('Details of the material', [], ['context' => 'Work Page']),
      'details-text' => $this->t('Details', [], ['context' => 'Work Page']),
      'edition-text' => $this->t('Edition', [], ['context' => 'Work Page']),
      'editions-text' => $this->t('Editions', [], ['context' => 'Work Page']),
      'et-al-text' => $this->t('et al.', [], ['context' => 'Work Page']),
      'fiction-nonfiction-text' => $this->t('Fiction/nonfiction', [], ['context' => 'Work Page']),
      'film-adaptations-text' => $this->t('Film adaptations', [], ['context' => 'Work Page']),
      'find-on-bookshelf-text' => $this->t('Find on bookshelf', [], ['context' => 'Work Page']),
      'find-on-shelf-expand-button-explanation-text' => $this->t('Find on shelf expand button explanation', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-close-modal-aria-label-text' => $this->t('Close reservation modal', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-list-find-on-shelf-text' => $this->t('Find it on shelf', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-list-item-count-text' => $this->t('Home', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-list-material-text' => $this->t('Material', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-no-location-specified-text' => $this->t('No location for find on shelf specified', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-periodical-edition-dropdown-text' => $this->t('Find on shelf modal periodical dropdown - choose edition/volume', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-periodical-year-dropdown-text' => $this->t('Choose periodical year', [], ['context' => 'Work Page']),
      'find-on-shelf-modal-screen-reader-modal-description-text' => $this->t('Reservation modal screen reader description', [], ['context' => 'Work Page']),
      'first-available-edition-text' => $this->t('First available edition', [], ['context' => 'Work Page']),
      'genre-and-form-text' => $this->t('Genre', [], ['context' => 'Work Page']),
      'get-online-text' => $this->t('Get online', [], ['context' => 'Work Page']),
      'go-to-text' => $this->t('Go to @source', [], ['context' => 'Work Page']),
      'have-no-interest-after-text' => $this->t('Have no interest after', [], ['context' => 'Work Page']),
      'hearts-icon-text' => $this->t('hearts', [], ['context' => 'Work Page']),
      'identifier-text' => $this->t('Identifiers', [], ['context' => 'Work Page']),
      'in-same-series-text' => $this->t('In the same series', [], ['context' => 'Work Page']),
      'in-series-text' => $this->t('in the series', [], ['context' => 'Work Page']),
      'infomedia-modal-close-modal-aria-label-text' => $this->t('Close infomedia modal', [], ['context' => 'Work Page']),
      'infomedia-modal-screen-reader-modal-description-text' => $this->t('Infomedia modal screen reader description', [], ['context' => 'Work Page']),
      'instant-loan-sub-title-text' => $this->t('Avoid the queue and pick up the material now', [], ['context' => 'Work Page']),
      'instant-loan-title-text' => $this->t('Instant loan', [], ['context' => 'Work Page']),
      'instant-loan-underline-description-text' => $this->t('The material is available at these nearby libraries', [], ['context' => 'Work Page']),
      'interest-period-one-month-config-text' => $this->t('1', [], ['context' => 'Work Page']),
      'interest-period-one-year-config-text' => $this->t('1', [], ['context' => 'Work Page']),
      'interest-period-six-months-config-text' => $this->t('1', [], ['context' => 'Work Page']),
      'interest-period-three-months-config-text' => $this->t('1', [], ['context' => 'Work Page']),
      'interest-period-two-months-config-text' => $this->t('1', [], ['context' => 'Work Page']),
      'isbn-text' => $this->t('ISBN', [], ['context' => 'Work Page']),
      'language-text' => $this->t('Language', [], ['context' => 'Work Page']),
      'libraries-have-the-material-text' => $this->t('Libraries have the material', [], ['context' => 'Work Page']),
      'listen-online-text' => $this->t('Listen online', [], ['context' => 'Work Page']),
      'loading-text' => $this->t('Loading', [], ['context' => 'Work Page']),
      'login-to-see-review-text' => $this->t('Log in to read the review', [], ['context' => 'Work Page']),
      'material-header-all-editions-text' => $this->t('All editions', [], ['context' => 'Work Page']),
      'material-header-author-by-text' => $this->t('By', [], ['context' => 'Work Page']),
      'material-is-available-in-another-edition-text' => $this->t('Skip the queue - The material is available in another edition - @title @authorAndYear - reservations: @reservations', [], ['context' => 'Work Page']),
      'material-is-included-text' => $this->t('Material is included', [], ['context' => 'Work Page']),
      'material-is-loaned-out-text' => $this->t('Material is loaned out', [], ['context' => 'Work Page']),
      'material-reservation-info-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('1 copy has been reserved', [], ['context' => 'Work Page']),
          $this->t('@count copies have been reserved', [], ['context' => 'Work Page']),
        ],
      ],
      'materials-in-stock-info-text' => [
        'type' => 'plural',
        'text' => [
          $this->t('We have 1 copy of the material in stock', [], ['context' => 'Work Page']),
          $this->t('We have @count copies of the material in stock', [], ['context' => 'Work Page']),
        ],
      ],
      'missing-data-text' => $this->t('Missing data', [], ['context' => 'Work Page']),
      'modal-reservation-form-email-header-description-text' => $this->t('If you want to receive notifications by e-mail, you can enter or change the desired e-mail here.', [], ['context' => 'Work Page']),
      'modal-reservation-form-email-header-title-text' => $this->t('Change email', [], ['context' => 'Work Page']),
      'modal-reservation-form-email-input-field-description-text' => $this->t('Type in email', [], ['context' => 'Work Page']),
      'modal-reservation-form-email-input-field-label-text' => $this->t('Email', [], ['context' => 'Work Page']),
      'modal-reservation-form-no-interest-after-header-description-text' => $this->t('Set date for when your interest for the material will expire.', [], ['context' => 'Work Page']),
      'modal-reservation-form-no-interest-after-header-title-text' => $this->t('Change interest deadline', [], ['context' => 'Work Page']),
      'modal-reservation-form-pickup-header-description-text' => $this->t('Decide at which library you want to pickup the material.', [], ['context' => 'Work Page']),
      'modal-reservation-form-pickup-header-title-text' => $this->t('Choose pickup library', [], ['context' => 'Work Page']),
      'modal-reservation-form-sms-header-description-text' => $this->t('If you want to receive SMS, you can enter or change your phone number here.', [], ['context' => 'Work Page']),
      'modal-reservation-form-sms-header-title-text' => $this->t('Change phone number', [], ['context' => 'Work Page']),
      'modal-reservation-form-sms-input-field-description-text' => $this->t('Input phone number', [], ['context' => 'Work Page']),
      'modal-reservation-form-sms-input-field-label-text' => $this->t('Phone', [], ['context' => 'Work Page']),
      'not-living-in-municipality-text' => $this->t('You don\'t live in the municipality where this library is located.', [], ['context' => 'Work Page']),
      'number-description-text' => $this->t('Nr.', [], ['context' => 'Work Page']),
      'number-in-queue-text' => $this->t('You are number @number in the queue', [], ['context' => 'Work Page']),
      'ok-button-text' => $this->t('Ok', [], ['context' => 'Work Page']),
      'one-month-text' => $this->t('1 month', [], ['context' => 'Work Page']),
      'one-year-text' => $this->t('1 year', [], ['context' => 'Work Page']),
      'online-limit-month-audiobook-info-text' => $this->t('You have borrowed @count out of @limit possible audio-books this month', [], ['context' => 'Work Page']),
      'online-limit-month-ebook-info-text' => $this->t('You have borrowed @count out of @limit possible e-books this month', [], ['context' => 'Work Page']),
      'online-limit-month-info-text' => $this->t('You have borrowed @count out of @limit possible e-books this month', [], ['context' => 'Work Page']),
      'order-digital-copy-button-loading-text' => $this->t('Order digital copy button loading text', [], ['context' => 'Work Page']),
      'order-digital-copy-button-text' => $this->t('Order digital copy', [], ['context' => 'Work Page']),
      'order-digital-copy-description-text' => $this->t('Order digital copy description text', [], ['context' => 'Work Page']),
      'order-digital-copy-email-label-text' => $this->t('Email', [], ['context' => 'Work Page']),
      'order-digital-copy-error-button-text' => $this->t('Close', [], ['context' => 'Work Page']),
      'order-digital-copy-error-description-text' => $this->t('An error occurred while ordering the digital copy. Please try again later.', [], ['context' => 'Work Page']),
      'order-digital-copy-error-title-text' => $this->t('Error ordering digital copy', [], ['context' => 'Work Page']),
      'order-digital-copy-modal-close-modal-aria-label-text' => $this->t('Close Order digital copy modal', [], ['context' => 'Work Page']),
      'order-digital-copy-modal-screen-reader-modal-description-text' => $this->t('Modal for Order digital copy', [], ['context' => 'Work Page']),
      'order-digital-copy-success-button-text' => $this->t('Close', [], ['context' => 'Work Page']),
      'order-digital-copy-success-description-text' => $this->t('The digital copy has been ordered. You will receive an email when the digital copy is ready.', [], ['context' => 'Work Page']),
      'order-digital-copy-success-title-text' => $this->t('Digital copy ordered', [], ['context' => 'Work Page']),
      'order-digital-copy-title-text' => $this->t('Order digital copy', [], ['context' => 'Work Page']),
      'original-title-text' => $this->t('Original title', [], ['context' => 'Work Page']),
      'out-of-text' => $this->t('out of', [], ['context' => 'Work Page']),
      'periodical-select-edition-text' => $this->t('Edition', [], ['context' => 'Work Page']),
      'periodical-select-year-text' => $this->t('Year', [], ['context' => 'Work Page']),
      'periodikum-select-week-text' => $this->t('Week', [], ['context' => 'Work Page']),
      'periodikum-select-year-text' => $this->t('Year', [], ['context' => 'Work Page']),
      'pickup-location-text' => $this->t('Pick up at', [], ['context' => 'Work Page']),
      'possible-text' => $this->t('possible', [], ['context' => 'Work Page']),
      'publisher-text' => $this->t('Publisher', [], ['context' => 'Work Page']),
      'queue-text' => $this->t('in queue', [], ['context' => 'Work Page']),
      'rating-is-text' => $this->t('Rating of this item is', [], ['context' => 'Work Page']),
      'rating-text' => $this->t('out of', [], ['context' => 'Work Page']),
      'read-article-text' => $this->t('Read article', [], ['context' => 'Work Page']),
      'receive-email-when-material-ready-text' => $this->t('Receive mail when the material is ready', [], ['context' => 'Work Page']),
      'receive-sms-when-material-ready-text' => $this->t('Receive SMS when the material is ready', [], ['context' => 'Work Page']),
      'reservation-errors-description-text' => $this->t('Year', [], ['context' => 'Work Page']),
      'reservation-errors-title-text' => $this->t('Reservation error', [], ['context' => 'Work Page']),
      'reservation-modal-close-modal-aria-label-text' => $this->t('Close reservation modal', [], ['context' => 'Work Page']),
      'reservation-modal-screen-reader-modal-description-text' => $this->t('modal for reservation', [], ['context' => 'Work Page']),
      'reservation-succes-is-reserved-for-you-text' => $this->t('is reserved for you', [], ['context' => 'Work Page']),
      'reservation-succes-title-text' => $this->t('The material is available and is now reserved for you!', [], ['context' => 'Work Page']),
      'reservation-success-preferred-pickup-branch-text' => $this->t('Material is available and you will get a message when it is ready for pickup - pickup at @branch', [], ['context' => 'Work Page']),
      'reservations-for-this-material-text' => $this->t('reservations for this material', [], ['context' => 'Work Page']),
      'reserve-book-text' => $this->t('Reserve book', [], ['context' => 'Work Page']),
      'reserve-text' => $this->t('Reserve', [], ['context' => 'Work Page']),
      'reviews-text' => $this->t('Reviews', [], ['context' => 'Work Page']),
      'save-button-text' => $this->t('Save', [], ['context' => 'Work Page']),
      'scope-text' => $this->t('Scope', [], ['context' => 'Work Page']),
      'see-online-text' => $this->t('See online', [], ['context' => 'Work Page']),
      'shift-text' => $this->t('Shift', [], ['context' => 'Work Page']),
      'six-months-text' => $this->t('6 months', [], ['context' => 'Work Page']),
      'subject-number-text' => $this->t('Subject number', [], ['context' => 'Work Page']),
      'this-month-text' => $this->t('This month', [], ['context' => 'Work Page']),
      'three-months-text' => $this->t('3 months', [], ['context' => 'Work Page']),
      'try-agin-button-text' => $this->t('Try again', [], ['context' => 'Work Page']),
      'two-months-text' => $this->t('2 months', [], ['context' => 'Work Page']),
      'type-text' => $this->t('Type', [], ['context' => 'Work Page']),
      'unavailable-text' => $this->t('Unavailable', [], ['context' => 'Work Page']),
      'we-have-shopped-text' => $this->t('In stock:', [], ['context' => 'Work Page']),
      'you-have-borrowed-text' => $this->t('You have borrowed', [], ['context' => 'Work Page']),
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
   * Builds an url for the local search result route.
   */
  public static function searchResultUrl(): string {
    return self::ensureUrlIsString(
      Url::fromRoute('dpl_react_apps.search_result')->toString()
    );
  }

  /**
   * Builds an url for the material/work route.
   */
  public static function materialUrl(): string {
    // React applications support variable replacement where variables are
    // prefixed with :. Specify the variable :workid as a parameter to let the
    // route build the url. Unfortunatly : will be encoded as %3A so we have to
    // decode the url again to make replacement work.
    $url = self::ensureUrlIsString(
      Url::fromRoute('dpl_react_apps.work')
        ->setRouteParameter('wid', ':workid')
        ->toString()
    );
    return urldecode($url);
  }

  /**
   * Builds an url for the react apps to use for authorization.
   */
  public static function authUrl(): string {
    return self::ensureUrlIsString(
      Url::fromRoute('dpl_login.login')->toString()
    );
  }

  /**
   * Get the base url of the API exposed by this site.
   */
  public static function dplCmsBaseUrl(): string {
    $url = self::ensureUrlIsString(
      Url::fromRoute('<front>', [], ['absolute' => TRUE])->toString()
    );
    // The url must not have a trailing slash. The generated client will append
    // it. Double slashes can lead to all kinds of oddities.
    return rtrim($url, "/");
  }

  /**
   * Get the base url of the API's exposed by this site.
   *
   * @return mixed[]
   *   An array of base urls.
   */
  public static function externalApiBaseUrls(): array {
    $react_apps_settings = \Drupal::configFactory()->get('dpl_react_apps.settings');

    /** @var \Drupal\dpl_fbs\DplFbsSettings $fbs_settings*/
    $fbs_settings = \Drupal::service('dpl_fbs.settings');

    /** @var \Drupal\dpl_publizon\DplPublizonSettings $publizon_settings*/
    $publizon_settings = \Drupal::service('dpl_publizon.settings');

    // Get base urls from this module.
    $services = $react_apps_settings->get('services') ?? [];

    // Get base urls from other modules.
    $services['fbs'] = ['base_url' => $fbs_settings->loadConfig()->get('base_url')];
    $services['publizon'] = ['base_url' => $publizon_settings->loadConfig()->get('base_url')];

    $urls = [];
    foreach ($services as $api => $definition) {
      $urls[sprintf('%s-base-url', $api)] = $definition['base_url'];
    }

    return $urls;
  }

  /**
   * Make sure that generated url is a string.
   *
   * @param string|\Drupal\Core\GeneratedUrl $url
   *   Drupal generated Url object.
   */
  public static function ensureUrlIsString(string|GeneratedUrl $url): string {
    if ($url instanceof GeneratedUrl) {
      $url = $url->getGeneratedUrl();
    }

    return $url;
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
      'redirect-on-blocked-url' => $blockedSettings->get('redirect_on_blocked_url') ?? '',
      'blocked-patron-e-link-url' => $blockedSettings->get('blocked_patron_e_link_url') ?? '',
      'blocked-patron-d-title-text' => t('Blocked patron title text (d)', [], ['context' => 'Blocked user']),
      'blocked-patron-d-body-text' => t('Blocked patron body text (d)', [], ['context' => 'Blocked user']),
      'blocked-patron-s-title-text' => t('Blocked patron title text (s)', [], ['context' => 'Blocked user']),
      'blocked-patron-s-body-text' => t('Blocked patron body text (s)', [], ['context' => 'Blocked user']),
      'blocked-patron-f-title-text' => t('Blocked patron title text (f)', [], ['context' => 'Blocked user']),
      'blocked-patron-f-body-text' => t('Blocked patron body text (f)', [], ['context' => 'Blocked user']),
      'blocked-patron-e-title-text' => t('You have exceeded your fee limit', [], ['context' => 'Blocked user']),
      'blocked-patron-e-body-text' => t('You are therefore not able to borrow or reserve materials from the library', [], ['context' => 'Blocked user']),
      'blocked-patron-w-title-text' => t('Your user is blocked (w)', [], ['context' => 'Blocked user']),
      'blocked-patron-w-body-text' => t('You therefore cannot reserve, borrow or renew loans. Please contact the library for further information (w)', [], ['context' => 'Blocked user']),
      'blocked-patron-o-title-text' => t('Blocked reason modal title (o)', [], ['context' => 'Blocked user']),
      'blocked-patron-o-body-text' => t('Blocked patron body text (o)', [], ['context' => 'Blocked user']),
      'blocked-patron-u-title-text' => t('Your user is blocked (u)', [], ['context' => 'Blocked user']),
      'blocked-patron-u-body-text' => t('You therefore cannot reserve, borrow or renew loans. Please contact the library for further information (u)', [], ['context' => 'Blocked user']),
      'blocked-patron-e-link-text' => t('Pay your fees here', [], ['context' => 'Blocked user']),
      'blocked-patron-close-modal-aria-label-text' => t('Close blocked patron modal', [], ['context' => 'Blocked user (Aria)']),
      'blocked-patron-modal-aria-description-text' => t('This modal alerts you, that your patron has been blocked', [], ['context' => 'Blocked user (Aria)']),
    ];

    return $blockedData;
  }

  /**
   * Get the instant loan configuration.
   *
   * @return mixed[]
   *   The instant loan configuration.
   */
  public static function getInstantLoanConfig(): array {
    return \Drupal::configFactory()->get('dpl_instant_loan.settings')->get() ?? [];
  }

}
