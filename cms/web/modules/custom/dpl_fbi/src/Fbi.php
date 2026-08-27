<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi;

use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo;
use Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Series;
use Drupal\dpl_fbi\GraphQL\Operations\WorkInfo;
use Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Work;
use function Safe\preg_replace;

/**
 * The FBI service.
 */
class Fbi {

  const FBI_PROFILE = 'next';

  /**
   * Configuration.
   */
  protected ImmutableConfig $config;

  /**
   * General settings from 'dpl_library_agency'.
   *
   * @todo This ought to be our own configuration, but await work on DDFNEXT-957.
   */
  protected ImmutableConfig $agencySettings;

  /**
   * Static cache of work info.
   *
   * @var array<\Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Work|null>
   */
  protected array $works;

  /**
   * Static cache of series info.
   *
   * @var array<\Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Series|null>
   */
  protected array $series = [];

  /**
   * Constructor.
   *
   * @todo Move the profile configuration to this module.
   */
  public function __construct(
    ConfigFactoryInterface $configFactory,
  ) {
    $this->config = $configFactory->get('dpl_fbi.settings');
    $this->agencySettings = $configFactory->get('dpl_library_agency.general_settings');
  }

  /**
   * Get profile names.
   *
   * @return array<string, string>
   *   Profile type to name mapping.
   */
  public function getProfiles(): array {
    return $this->agencySettings->get('fbi_profiles') ?? [
      FbiProfileType::Default->value => self::FBI_PROFILE,
      FbiProfileType::Local->value => self::FBI_PROFILE,
      FbiProfileType::Global->value => self::FBI_PROFILE,
    ];

  }

  /**
   * Get API URLs for FBI.
   *
   * @return array<string, string>
   *   Service to URL mapping.
   */
  public function getServiceUrls(): array {
    $baseUrl = $this->config->get('base_url');

    $urls = [];
    // Create an URL for each profile.
    if (is_string($baseUrl) && $baseUrl !== '') {
      foreach ($this->getProfiles() as $type => $profile) {
        // The default FBI service has its own key with no suffix.
        $service_key = $type === FbiProfileType::Default->value ? 'fbi' : sprintf('fbi-%s', $type);

        // Create a service url with the profile embedded.
        $urls[$service_key] = str_replace('[profile]', $profile, $baseUrl);
      }
    }

    return $urls;
  }

  /**
   * Get the service URL for the given profile.
   */
  public function getServiceUrl(string $type): string {
    $types = $this->getProfiles();

    if (!isset($types[$type])) {
      throw new \RuntimeException(sprintf('Unknown profile type %s', $type));
    }

    $profile = $types[$type];

    return preg_replace('/\[profile\]/', $profile, $this->config->get('base_url'));
  }

  /**
   * Get title of work.
   */
  public function getWorkTitle(string $wid): string {
    return $this->getWorkInfo($wid)?->titles->full[0] ?? '';
  }

  /**
   * Get work abstract.
   */
  public function getWorkAbstract(string $wid): string {
    return $this->getWorkInfo($wid)?->abstract[0] ?? '';
  }

  /**
   * Get work cover information.
   */
  public function getWorkCoverInfo(string $wid): ?CoverInfo {
    $cover = $this->getWorkInfo($wid)?->manifestations->bestRepresentation->cover->large;

    if ($cover && $cover->url && $cover->height && $cover->width) {
      return new CoverInfo($cover->url, $cover->height, $cover->width);
    }

    return NULL;
  }

  /**
   * Get title of series.
   *
   * Unlike getWorkTitle() this returns NULL rather than an empty string when
   * FBI knows no series with that id, so that callers can tell a bad id apart
   * from a series that simply has no title.
   */
  public function getSeriesTitle(string $seriesId): ?string {
    return $this->getSeriesInfo($seriesId)?->title;
  }

  /**
   * Get description of series.
   *
   * Only around two thirds of series have one.
   */
  public function getSeriesDescription(string $seriesId): ?string {
    return $this->getSeriesInfo($seriesId)?->description;
  }

  /**
   * Get a cover representing a series.
   *
   * A series has no cover of its own, so the cover of one of its members
   * stands in for it. The member flagged readThisFirst is preferred as the
   * face of the series, falling back to the first member that has a cover.
   * Only a handful of members are queried, which is enough to find a cover in
   * practice - this is one representative image, not the series listing.
   */
  public function getSeriesCoverInfo(string $seriesId): ?CoverInfo {
    $members = $this->getSeriesInfo($seriesId)->members ?? [];

    $fallback = NULL;
    foreach ($members as $member) {
      $cover = $member->work->manifestations->bestRepresentation->cover->large;

      if (!$cover || !$cover->url || !$cover->height || !$cover->width) {
        continue;
      }

      $info = new CoverInfo($cover->url, $cover->height, $cover->width);

      if ($member->readThisFirst) {
        return $info;
      }

      $fallback = $fallback ?? $info;
    }

    return $fallback;
  }

  /**
   * Caching work info getter.
   */
  protected function getWorkInfo(string $wid): ?Work {
    if (!isset($this->works[$wid])) {
      $info = WorkInfo::execute($wid);

      $this->works[$wid] = $info->errorFree()->data->work;
    }

    return $this->works[$wid];
  }

  /**
   * Caching series info getter.
   */
  protected function getSeriesInfo(string $seriesId): ?Series {
    // Checked with array_key_exists() rather than isset(): a series FBI
    // knows nothing about is cached as NULL, and that negative answer is
    // worth remembering too - isset() would treat it as a miss and ask FBI
    // again on every call.
    if (!array_key_exists($seriesId, $this->series)) {
      $info = SeriesInfo::execute($seriesId);

      $this->series[$seriesId] = $info->errorFree()->data->series;
    }

    return $this->series[$seriesId];
  }

}
