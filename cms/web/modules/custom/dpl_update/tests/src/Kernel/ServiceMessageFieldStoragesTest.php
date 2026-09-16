<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_update\Kernel;

use Drupal\Core\Site\Settings;
use Drupal\KernelTests\KernelTestBase;
use Drupal\field\Entity\FieldStorageConfig;

/**
 * Tests that the service message field storages are created from the profile.
 *
 * The update exists because the configuration import creates the storages and
 * the field instances that point at them in one pass, and the instances
 * occasionally cannot see storages that young - see the update's own
 * documentation. Creating them a step earlier, in the update, is only worth
 * anything if it works on a site that does not have them yet, which is the
 * case no local environment offers: once a developer has run the update, the
 * fields are there and the update does nothing.
 *
 * So the case is made here. The update reads the definitions from the
 * profile's own configuration, which this test points it at.
 */
class ServiceMessageFieldStoragesTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'dpl_update',
    'drupal_typed',
    'field',
    'link',
    'node',
    'options',
    'system',
    'text',
    'user',
  ];

  /**
   * The fields the update is responsible for, and the type of each.
   *
   * @var array<string, string>
   */
  protected const FIELDS = [
    'field_svcmsg_body' => 'string',
    'field_svcmsg_branches' => 'entity_reference',
    'field_svcmsg_frontpage' => 'boolean',
    'field_svcmsg_heading' => 'string',
    'field_svcmsg_link' => 'link',
    'field_svcmsg_placement' => 'list_string',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('node');

    // The update reads the field definitions from the sync directory, which a
    // kernel test has none of. Point it at the profile's own configuration -
    // the files a deployment would import - so the test covers what ships.
    $settings = Settings::getAll();
    $settings['config_sync_directory'] = DRUPAL_ROOT . '/../config/sync';
    new Settings($settings);

    \Drupal::moduleHandler()->loadInclude('dpl_update', 'install');
  }

  /**
   * The update creates every storage, with its settings intact.
   */
  public function testCreatesTheFieldStorages(): void {
    foreach (array_keys(self::FIELDS) as $field_name) {
      $this->assertNull(
        FieldStorageConfig::loadByName('node', $field_name),
        "$field_name exists before the update runs"
      );
    }

    $message = dpl_update_update_10083();

    foreach (self::FIELDS as $field_name => $type) {
      $storage = FieldStorageConfig::loadByName('node', $field_name);

      $this->assertInstanceOf(FieldStorageConfig::class, $storage, "$field_name was not created");
      $this->assertSame($type, $storage->getType(), "$field_name has the wrong type");
      $this->assertStringContainsString($field_name, $message);
    }
  }

  /**
   * Settings survive the trip from configuration data into the entity.
   *
   * A `list_string` keeps its allowed values as a map of value to label and
   * writes them as a list of value/label pairs. Building the entity from the
   * written form without converting leaves the pairs in place, and the next
   * save runs them through the conversion a second time - which is how the
   * first version of this update died, with "The configuration property
   * settings.allowed_values.0.label.0 doesn't exist".
   */
  public function testKeepsListValuesInTheirEntityShape(): void {
    dpl_update_update_10083();

    $storage = FieldStorageConfig::loadByName('node', 'field_svcmsg_placement');
    $this->assertInstanceOf(FieldStorageConfig::class, $storage);

    $this->assertSame(
      ['global', 'in_page'],
      array_keys($storage->getSetting('allowed_values')),
      'The allowed values did not come back as a map keyed by value'
    );

    // The shape is only proven once it survives being written again: that is
    // the save the broken version never got to.
    $storage->save();

    $this->assertSame(
      ['global', 'in_page'],
      array_keys(FieldStorageConfig::loadByName('node', 'field_svcmsg_placement')->getSetting('allowed_values'))
    );
  }

  /**
   * Running the update twice leaves the second run with nothing to do.
   *
   * Sites that took the fields from an earlier import already have them, and
   * the update has to be a no-op there rather than a conflict.
   */
  public function testDoesNothingWhenTheStoragesExist(): void {
    dpl_update_update_10083();

    $this->assertSame('Service message field storages are already in place.', dpl_update_update_10083());
  }

}
