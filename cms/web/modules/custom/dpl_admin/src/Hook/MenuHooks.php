<?php

declare(strict_types=1);

namespace Drupal\dpl_admin\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\menu_link_content\Entity\MenuLinkContent;

/**
 * Menu and task hooks for dpl_admin module.
 */
class MenuHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected MessengerInterface $messenger,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Remove and alter unused local tasks, displayed on /admin/content.
   *
   * @phpstan-ignore missingType.iterableValue ($local_tasks is a complex array)
   */
  #[Hook('local_tasks_alter')]
  public function localTasksAlter(array &$local_tasks): void {
    unset($local_tasks['entity.eventseries.collection']);
    unset($local_tasks['entity.eventinstance.collection']);
    unset($local_tasks['entity.media.collection']);

    // Remove the duplicate "Clone" tab on eventseries.
    unset($local_tasks['entity_clone.clone:eventseries.clone_tab']);
  }

  /**
   * Remove all tasks appearing on /events.
   *
   * @phpstan-ignore missingType.iterableValue ($local_actions is a complex array)
   */
  #[Hook('menu_local_actions_alter')]
  public function menuLocalActionsAlter(array &$local_actions): void {
    array_walk($local_actions, function (array &$action) {
      $action['appears_on'] = array_filter($action['appears_on'], function (string $route) {
        return $route !== 'entity.eventinstance.collection';
      });
    });

    unset($local_actions['node.add_page']);
  }

  /**
   * Warn about nested menu items.
   *
   * The editor can place links in the main menu in several levels, but we only
   * display the first level in the frontend.
   *
   * If the editor still places a multi-level link, we'll give them a warning.
   */
  #[Hook('menu_link_content_presave')]
  public function menuLinkContentPresave(MenuLinkContent $entity): void {
    if ('main' !== $entity->getMenuName()) {
      return;
    }

    if (!$entity->get('parent')->isEmpty()) {
      $this->messenger->addWarning($this->t(
        'You have added a menu link with a parent. Please notice that this menu link will not be displayed, as we do not support multi-levels in the main menu.',
        [], ['context' => 'DPL admin UX']
      ));
    }
  }

}
