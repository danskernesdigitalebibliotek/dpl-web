<?php

declare(strict_types=1);

namespace Drupal\dpl_opening_hours\Hook;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Drupal\paragraphs\ParagraphInterface;

/**
 * Theme hooks for dpl_opening_hours module.
 */
class ThemeHooks {

  use StringTranslationTrait;

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add the opening hours app to opening hours paragraphs on branch pages.
   *
   * @param array<mixed> $variables
   *   Variables for the paragraph template, including the 'paragraph' entity.
   */
  #[Hook('preprocess_paragraph__opening_hours')]
  public function addOpeningHoursApp(array &$variables): void {
    $paragraph = $variables['paragraph'] ?? NULL;
    if (!$paragraph instanceof ParagraphInterface) {
      return;
    }

    $parentNode = $paragraph->getParentEntity();
    if ($parentNode && $parentNode->bundle() === 'branch') {
      $branchId = $parentNode->id();

      // Prepare variables for the React app.
      $variables['react_app_opening_hours'] = [
        '#theme' => 'dpl_react_app',
        '#name' => 'opening-hours',
        '#data' => [
          'branch-id' => $branchId,
          'opening-hours-heading-text' => $this->t('Opening Hours', [], ['context' => 'Opening Hours']),
          'show-opening-hours-for-week-text' => $this->t('Show opening hours for week', [], ['context' => 'Opening Hours']),
          'week-text' => $this->t('Week', [], ['context' => 'Opening Hours']),
          'library-is-closed-text' => $this->t('The library is closed this day', [], ['context' => 'Opening Hours']),
        ] + DplReactAppsController::externalApiBaseUrls(),
      ];
    }
  }

  /**
   * Add the opening hours sidebar apps to the page.
   *
   * Since there are two triggers to open the sidebar, two instances of the app
   * are required. The app will adjust its markup based on the `size` property.
   *
   * @param mixed[] $variables
   *   Theme variables.
   */
  #[Hook('preprocess_page')]
  public function addOpeningHoursSidebar(array &$variables): void {
    /** @var \Drupal\node\NodeInterface[] $branchNodes */
    $branchNodes = $this->entityTypeManager->getStorage('node')->loadByProperties(['type' => 'branch']);

    $openingHoursSidebarData = [
      'opening-hours-sidebar-branches-config' => $this->buildBranchesArray($branchNodes),
      'opening-hours-text' => $this->t('Opening hours', [], ['context' => 'Opening Hours sidebar']),
      'opening-hours-sidebar-title-text' => $this->t("Today's opening hours", [], ['context' => 'Opening Hours sidebar']),
      'opening-hours-sidebar-link-text' => $this->t('Go to @branchName', [], ['context' => 'Opening Hours sidebar']),
    ] + DplReactAppsController::externalApiBaseUrls();

    $variables['opening_hours_sidebar_large'] = [
      '#theme' => 'dpl_react_app',
      '#name' => 'opening-hours-sidebar',
      '#data' => $openingHoursSidebarData + ['size' => 'large'],
    ];
    $variables['opening_hours_sidebar_small'] = [
      '#theme' => 'dpl_react_app',
      '#name' => 'opening-hours-sidebar',
      '#data' => $openingHoursSidebarData + ['size' => 'small'],
    ];
  }

  /**
   * Builds an array of branch details.
   *
   * @param \Drupal\node\NodeInterface[] $branches
   *   An array of branch nodes.
   *
   * @return array<array{'branch_id': int|string|null, 'name': string|null,
   *   'link': string, 'promoted': bool}>
   *   An array of branch details.
   *
   * @throws \Drupal\Core\Entity\EntityMalformedException
   *   Thrown when the entity is malformed.
   */
  protected function buildBranchesArray(array $branches): array {
    $branchesArray = [];
    foreach ($branches as $branch) {
      $branchesArray[] = [
        'branch_id' => $branch->id(),
        'name' => $branch->getTitle(),
        'link' => $branch->toUrl()->toString(),
        'promoted' => (bool) $branch->get('field_promoted_on_lists')->value,
      ];
    }
    return $branchesArray;
  }

}
