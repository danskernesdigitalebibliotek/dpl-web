<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\taxonomy\Entity\Term;

/**
 * Entity for BNF subscriptions.
 *
 * @ContentEntityType(
 *   id = "bnf_subscription",
 *   label = @Translation("Subscription"),
 *   plural_label = @Translation("Subscriptions"),
 *   base_table = "bnf_subscription",
 *   admin_permission = "bnf manage subscriptions",
 *   links = {
 *      "collection" = "/admin/bnf/subscriptions",
 *      "add-form" = "/admin/bnf/subscriptions/create",
 *      "edit-form" = "/admin/bnf/subscriptions/{bnf_subscription}/edit",
 *      "delete-form" = "/admin/bnf/subscriptions/{bnf_subscription}/delete",
 *    },
 *   handlers = {
 *     "list_builder" = "Drupal\bnf_client\SubscriptionListBuilder",
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "views_data" = "Drupal\views\EntityViewsData",
 *     "route_provider" = {
 *       "html" = "Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *     },
 *     "form" = {
 *        "default" = "Drupal\bnf_client\Entity\Form\SubscriptionForm",
 *        "add" = "Drupal\bnf_client\Entity\Form\SubscriptionForm",
 *        "edit" = "Drupal\bnf_client\Entity\Form\SubscriptionForm",
 *        "delete" = "Drupal\Core\Entity\ContentEntityDeleteForm",
 *      },
 *   },
 *
 *   entity_keys = {
 *     "id" = "uuid",
 *     "label" = "label",
 *   },
 * )
 */
class Subscription extends ContentEntityBase implements ContentEntityInterface {

  /**
   * Flag to tell the update hook not to queue a new content check.
   */
  public bool $noCheck = FALSE;

  /**
   * {@inheritDoc}
   *
   * @param array<string, mixed> $values
   *   An array of values to set, keyed by property name.
   */
  public function __construct(array $values = []) {
    parent::__construct($values, 'bnf_subscription');
  }

  /**
   * Static function for getting BaseFieldDefinitions. Used in update hooks.
   *
   * See bnf_client_update_10103() as an example.
   *
   * @return \Drupal\Core\Field\BaseFieldDefinition[]
   *   Named array of BaseFieldDefinitions.
   */
  public static function getBaseFields(): array {
    $fields = [];

    $fields['uuid'] = BaseFieldDefinition::create('uuid')
      ->setLabel('UUID')
      ->setDescription('Primary identifier.')
      ->setRequired(TRUE);

    // Using an 'uuid' would seem obvious, but the UUID field generates a new
    // UUID as default value, so to avoid accidentally generating an UUID, we
    // use 'string' instead.
    $fields['subscription_uuid'] = BaseFieldDefinition::create('string')
      ->setLabel('Subscription UUID')
      ->setDescription('The UUID subscribed to.')
      ->setRequired(TRUE);

    $fields['label'] = BaseFieldDefinition::create('string')
      ->setLabel('Label')
      ->setDescription('The name of this subscription - defaults to the original label.')
      ->setRequired(FALSE)
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 10,
      ]);
    ;

    $fields['categories'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel('Categories')
      ->setDescription("The categories, to be added to content created with this subscription.")
      ->setSetting('target_type', 'taxonomy_term')
      ->setSetting('handler', 'default')
      ->setSetting('handler_settings', [
        'target_bundles' => ['categories' => 'categories'],
      ])
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 10,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => 60,
          'autocomplete_type' => 'categories',
          'placeholder' => '',
        ],
      ])
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'entity_reference_label',
        'weight' => 10,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['tags'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel('Tags')
      ->setDescription("The tags, to be added to content created with this subscription.")
      ->setSetting('target_type', 'taxonomy_term')
      ->setSetting('handler', 'default')
      ->setSetting('handler_settings', [
        'target_bundles' => ['tags' => 'tags'],
      ])
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 10,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => 60,
          'autocomplete_type' => 'tags',
          'placeholder' => '',
        ],
      ])
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'entity_reference_label',
        'weight' => 11,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel('Created')
      ->setDescription('The timestamp the subscription was made.');

    $fields['last'] = BaseFieldDefinition::create('timestamp')
      ->setLabel('Last seen')
      ->setDescription('The timestamp of the last synced content.');

    return $fields;
  }

  /**
   * {@inheritDoc}
   */
  #[\Override]
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type): array {
    return self::getBaseFields();
  }

  /**
   * Getting terms.
   *
   * @return \Drupal\taxonomy\Entity\Term[]
   *   An array of taxonomy term entities.
   */
  private function getTerms(string $vid): array {
    $terms = [];
    foreach ($this->get($vid)->referencedEntities() as $term) {
      if ($term instanceof Term) {
        $terms[] = $term;
      }
    }
    return $terms;
  }

  /**
   * Set terms applied to content imported via this subscription.
   *
   * @param string $vid
   *   The name of the vocabulary of the terms being set.
   * @param \Drupal\taxonomy\Entity\Term[]|int[] $terms
   *   An array of taxonomy term entities, or term IDs.
   */
  private function setTerms(string $vid, array $terms): void {
    $target_ids = [];
    foreach ($terms as $term) {
      if ($term instanceof Term) {
        $target_ids[] = ['target_id' => $term->id()];
      }

      if (is_int($term)) {
        $target_ids[] = ['target_id' => $term];
      }
    }

    $this->set($vid, $target_ids);
  }

  /**
   * Get referenced tags.
   *
   * @return \Drupal\taxonomy\Entity\Term[]
   *   An array of taxonomy term entities.
   */
  public function getTags(): array {
    return $this->getTerms('tags');
  }

  /**
   * Set tags.
   *
   * @param \Drupal\taxonomy\Entity\Term[] $tags
   *   An array of taxonomy term entities.
   */
  public function setTags(array $tags): void {
    $this->setTerms('tags', $tags);
  }

  /**
   * Get referenced categories.
   *
   * @return \Drupal\taxonomy\Entity\Term[]
   *   An array of taxonomy term entities.
   */
  public function getCategories(): array {
    return $this->getTerms('categories');
  }

  /**
   * Set categories.
   *
   * @param \Drupal\taxonomy\Entity\Term[] $categories
   *   An array of taxonomy term entities.
   */
  public function setCategories(array $categories): void {
    $this->setTerms('categories', $categories);
  }

  /**
   * Get the UUID subscribed to.
   */
  public function getSubscriptionUuid(): string {
    return $this->subscription_uuid->value;
  }

  /**
   * Get timestamp of the last synced content.
   */
  public function getLast(): int {
    return (int) ($this->last->value ?? 0);
  }

  /**
   * Set timestamp of the last synced content.
   */
  public function setLast(int $last): void {
    $this->last->value = $last;
  }

}
