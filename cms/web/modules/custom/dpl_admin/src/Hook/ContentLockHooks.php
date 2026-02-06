<?php

declare(strict_types=1);

namespace Drupal\dpl_admin\Hook;

use Drupal\content_lock\ContentLock\ContentLock;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Hooks for content lock integration.
 *
 * @todo Remove the procedural hook in dpl_admin.module and the service
 *   registration in dpl_admin.services.yml when upgrading to Drupal 11.
 */
class ContentLockHooks implements ContainerInjectionInterface {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected ContentLock $contentLock,
    protected AccountProxyInterface $currentUser,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('content_lock'),
      $container->get('current_user'),
      $container->get('entity_type.manager'),
    );
  }

  /**
   * Show warning for locked nodes on delete confirmation.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  #[Hook('form_node_confirm_form_alter')]
  public function nodeConfirmFormAlter(array &$form, FormStateInterface $form_state): void {
    $this->alterDeleteConfirmForm($form, $form_state);
  }

  /**
   * Show warning for locked taxonomy terms on delete confirmation.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  #[Hook('form_taxonomy_term_confirm_form_alter')]
  public function taxonomyTermConfirmFormAlter(array &$form, FormStateInterface $form_state): void {
    $this->alterDeleteConfirmForm($form, $form_state);
  }

  /**
   * Alter delete confirmation form to show warning for locked content.
   *
   * Shows a warning message on the delete confirmation form when content
   * is locked.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  protected function alterDeleteConfirmForm(array &$form, FormStateInterface $form_state): void {
    $form_object = $form_state->getFormObject();

    if (!($form_object instanceof EntityFormInterface)) {
      return;
    }

    $entity = $form_object->getEntity();

    if (!($entity instanceof ContentEntityInterface)) {
      return;
    }

    if (!$this->contentLock->isLockable($entity)) {
      return;
    }

    $entity_id = $entity->id();
    if ($entity_id === NULL) {
      return;
    }

    /** @var object{uid: int|string, timestamp: int}|false $lock_data */
    $lock_data = $this->contentLock->fetchLock(
      (int) $entity_id,
      $entity->language()->getId(),
      NULL,
      $entity->getEntityTypeId()
    );

    if (!is_object($lock_data)) {
      return;
    }

    $locked_by_current_user = (string) $this->currentUser->id() === (string) $lock_data->uid;

    /** @var \Drupal\user\UserInterface|null $lock_user */
    $lock_user = $locked_by_current_user
      ? NULL
      : $this->entityTypeManager->getStorage('user')->load($lock_data->uid);

    if ($locked_by_current_user) {
      // Warning when the current user holds the lock.
      $message = $this->t('<div class="messages messages--warning">You currently have <strong>@title</strong> open in another window or tab. If you delete it now, you may lose changes that have not been saved.</div>', [
        '@title' => $entity->label(),
      ], ['context' => 'DPL admin UX']);
    }
    else {
      // Warning when another user holds the lock.
      $message = $this->t('<div class="messages messages--warning"><strong>@title</strong> is currently being edited by <strong>@user</strong>. There is a risk of data loss if you proceed with deleting this content.</div>', [
        '@title' => $entity->label(),
        '@user' => $lock_user?->getDisplayName() ?? $this->t('another user'),
      ], ['context' => 'DPL admin UX']);
    }

    $form['locked_content_warning'] = [
      '#markup' => $message,
      '#weight' => -100,
    ];

    // Add submit handler to release the lock before deletion.
    // Must be added to actions submit, not form #submit, for confirm forms.
    if (isset($form['actions']['submit']['#submit'])) {
      array_unshift($form['actions']['submit']['#submit'], [static::class, 'releaseLockOnDelete']);
    }
    else {
      $form['actions']['submit']['#submit'] = [[static::class, 'releaseLockOnDelete']];
    }
  }

  /**
   * Submit handler to release content lock before deletion.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public static function releaseLockOnDelete(array &$form, FormStateInterface $form_state): void {
    $form_object = $form_state->getFormObject();

    if (!($form_object instanceof EntityFormInterface)) {
      return;
    }

    $entity = $form_object->getEntity();

    if (!($entity instanceof ContentEntityInterface)) {
      return;
    }

    /** @var \Drupal\content_lock\ContentLock\ContentLock $contentLock */
    $contentLock = \Drupal::service('content_lock');

    $entity_id = $entity->id();
    if ($entity_id === NULL) {
      return;
    }

    // Release all locks on this entity to allow deletion.
    $contentLock->release(
      (int) $entity_id,
      $entity->language()->getId(),
      NULL,
      NULL,
      $entity->getEntityTypeId()
    );
  }

}
