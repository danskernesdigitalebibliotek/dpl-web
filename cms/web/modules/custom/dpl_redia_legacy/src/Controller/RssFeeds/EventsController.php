<?php

namespace Drupal\dpl_redia_legacy\Controller\RssFeeds;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Url;
use Drupal\file\FileInterface;
use Drupal\image\ImageStyleInterface;
use Drupal\media\MediaInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use function Safe\filesize;
use function Safe\getimagesize;

/**
 * Building a Redia-legacy RSS feed, showing eventinstances.
 */
class EventsController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected FileUrlGeneratorInterface $fileUrlGenerator,
    protected RequestStack $requestStack,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('file_url_generator'),
      $container->get('request_stack'),

    );
  }

  /**
   * Getting the RSS/XML feed of the items.
   */
  public function getFeed(): Response {
    $items = $this->getItems();

    $rss_content = $this->buildRss($items);

    $response = new Response();
    $response->setContent($rss_content);
    $response->headers->set('Content-Type', 'application/rss+xml');
    return $response;
  }

  /**
   * Loading events, and turning it into a simple array of relevant values.
   *
   * @return array<mixed>
   *   An array of necessary item fields, used in buildRss().
   */
  private function getItems(): array {

    $storage = $this->entityTypeManager()->getStorage('eventinstance');
    $query = $storage->getQuery()
      ->condition('status', TRUE)
      ->accessCheck(TRUE)
      ->sort('date.value');

    $ids = $query->execute();

    $events = EventInstance::loadMultiple($ids);

    $items = [];

    foreach ($events as $event) {
      /** @var \Drupal\node\NodeInterface[] $branches */
      $branches = $event->get('branch')->referencedEntities();
      $branch = reset($branches);
      $event_dates = $event->get('date')->getValue();
      $changed_date = DrupalDateTime::createFromFormat('U', strval($event->getChangedTime()));

      $items[] = [
        'title' => $event->label(),
        'description' => $this->getEventDescription($event),
        'author' => $event->getOwner()->get('field_author_name')->getString(),
        'id' => $event->id(),
        'date' => $changed_date->format('r'),
        'promoted' => FALSE,
        'subtitle' => $event->get('event_description')->getString(),
        'start_time' => $event_dates[0]['value'] ?? NULL,
        'end_time' => $event_dates[0]['end_value'] ?? NULL,
        'media' => $this->getEventImageFields($event, 'redia_feed_large'),
        'media_thumbnail' => $this->getEventImageFields($event, 'redia_feed_small'),
        'branch' => [
          'label' => $branch ? $branch->label() : NULL,
          'id' => $branch ? $branch->id() : NULL,
        ],
      ];
    }

    return $items;
  }

  /**
   * Turning event image into fields that Redia understands.
   *
   * @return array<mixed>|null
   *   The fields that Redia understands (or nothing).
   */
  private function getEventImageFields(EventInstance $event, string $image_style) {
    $media_field = $event->get('event_image');

    if (!($media_field instanceof FieldItemListInterface)) {
      return NULL;
    }

    $media = $media_field->referencedEntities()[0] ?? NULL;
    $file_field_name = 'field_media_image';

    if (!($media instanceof MediaInterface) || !$media->hasField($file_field_name)) {
      return NULL;
    }

    // @phpstan-ignore-next-line PHPStan does not know that entity is available.
    $file = $media->get($file_field_name)->first()?->entity;

    if (!($file instanceof FileInterface)) {
      return NULL;
    }

    $file_uri = $file->getFileUri();
    $style = $this->entityTypeManager()->getStorage('image_style')->load($image_style);

    if (empty($file_uri) || !($style instanceof ImageStyleInterface)) {
      return NULL;
    }

    $image_url = $style->buildUrl($file_uri);
    $image_sizes = getimagesize($file_uri);
    $file_size = filesize($file_uri);

    return [
      // Generating a unique MD5.
      'md5' => md5($image_url . $file_size),
      'url' => $image_url,
      'type' => $file->getMimeType(),
      'size' => filesize($file_uri),
      'width' => $image_sizes[0] ?? NULL,
      'height' => $image_sizes[1] ?? NULL,
    ];
  }

  /**
   * Getting the first paragraph as text, to use as description.
   */
  private function getEventDescription(EventInstance $event): ?string {
    /** @var \Drupal\paragraphs\ParagraphInterface[] $paragraphs */
    $paragraphs = $event->get('event_paragraphs')->referencedEntities();

    foreach ($paragraphs as $paragraph) {
      if ($paragraph->bundle() === 'text_body') {
        return $paragraph->get('field_body')->getValue()[0]['value'] ?? NULL;
      }
    }

    return NULL;
  }

  /**
   * Building the actual RSS feed, from the items and site information.
   *
   * @param array<mixed> $items
   *   See $this->getItems();.
   */
  private function buildRss(array $items): string {
    $config = $this->config('system.site');
    $site_title = $config->get('name');
    $site_url = $this->requestStack->getCurrentRequest()?->getSchemeAndHttpHost();
    $feed_url = Url::fromRoute('dpl_redia_legacy.events');
    $feed_url->setAbsolute();
    $feed_url = $feed_url->toString();

    $current_date = new DrupalDateTime();
    $date = $current_date->format('r');

    $rss_feed = '<?xml version="1.0" encoding="UTF-8"?>';
    $rss_feed .= '<rss version="2.0" xml:base="' . $site_url . '" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content-rss="http://xml.redia.dk/rss">';
    $rss_feed .= '<channel>';
    $rss_feed .= "<title>$site_title</title>";
    $rss_feed .= "<link>$site_url</link>";
    $rss_feed .= '<atom:link rel="self" href="' . $feed_url . '" />';
    $rss_feed .= '<language>da</language>';
    $rss_feed .= "<pubDate>$date</pubDate>";
    $rss_feed .= "<lastBuildDate>$date</lastBuildDate>";

    foreach ($items as $item) {
      $rss_feed .= '<item>';
      $rss_feed .= "<title>{$item['title']}</title>";
      $rss_feed .= "<description>{$item['description']}</description>";
      $rss_feed .= "<author>{$item['author']}</author>";
      $rss_feed .= "<guid isPermaLink=\"false\">{$item['id']}</guid>";
      $rss_feed .= "<pubDate>{$item['date']}</pubDate>";
      $rss_feed .= "<source url=\"$feed_url\">$site_title</source>";
      $rss_feed .= "<media:content url=\"{$item['media']['url']}\" fileSize=\"{$item['media']['size']}\"
                            type=\"{$item['media']['type']}\" contentmedium=\"image\"
                            width=\"{$item['media']['width']}\" height=\"{$item['media']['height']}\">
                            <media:hash algo=\"md5\">{$item['media']['md5']}</media:hash>
                    </media:content>";

      $rss_feed .= "<media:thumbnail url=\"{$item['media_thumbnail']['url']}\"
                            width=\"{$item['media']['width']}\" height=\"{$item['media']['height']}\" />";

      $rss_feed .= "<content-rss:subheadline>{$item['subtitle']}</content-rss:subheadline>";
      $rss_feed .= "<content-rss:arrangement-starttime>{$item['start_time']}</content-rss:arrangement-starttime>";
      $rss_feed .= "<content-rss:arrangement-endtime>{$item['end_time']}</content-rss:arrangement-endtime>";
      $rss_feed .= "<content-rss:arrangement-location>{$item['branch']['label']}</content-rss:arrangement-location>";
      $rss_feed .= "<content-rss:library-id>{$item['branch']['id']}</content-rss:library-id>";

      $promoted_title = $item['promoted'] ? 'Sandt' : 'Falsk';
      $rss_feed .= "<content-rss:promoted>$promoted_title</content-rss:promoted>";

      $rss_feed .= '</item>';
    }

    $rss_feed .= '</channel>';
    $rss_feed .= '</rss>';

    return $rss_feed;
  }

}
