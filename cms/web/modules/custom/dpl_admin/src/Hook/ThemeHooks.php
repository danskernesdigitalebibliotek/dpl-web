<?php

declare(strict_types=1);

namespace Drupal\dpl_admin\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Render\Markup;
use Drupal\Core\Routing\AdminContext;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\views\Plugin\views\field\EntityField;
use Drupal\views\ResultRow;
use Drupal\views\ViewExecutable;

/**
 * Theme hooks and preprocess for dpl_admin module.
 */
class ThemeHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected AdminContext $adminContext,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add classes and libraries.
   *
   * Sets a class to tell our admin.scss that we're on an admin page, and also
   * loading our custom admin CSS.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_html')]
  public function preprocessHtml(array &$variables): void {
    $variables['#attached']['library'][] = 'dpl_admin/frontend';

    if (!$this->adminContext->isAdminRoute()) {
      return;
    }

    $variables['attributes']['class'][] = 'is-admin-page';
    $variables['#attached']['library'][] = 'dpl_admin/base';
  }

  /**
   * Add info about locked content to content view.
   *
   * @phpstan-ignore missingType.iterableValue (variables too complex)
   */
  #[Hook('preprocess_views_view_field')]
  public function preprocessViewsViewField(array &$variables): void {
    if (
      !isset($variables['view'], $variables['field']) ||
      !$variables['view'] instanceof ViewExecutable ||
      !$variables['field'] instanceof EntityField
    ) {
      return;
    }

    if ($variables['view']->id() == 'content' &&
      $variables['field']->getField() == '.name') {
      $this->preprocessViewsViewFieldContentName($variables);
    }
  }

  /**
   * Preprocess the author field in the "content" admin view.
   *
   * Add information if the content is locked by another user.
   *
   * @phpstan-ignore missingType.iterableValue (variables too complex)
   */
  protected function preprocessViewsViewFieldContentName(array &$variables) : void {
    if (
      !isset($variables['output'], $variables['row']) ||
      !$variables['row'] instanceof ResultRow ||
      !$variables['output'] instanceof Markup
    ) {
      return;
    }

    /** @var \Drupal\user\UserInterface|null $content_lock_owner */
    $content_lock_owner = $variables['row']->_relationship_entities['uid_1'] ?? NULL;

    if (!$content_lock_owner) {
      return;
    }

    $variables['output'] = Markup::create("
      {$variables['output']}
      <br/>
      <small>" .
      $this->t('(Locked by @username)', ['@username' => $content_lock_owner->toLink()->toString()], ["context" => "DPL admin UX"]) .
      "</small>"
    );
  }

}
