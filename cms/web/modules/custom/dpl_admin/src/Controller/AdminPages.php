<?php

namespace Drupal\dpl_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Custom admin pages.
 */
class AdminPages extends ControllerBase {

  /**
   * The entity type interface.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): AdminPages|static {
    return new static(
      $container->get('entity_type.manager'),
    );
  }

  /**
   * The 'add content' overview page, displaying options for the editors.
   *
   * @return array<mixed>
   *   A render array, for displaying the page.
   */
  public function addContentPage(): array {

    // 'Create from scratch' links - used in the admin block below.
    $create_links = [
      [
        'title' => $this->t('Event series', [], ['context' => 'DPL admin UX']),
        'url' => Url::fromRoute('entity.eventseries.add_page'),
        'description' => $this->t('Use event series to create event instances - you can use series, both to create reoccurring events, and single events.', [], ['context' => 'DPL admin UX']),
      ],
    ];

    $node_types = $this->entityTypeManager->getStorage('node_type')->loadMultiple();

    // Adding a link to each node type.
    foreach ($node_types as $node_type) {
      $create_links[] = [
        'title' => $node_type->label(),
        'url' => Url::fromRoute('node.add', ['node_type' => $node_type->id()]),
        'description' => $node_type->getDescription(),
      ];
    }

    return [
      '#theme' => 'container',
      '#attributes' => [
        'class' => ['layout-row', 'clearfix', 'dpl-add-content'],
      ],
      '#children' => [
        [
          '#theme' => 'admin_block',
          '#prefix' => '<div class="layout-column layout-column--half">',
          '#suffix' => '</div>',
          '#block' => [
            'title' => $this->t('Create content from scratch', [], ['context' => 'DPL admin UX']),
            'content' => [
              '#theme' => 'admin_block_content',
              '#content' => $create_links,
            ],
          ],
        ],
        // Displaying the available clone templates.
        [
          '#theme' => 'admin_block',
          '#prefix' => '<div class="layout-column layout-column--half">',
          '#suffix' => '</div>',
          '#block' => [
            'title' => $this->t('Create content from templates', [], ['context' => 'DPL admin UX']),
            'content' => [
              '#type' => 'view',
              '#name' => 'entity_clone_template',
              '#display_id' => 'block',
            ],
          ],
        ],
      ],
    ];
  }

}
