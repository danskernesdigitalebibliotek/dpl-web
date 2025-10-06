<?php

namespace Drupal\dpl_event\Form;

use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_event\Entity\EventInstance;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Allow editors to copy all the values to an eventinstance from its series.
 */
class CopyInheritedForm implements FormInterface, ContainerInjectionInterface {
  use StringTranslationTrait;
  use AutowireTrait;

  /**
   * The entities we want to *copy* and not reference.
   *
   * @var array|string[]
   *
   * As an example - if we do not copy paragraphs, editing an instance can
   * suddenly also affect the series without it being intended by the editor.
   */
  public array $copyableEntityTypes = ['paragraph'];

  public function __construct(
    protected RouteMatchInterface $routeMatch,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected MessengerInterface $messenger,
    #[Autowire(service: 'dpl_event.logger')]
    protected LoggerInterface $logger,
  ) {}

  /**
   * {@inheritDoc}
   */
  public function getFormId() {
    return 'dpl_event_copy_inherited_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Finding the eventinstance from the route parameter.
    // This gets sent along automatically as we come from events/{ID}/edit.
    $id = $this->routeMatch->getParameter('eventinstance');
    $event_storage = $this->entityTypeManager->getStorage('eventinstance');
    $instance = $event_storage->load($id);

    if (!($instance instanceof EventInstance)) {
      $this->messenger->addError($this->t(
        'Could not find event-instance with id @id',
        ['@id' => $id],
        ['context' => 'dpl_event']
      ));
      return $form;
    }

    $form_state->set('instance', $instance);
    $form_state->set('series', $instance->getEventSeries());

    $form['overwrite_existing'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Overwrite any existing values', [], ['context' => 'dpl_event']),
    ];

    $form['actions'] = [
      '#type' => 'actions',

      'submit' => [
        '#type' => 'submit',
        '#value' => $this->t('Copy values to instance', [], ['context' => 'dpl_event']),
      ],
    ];

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    // Method stub necessary for FormInterface.
  }

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    /** @var \Drupal\dpl_event\Entity\EventInstance $instance */
    $instance = $form_state->get('instance');

    /** @var \Drupal\recurring_events\Entity\EventSeries $series */
    $series = $form_state->get('series');

    $allow_overwrites = $form_state->getValue('overwrite_existing');

    // Looping through the instances fields, and find out which have set up
    // field inheritance.
    $fields = $instance->getFields();
    $inherited_fields = [];

    foreach ($fields as $field) {
      $plugin = (string) $field->getSetting('plugin');

      // Is there a cleaner way of doing this?
      if (str_ends_with($plugin, 'inheritance')) {
        $inherited_fields[] = $field;
      }
    }

    // Looping through the inherited fields we've found.
    // Look up the source value, and set it, depending on the overwrite option.
    foreach ($inherited_fields as $field) {
      // These settings come from the field_inheritance module.
      $destination_name = $field->getSetting('destination field');
      $source_name = $field->getSetting('source field');

      if (!$instance->hasField($destination_name) ||
          !$series->hasField($source_name)) {
        continue;
      }

      $source = $series->get($source_name);
      $source_value = $source->getValue();
      $destination = $instance->get($destination_name);

      // If values already exist on the instance, and the editor has chosen
      // *NOT* to overwrite them, we'll skip this field.
      if (empty($allow_overwrites) && !$destination->isEmpty()) {
        continue;
      }

      // Getting the target type of entity reference fields.
      $target_type = $destination->getSetting('target_type');

      // @see $this->copyableEntityTypes.
      if (in_array($target_type, $this->copyableEntityTypes)) {
        $source_value = $this->getCopiedReferences($source);
      }

      $instance->set($destination_name, $source_value);
    }

    $instance->save();
    $form_state->setRedirect('entity.eventinstance.edit_form', ['eventinstance' => $instance->id()]);
    $this->messenger->addStatus($this->t('Values has been copied and saved from series.', [], ['context' => 'dpl_event']));
  }

  /**
   * Returns copied entities from an entity reference field.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface<\Drupal\Core\Field\FieldItemInterface> $field
   *   The reference field.
   *
   * @return \Drupal\Core\Entity\FieldableEntityInterface[]
   *   The copied (and orphaned) entities.
   */
  protected function getCopiedReferences(FieldItemListInterface $field): array {
    $entities = $field->referencedEntities();

    $copies = [];

    foreach ($entities as $entity) {
      if (!($entity instanceof FieldableEntityInterface)) {
        continue;
      }

      $entity_type = $entity->getEntityTypeId();

      // Getting all the values in a format we can use in $storage->create().
      $values = $entity->toArray();

      // Unsetting ID values, that we want ->create() to fill out dynamically.
      unset($values['id']);
      unset($values['uuid']);
      unset($values['revision_id']);
      unset($values['parent_id']);

      $storage = $this->entityTypeManager->getStorage($entity_type);

      /** @var \Drupal\Core\Entity\FieldableEntityInterface $entity_copy */
      $entity_copy = $storage->create($values);

      // This entity might *also* have entity reference fields, which we might
      // also want to copy. Example: paragraphs within paragraphs.
      foreach ($entity_copy->getFields() as $field) {
        $target_type = $field->getSetting('target_type');

        if (in_array($target_type, $this->copyableEntityTypes)) {
          $field_name = (string) $field->getName();
          $entity_copy->set($field_name, $this->getCopiedReferences($field));
        }
      }

      $entity_copy->save();
      $copies[] = $entity_copy;
    }

    return $copies;
  }

}
