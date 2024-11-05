<?php

namespace Drupal\dpl_redia_legacy\Controller\RssFeeds;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Url;
use Drupal\dpl_redia_legacy\RediaEvent;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use function Safe\strtotime;

/**
 * Building a Redia-legacy RSS feed, showing eventinstances.
 */
class EventsController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected FileUrlGeneratorInterface $fileUrlGenerator,
    protected DateFormatterInterface $dateFormatter,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('file_url_generator'),
      $container->get('date.formatter'),
    );
  }

  /**
   * Getting the RSS/XML feed of the items.
   */
  public function getFeed(Request $request): CacheableResponse {
    $items = $this->getItems();

    $rss_content = $this->buildRss($items, $request);

    $response = new CacheableResponse();
    $response->setContent($rss_content);

    // Create cache metadata.
    $cache_metadata = new CacheableMetadata();
    $cache_metadata->setCacheTags(['eventinstance_list', 'eventseries_list']);

    // Add cache metadata to the response.
    $response->addCacheableDependency($cache_metadata);

    $response->headers->set('Content-Type', 'application/rss+xml');
    return $response;
  }

  /**
   * Loading events, and turning it into a simple array of relevant values.
   *
   * @return \Drupal\dpl_redia_legacy\RediaEvent[]
   *   An array of necessary item fields, used in buildRss().
   */
  private function getItems(): array {

    $storage = $this->entityTypeManager()->getStorage('eventinstance');
    $query = $storage->getQuery()
      ->condition('status', TRUE)
      ->condition('date.value', strtotime('today'), '>=')
      ->accessCheck(TRUE)
      ->sort('date.value');
    $ids = $query->execute();

    /** @var \Drupal\recurring_events\Entity\EventInstance[] $events */
    $events = $storage->loadMultiple($ids);

    $items = [];

    foreach ($events as $event) {
      $items[] = new RediaEvent($event);
    }

    return $items;
  }

  /**
   * Building the actual RSS feed, from the items and site information.
   *
   * @param \Drupal\dpl_redia_legacy\RediaEvent[] $items
   *   See $this->getItems();.
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request, for looking up the current site info.
   */
  private function buildRss(array $items, Request $request): string {
    $config = $this->config('system.site');
    $site_title = $config->get('name');
    $site_url = $request->getSchemeAndHttpHost();
    $feed_url = Url::fromRoute('dpl_redia_legacy.events');
    $feed_url->setAbsolute();
    $feed_url = $feed_url->toString();

    $date = $this->dateFormatter->format(time(), 'custom', 'r');

    // Disable formatting rules. We use indentation to mark start/end elements.
    // phpcs:disable Drupal.WhiteSpace.ScopeIndent.IncorrectExact
    // @formatter:off
    $xml = new \XMLWriter();
    $xml->openMemory();
    $xml->startDocument('1.0', 'UTF-8');
    $xml->startElement('rss');
      $xml->writeAttribute('version', '2.0');
      $xml->writeAttribute('xml:base', $site_url);
      // We intentionally do not use the built-in XML Writer namespace handling.
      // This allows us to produce output that matches the existing
      // implementation as closely as possible.
      $xml->writeAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom');
      $xml->writeAttribute('xmlns:media', 'http://search.yahoo.com/mrss/');
      $xml->writeAttribute('xmlns:content-rss', 'http://xml.redia.dk/rss');

      $xml->startElement('channel');
        $xml->writeElement('title', $site_title);
        $xml->writeElement('link', $site_url);
        $xml->startElement('atom:link');
          $xml->writeAttribute('rel', 'self');
          $xml->writeAttribute('href', $feed_url);
        $xml->endElement();
        $xml->writeElement('language', 'da');
        $xml->writeElement('pubDate', $date);
        $xml->writeElement('lastBuildDate', $date);

        foreach ($items as $item) {
          $xml->startElement('item');
            $xml->writeElement('title', $item->title);
            $xml->writeElement('description', $item->description);
            $xml->writeElement('author', $item->author);
            $xml->startElement('guid');
              $xml->writeAttribute('isPermaLink', 'false');
              $xml->text((string) $item->id);
            $xml->endElement();
            $xml->writeElement('pubDate', $item->date);
            $xml->startElement('source');
              $xml->writeAttribute('url', $feed_url);
              $xml->text($site_title);
            $xml->endElement();

            if ($item->media && $item->media->url) {
              $xml->startElement('media:content');
                $xml->writeAttribute('url', $item->media->url);
                $xml->writeAttribute('fileSize', (string) $item->media->size);
                $xml->writeAttribute('type', (string) $item->media->type);
                $xml->writeAttribute('medium', $item->media->medium);
                $xml->writeAttribute('width', (string) $item->media->width);
                $xml->writeAttribute('height', (string) $item->media->height);
                if ($item->media->md5) {
                  $xml->startElement('media:hash');
                    $xml->writeAttribute('algo', 'md5');
                    $xml->text($item->media->md5);
                  $xml->endElement();
                }
              $xml->endElement();
            }

            if ($item->mediaThumbnail && $item->mediaThumbnail->url) {
              $xml->startElement('media:thumbnail');
                $xml->writeAttribute('url', $item->mediaThumbnail->url);
                $xml->writeAttribute('width', (string) $item->mediaThumbnail->width);
                $xml->writeAttribute('height', (string) $item->mediaThumbnail->height);
              $xml->endElement();
            }

            $xml->writeElement('content-rss:subheadline', $item->subtitle);
            $xml->writeElement('content-rss:arrangement-starttime', $item->startTime);
            $xml->writeElement('content-rss:arrangement-endtime', $item->endTime);

            if ($item->branch) {
              $xml->writeElement('content-rss:arrangement-location', $item->branch->label());
              $xml->writeElement('content-rss:library-id', (string) $item->branch->id());
            }

            if ($item->bookingUrl) {
              $xml->writeElement('content-rss:booking-url', $item->bookingUrl);
            }

            $xml->writeElement('content-rss:promoted', $item->promoted);
          $xml->endElement();
        }
      $xml->endElement();

    $xml->endElement();
    $xml->endDocument();
    return $xml->outputMemory();
    // @formatter:on
    // phpcs:enable Drupal.WhiteSpace.ScopeIndent.IncorrectExact
  }

}
