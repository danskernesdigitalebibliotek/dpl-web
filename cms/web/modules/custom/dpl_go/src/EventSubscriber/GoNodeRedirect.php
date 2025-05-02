<?php

namespace Drupal\dpl_go\EventSubscriber;

use Drupal\Core\Url;
use Drupal\dpl_go\GoSite;
use Drupal\node\NodeInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;

/**
 * Alter the response on GO nodes to a redirect to the external Go app.
 *
 * @package Drupal\dpl_go\EventSubscriber
 */
class GoNodeRedirect implements EventSubscriberInterface {

  public function __construct(protected GoSite $goSite) {}

  /**
   * {@inheritDoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      'kernel.request' => [
        ['redirectGoContent'],
      ],
    ];
  }

  /**
   * Look up the content and redirect to the external Go app if it is a GO node.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The response event.
   */
  public function redirectGoContent(RequestEvent $event): void {
    $request = $event->getRequest();

    if ($request->attributes->get('_route') !== 'entity.node.canonical') {
      return;
    }

    $node = $request->attributes->get('node');

    if ($node instanceof NodeInterface && $this->goSite->isGoNode($node)) {
      $url = Url::fromRoute('entity.node.canonical', ['node' => $node->id()])->toString();

      $response = new RedirectResponse($this->goSite->getGoBaseUrl() . $url);
      $event->setResponse($response);
    }
  }

}
