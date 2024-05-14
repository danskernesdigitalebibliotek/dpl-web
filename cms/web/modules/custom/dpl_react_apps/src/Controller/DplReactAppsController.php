<?php

namespace Drupal\dpl_react_apps\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\dpl_fbs\Form\FbsSettingsForm;
use Drupal\dpl_instant_loan\DplInstantLoanSettings;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\FbiProfileType;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_library_agency\ReservationSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\json_encode as json_encode;
use function Safe\preg_replace as preg_replace;
use function Safe\sprintf as sprintf;

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
    protected GeneralSettings $generalSettings
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
      $container->get('dpl_library_agency.general_settings'),
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

      // Texts.
      'add-more-filters-text' => $this->t('+ more filters', [], ['context' => 'Search Result']),
      'clear-all-text' => $this->t('Clear all', [], ['context' => 'Search Result']),
      'facet-access-types-text' => $this->t('Access types', [], ['context' => 'Search Result']),
      'facet-browser-modal-close-modal-aria-label-text' => $this->t('Close facet browser modal', [], ['context' => 'Search Result']),
      'facet-browser-modal-screen-reader-modal-description-text' => $this->t('Modal for facet browser', [], ['context' => 'Search Result']),
      'facet-can-always-be-loaned-text' => $this->t('Can always be loaned', [], ['context' => 'Search Result']),
      'facet-children-or-adults-text' => $this->t('Children or adults', [], ['context' => 'Search Result']),
      'facet-creators-text' => $this->t('Creators', [], ['context' => 'Search Result']),
      'facet-dk5-text' => $this->t('Dk5', [], ['context' => 'Search Result']),
      'facet-fiction-nonfiction-text' => $this->t('Fiction or non-fiction', [], ['context' => 'Search Result']),
      'facet-fictional-characters-text' => $this->t('Fictional characters', [], ['context' => 'Search Result']),
      'facet-genre-and-form-text' => $this->t('Genre and form', [], ['context' => 'Search Result']),
      'facet-main-languages-text' => $this->t('Main languages', [], ['context' => 'Search Result']),
      'facet-material-types-text' => $this->t('Material types', [], ['context' => 'Search Result']),
      'facet-material-types-general-text' => $this->t('Material types general', [], ['context' => 'Search Result']),
      'facet-material-types-specific-text' => $this->t('Material types specific', [], ['context' => 'Search Result']),
      'facet-subjects-text' => $this->t('Subjects', [], ['context' => 'Search Result']),
      'facet-work-types-text' => $this->t('Work types', [], ['context' => 'Search Result']),
      'facet-year-text' => $this->t('Year', [], ['context' => 'Search Result']),
      'filter-list-text' => $this->t('Filter list', [], ['context' => 'Search Result']),
      'invalid-search-text' => $this->t('Invalid search', [], ['context' => 'Search Result']),
      'invalid-search-description-text' => $this->t('Your search is invalid. Please try again. In order to perform a valid search, you need to include at least three letters.', [], ['context' => 'Search Result']),
      'results-text' => $this->t('results', [], ['context' => 'Search Result']),
      'show-results-text' => $this->t('Show results', [], ['context' => 'Search Result']),
      'showing-results-for-text' => $this->t('Showing results for "@query"', [], ['context' => 'Search Result']),
      'showing-text' => $this->t('Showing', [], ['context' => 'Search Result']),
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
      // Texts.
      'advanced-search-ac-source-text' => $this->t('source', [], ['context' => 'advanced search']),
      'advanced-search-add-row-text' => $this->t('add row', [], ['context' => 'advanced search']),
      'advanced-search-all-indexes-text' => $this->t('all indexes', [], ['context' => 'advanced search']),
      'advanced-search-audience-text' => $this->t('audience', [], ['context' => 'advanced search']),
      'advanced-search-copy-string-text' => $this->t('copy string', [], ['context' => 'advanced search']),
      'advanced-search-creator-text' => $this->t('creator', [], ['context' => 'advanced search']),
      'advanced-search-date-first-edition-text' => $this->t('edition', [], ['context' => 'advanced search']),
      'advanced-search-date-text' => $this->t('date', [], ['context' => 'advanced search']),
      'advanced-search-decimal-dk5-text' => $this->t('dk5', [], ['context' => 'advanced search']),
      'advanced-search-edit-cql-text' => $this->t('edit cql', [], ['context' => 'advanced search']),
      'advanced-search-filter-access-text' => $this->t('accessibility', [], ['context' => 'advanced search']),
      'advanced-search-filter-all-text' => $this->t('All', [], ['context' => 'advanced search']),
      'advanced-search-filter-article-text' => $this->t('article', [], ['context' => 'advanced search']),
      'advanced-search-filter-audio-book-text' => $this->t('audio book', [], ['context' => 'advanced search']),
      'advanced-search-filter-book-text' => $this->t('book', [], ['context' => 'advanced search']),
      'advanced-search-filter-ebook-text' => $this->t('ebook', [], ['context' => 'advanced search']),
      'advanced-search-filter-fiction-text' => $this->t('fiction', [], ['context' => 'advanced search']),
      'advanced-search-filter-literature-form-text' => $this->t('literature form', [], ['context' => 'advanced search']),
      'advanced-search-filter-material-type-text' => $this->t('material type', [], ['context' => 'advanced search']),
      'advanced-search-filter-movie-text' => $this->t('movie', [], ['context' => 'advanced search']),
      'advanced-search-filter-music-text' => $this->t('music', [], ['context' => 'advanced search']),
      'advanced-search-filter-non-fiction-text' => $this->t('Non-fiction', [], ['context' => 'advanced search']),
      'advanced-search-filter-online-text' => $this->t('online', [], ['context' => 'advanced search']),
      'advanced-search-filter-physical-text' => $this->t('physical', [], ['context' => 'advanced search']),
      'advanced-search-genre-text' => $this->t('genre', [], ['context' => 'advanced search']),
      'advanced-search-identifier-text' => $this->t('identifier', [], ['context' => 'advanced search']),
      'advanced-search-input-placeholder-text' => $this->t('search term', [], ['context' => 'advanced search']),
      'advanced-search-language-text' => $this->t('language', [], ['context' => 'advanced search']),
      'advanced-search-link-to-this-search-text' => $this->t('link to this search', [], ['context' => 'advanced search']),
      'advanced-search-main-creator-text' => $this->t('main creator', [], ['context' => 'advanced search']),
      'advanced-search-main-title-text' => $this->t('main title', [], ['context' => 'advanced search']),
      'advanced-search-preview-empty-text' => $this->t('-', [], ['context' => 'advanced search']),
      'advanced-search-preview-headline-text' => $this->t('CQL search string', [], ['context' => 'advanced search']),
      'advanced-search-publisher-text' => $this->t('publisher', [], ['context' => 'advanced search']),
      'advanced-search-reset-text' => $this->t('reset', [], ['context' => 'advanced search']),
      'advanced-search-search-button-text' => $this->t('search', [], ['context' => 'advanced search']),
      'advanced-search-source-text' => $this->t('source', [], ['context' => 'advanced search']),
      'advanced-search-subject-text' => $this->t('subject', [], ['context' => 'advanced search']),
      'advanced-search-title-text' => $this->t('advanced search', [], ['context' => 'advanced search']),
      'advanced-search-type-text' => $this->t('type', [], ['context' => 'advanced search']),
      'clause-and-text' => $this->t('and', [], ['context' => 'advanced search']),
      'clause-not-text' => $this->t('not', [], ['context' => 'advanced search']),
      'clause-or-text' => $this->t('or', [], ['context' => 'advanced search']),
      'copied-link-to-this-search-text' => $this->t('Link copied to clipboard', [], ['context' => 'advanced search']),
      'copied-to-clipboard-text' => $this->t('Copied', [], ['context' => 'advanced search']),
      'cql-search-title-text' => $this->t('CQL search', [], ['context' => 'advanced search']),
      'loading-results-text' => $this->t('Loading results...', [], ['context' => 'advanced search']),
      'showing-materials-text' => $this->t('showing materials', [], ['context' => 'advanced search']),
      'to-advanced-search-button-text' => $this->t('Back to advanced search', [], ['context' => 'advanced search']),
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
   * Render work page.
   *
   * @param string $wid
   *   A work id.
   *
   * @return mixed[]
   *   Render array.
   *
   * @throws \Safe\Exceptions\JsonException
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
      'interest-periods-config' => json_encode($this->generalSettings->getInterestPeriodsConfig()),

      // Texts.
      'already-reserved-text' => $this->t('Already reserved', [], ['context' => 'Work Page']),
      'approve-reservation-text' => $this->t('Approve reservation', [], ['context' => 'Work Page']),
      'audience-text' => $this->t('Audience', [], ['context' => 'Work Page']),
      'blocked-button-text' => $this->t('Blocked', [], ['context' => 'Work Page']),
      'cannot-see-review-text' => $this->t('The review is not accessible', [], ['context' => 'Work Page']),
      'cant-reserve-text' => $this->t("Can't be reserved", [], ['context' => 'Work Page']),
      'cant-view-review-text' => $this->t('Cannot view review', [], ['context' => 'Work Page']),
      'cant-view-text' => $this->t("Can't be viewed", [], ['context' => 'Work Page']),
      'change-email-text' => $this->t('Change email', [], ['context' => 'Work Page']),
      'change-sms-number-text' => $this->t('Change SMS number', [], ['context' => 'Work Page']),
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
      'details-list-age-range-text' => $this->t('Age range', [], ['context' => 'Work Page']),
      'details-list-notes-text' => $this->t('Notes', [], ['context' => 'Work Page']),
      'details-list-physical-description-text' => $this->t('Dimensions', [], ['context' => 'Work Page']),
      'details-list-host-publication-text' => $this->t('Host Publication', [], ['context' => 'Work Page']),
      'details-list-source-text' => $this->t('Source', [], ['context' => 'Work Page']),
      'details-list-parts-text' => $this->t('Contents', [], ['context' => 'Work Page']),
      'details-of-the-material-text' => $this->t('Details of the material', [], ['context' => 'Work Page']),
      'details-text' => $this->t('Details', [], ['context' => 'Work Page']),
      'edition-text' => $this->t('Edition', [], ['context' => 'Work Page']),
      'editions-text' => $this->t('Editions', [], ['context' => 'Work Page']),
      'expand-more-text' => $this->t('Expand more', [], ['context' => 'Work Page']),
      'fiction-nonfiction-text' => $this->t('Fiction/nonfiction', [], ['context' => 'Work Page']),
      'film-adaptations-text' => $this->t('Film adaptations', [], ['context' => 'Work Page']),
      'find-on-bookshelf-text' => $this->t('Find on bookshelf', [], ['context' => 'Work Page']),
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
      'modal-reservation-form-sms-header-description-text' => $this->t('If you want to receive SMS, you can enter or change your phone number here.', [], ['context' => 'Work Page']),
      'modal-reservation-form-sms-header-title-text' => $this->t('Change phone number', [], ['context' => 'Work Page']),
      'modal-reservation-form-sms-input-field-description-text' => $this->t('Input phone number', [], ['context' => 'Work Page']),
      'modal-reservation-form-sms-input-field-label-text' => $this->t('Phone', [], ['context' => 'Work Page']),
      'not-living-in-municipality-text' => $this->t("You don't live in the municipality where this library is located.", [], ['context' => 'Work Page']),
      'number-in-queue-text' => $this->t('You are number @number in the queue', [], ['context' => 'Work Page']),
      'ok-button-text' => $this->t('Ok', [], ['context' => 'Work Page']),
      'online-limit-month-audiobook-info-text' => $this->t('You have borrowed @count out of @limit possible audio-books this month', [], ['context' => 'Work Page']),
      'online-limit-month-ebook-info-text' => $this->t('You have borrowed @count out of @limit possible e-books this month', [], ['context' => 'Work Page']),
      'online-limit-month-info-text' => $this->t('You have borrowed @count out of @limit possible e-books this month', [], ['context' => 'Work Page']),
      'open-order-not-owned-ill-loc-text' => $this->t('Your material has been ordered from another library', [], ['context' => 'Work Page']),
      'open-order-owned-own-catalogue-text' => $this->t('Item available, order through the librarys catalogue', [], ['context' => 'Work Page']),
      'open-order-owned-wrong-mediumtype-text' => $this->t('Item available but medium type not accepted', [], ['context' => 'Work Page']),
      'open-order-response-title-text' => $this->t('Order from another library:', [], ['context' => 'Work Page']),
      'open-order-service-unavailable-text' => $this->t('Service is currently unavailable', [], ['context' => 'Work Page']),
      'open-order-status-owned-accepted-text' => $this->t('Your order is accepted', [], ['context' => 'Work Page']),
      'open-order-unknown-error-text' => $this->t('An unknown error occurred', [], ['context' => 'Work Page']),
      'open-order-unknown-pickupagency-text' => $this->t('Specified pickup agency not found', [], ['context' => 'Work Page']),
      'open-order-unknown-user-text' => $this->t('User not found', [], ['context' => 'Work Page']),
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
      'reservable-from-another-library-text' => $this->t('Ordered from another library', [], ['context' => 'Work Page']),
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
      'reserve-with-material-type-text' => $this->t('Reserve @materialType', [], ['context' => 'Work Page']),
      'reviews-text' => $this->t('Reviews', [], ['context' => 'Work Page']),
      'scope-text' => $this->t('Scope', [], ['context' => 'Work Page']),
      'see-online-text' => $this->t('See online', [], ['context' => 'Work Page']),
      'this-month-text' => $this->t('This month', [], ['context' => 'Work Page']),
      'try-agin-button-text' => $this->t('Try again', [], ['context' => 'Work Page']),
      'type-text' => $this->t('Type', [], ['context' => 'Work Page']),
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
   * Get the base url of the API's exposed by this site.
   *
   * @return mixed[]
   *   An array of base urls.
   */
  public static function externalApiBaseUrls(): array {
    /** @var \Drupal\dpl_library_agency\GeneralSettings $general_settings */
    $general_settings = \Drupal::service('dpl_library_agency.general_settings');
    $react_apps_settings = \Drupal::configFactory()->get('dpl_react_apps.settings');
    $fbs_settings = \Drupal::config(FbsSettingsForm::CONFIG_KEY);

    /** @var \Drupal\dpl_publizon\DplPublizonSettings $publizon_settings*/
    $publizon_settings = \Drupal::service('dpl_publizon.settings');

    // Get base urls from this module.
    $services = $react_apps_settings->get('services') ?? [];

    // The base url of the FBI service is a special case
    // because a part (the profile) of the base url can differ.
    // Lets' handle that:
    if (!empty($services) && !empty($services['fbi']['base_url'])) {
      $placeholder_url = $services['fbi']['base_url'];
      foreach ($general_settings->getFbiProfiles() as $type => $profile) {
        $service_key = sprintf('fbi-%s', $type);
        // The default FBI service has its own key with no suffix.
        if ($type === FbiProfileType::DEFAULT->value) {
          $service_key = 'fbi';
        }
        // Create a service url with the profile embedded.
        $base_url = preg_replace('/\[profile\]/', $profile, $placeholder_url);
        $services[$service_key] = ['base_url' => $base_url];
      }
    }

    // Get base urls from other modules.
    $services['fbs'] = ['base_url' => $fbs_settings->get('base_url')];
    $services['publizon'] = ['base_url' => $publizon_settings->loadConfig()->get('base_url')];

    $urls = [];
    foreach ($services as $api => $definition) {
      $urls[sprintf('%s-base-url', $api)] = $definition['base_url'];
    }

    return $urls;
  }

}
