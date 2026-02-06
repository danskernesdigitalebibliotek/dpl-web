<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Controller;

use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Routing\LocalRedirectResponse;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\Request;

/**
 * Redirect to subscripton creat or edit, based on the given subscription_uuid.
 */
class NewSubscriptionRedirectController implements ContainerInjectionInterface {

  use AutowireTrait;

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected MessengerInterface $messenger,
  ) {}

  /**
   * Redirect to create or edit.
   */
  public function redirect(Request $request): LocalRedirectResponse {
    $query = [
      'uuid' => $request->query->get('uuid', ''),
      'label' => $request->query->get('label', ''),
    ];

    if (empty($query['uuid']) || empty($query['label'])) {
      throw new \RuntimeException('Need both `uuid` and `label` query parameters');
    }

    /** @var \Drupal\bnf_client\Entity\Subscription[] $existing */
    $existing = $this->entityTypeManager->getStorage('bnf_subscription')->loadByProperties([
      'subscription_uuid' => $query['uuid'],
    ]);

    if ($existing) {
      $existing = reset($existing);

      $this->messenger->addWarning('This subscription already exists. You can edit it below.');

      $url = $existing->toUrl('edit-form')->toString();
    }
    else {
      /** @var \Drupal\Core\Entity\EntityTypeInterface $entityType */
      $entityType = $this->entityTypeManager->getDefinition('bnf_subscription', TRUE);

      $url = (string) $entityType->getLinkTemplate('add-form');

      // A bit of an annoying way to add query parameters.
      $url = Url::fromUserInput($url, ['query' => $query])->toString();
    }

    return new LocalRedirectResponse($url);
  }

}
