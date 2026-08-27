<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Publishes and unpublishes a service message from the overview.
 */
class ServiceMessageToggleController extends ControllerBase {

  /**
   * Flip the published state of one service message.
   */
  public function toggle(NodeInterface $node): RedirectResponse {
    if ($node->bundle() !== ServiceMessageLoader::BUNDLE) {
      throw new NotFoundHttpException();
    }

    $publish = !$node->isPublished();
    $publish ? $node->setPublished() : $node->setUnpublished();
    $node->save();

    // Publishing a global message retires any other one - see
    // DplServiceMessageHooks::retireOtherGlobalMessages().
    $this->messenger()->addStatus($publish
      ? $this->t('%label is now published.', ['%label' => $node->label()], ['context' => 'dpl_service_message'])
      : $this->t('%label is now unpublished.', ['%label' => $node->label()], ['context' => 'dpl_service_message'])
    );

    return $this->redirect('view.service_messages.page_1');
  }

}
