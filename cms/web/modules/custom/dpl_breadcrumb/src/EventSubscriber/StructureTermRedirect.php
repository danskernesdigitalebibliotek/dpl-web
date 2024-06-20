<?php

namespace Drupal\dpl_breadcrumb\EventSubscriber;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\dpl_breadcrumb\Services\BreadcrumbHelper;
use Drupal\taxonomy\Entity\Term;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Alter the response on structure terms to a redirect to referenced content.
 *
 * @package Drupal\dpl_breadcrumb\EventSubscriber
 */
class StructureTermRedirect implements EventSubscriberInterface {

  /**
   * Our own custom breadcrumb helper service.
   */
  private BreadcrumbHelper $breadcrumbHelper;

  /**
   * {@inheritdoc}
   */
  public function __construct(BreadcrumbHelper $breadcrumb_helper) {
    $this->breadcrumbHelper = $breadcrumb_helper;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => [
        ['redirectToContent'],
      ],
    ];
  }

  /**
   * Look up the content, and redirect.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The response event.
   */
  public function redirectToContent(RequestEvent $event): void {
    $request = $event->getRequest();

    if ($request->attributes->get('_route') !== 'entity.taxonomy_term.canonical') {
      return;
    }

    $term = $request->attributes->get('taxonomy_term');

    $structure_vid = $this->breadcrumbHelper->getStructureVid();

    if ($term instanceof Term && $term->bundle() === $structure_vid) {
      if (!$term->hasField('field_content')) {
        return;
      }

      $contents = $term->get('field_content')->referencedEntities();
      $content = reset($contents);

      if ($content instanceof FieldableEntityInterface) {
        $response = new RedirectResponse($content->toUrl()->toString());
        $event->setResponse($response);
      }
    }
  }

}
