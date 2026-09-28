<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\EventSubscriber;

use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\Core\Url;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Sends a service message's own page to the page it appears on.
 *
 * A service message has no full view worth showing: it is a line of text
 * meant to be read in the bar or the container it sits in. Rather than
 * render a bare node page, the canonical URL takes the visitor to the first
 * page the message is shown on.
 */
class ServiceMessageRouteSubscriber implements EventSubscriberInterface {

  public function __construct(protected KillSwitch $killSwitch) {}

  /**
   * Redirect a request for a service message page.
   */
  public function redirectToPlacement(RequestEvent $event): void {
    $request = $event->getRequest();

    if ($request->attributes->get('_route') !== 'entity.node.canonical') {
      return;
    }

    $node = $request->attributes->get('node');

    if (!($node instanceof NodeInterface) || $node->bundle() !== ServiceMessageLoader::BUNDLE) {
      return;
    }

    // The target depends on the node's own fields, so the redirect must not
    // outlive an edit in the anonymous page cache.
    $this->killSwitch->trigger();

    $event->setResponse(new RedirectResponse($this->destination($node), 302));
  }

  /**
   * The first page the message would be shown on.
   */
  protected function destination(NodeInterface $node): string {
    $in_page = $node->get('field_svcmsg_placement')->getString() === ServiceMessagePlacement::InPage->value;
    $branch = $node->get('field_svcmsg_branches')->referencedEntities()[0] ?? NULL;

    // The global bar is on every page, so the front page will do. An in-page
    // message goes to the front page when it names it, and otherwise to the
    // first branch it names.
    if ($in_page && !$node->get('field_svcmsg_frontpage')->value && $branch instanceof NodeInterface) {
      return $branch->toUrl()->toString();
    }

    return Url::fromRoute('<front>')->toString();
  }

  /**
   * {@inheritdoc}
   *
   * @return array<string, mixed>
   *   The events to subscribe to.
   */
  public static function getSubscribedEvents(): array {
    // After the router has put the node on the request, before the controller
    // is resolved.
    return [KernelEvents::REQUEST => [['redirectToPlacement', 30]]];
  }

}
