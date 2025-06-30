<?php

namespace Drupal\dpl_media_cleanup\Services;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\media\MediaInterface;

/**
 * Keeping the media-library in order.
 */
class MediaCleanup {

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected EntityTypeBundleInfoInterface $bundleInfo,
    protected EntityFieldManagerInterface $fieldManager,
    protected Connection $connection,
  ) {}

  /**
   * The revision notice that we can use later for look up.
   */
  const CLEANUP_NOTICE_TEXT = 'Unpublished for duplicate cleanup (DPL Media Cleanup)';

  /**
   * Find media IDs that previously were archived.
   *
   * @return array<int|string>
   *   The matching media IDs.
   */
  public function getArchivedMediaIds(): array {
    $query = $this->entityTypeManager->getStorage('media')->getQuery();

    return $query
      // We are looking up unpublished nodes, so we want no access check.
      ->accessCheck(FALSE)
      ->condition('status', 0)
      ->condition('revision_log_message', $this::CLEANUP_NOTICE_TEXT)
      ->execute();
  }

  /**
   * Hiding the media from the media-library.
   *
   * NOTICE: media will still show up as part of getDuplicateMedias().
   */
  public function archiveMedia(MediaInterface $media): void {
    // By unpublishing and setting to be owned by the admin user, we can be sure
    // that the medias are hidden from 'normal' editors.
    $media->setUnpublished();
    $media->setOwnerId(1);

    // newRevision is necessary for us to be able to put a revision message.
    $media->setNewRevision();
    $media->setRevisionLogMessage($this::CLEANUP_NOTICE_TEXT);
    $media->save();
  }

  /**
   * Finding medias that both references duplicate files, and are orphaned.
   *
   * @return array<int|string>
   *   The orphaned, duplicate media IDs that should be safe to delete/archive.
   */
  public function getDuplicateOrphanedMediaIds(): array {
    $mediaIds = $this->findDuplicateMediaIds();

    return $this->checkForOrphanedMedias($mediaIds);
  }

  /**
   * Finding medias that references duplicate files.
   *
   * @return array<int|string>
   *   The duplicate media IDs.
   */
  public function findDuplicateMediaIds() {
    // Find all file IDs, that are referenced in more than one media.
    $duplicateFids = $this->connection->select('media__field_media_image', 'mfi')
      ->fields('mfi', ['field_media_image_target_id'])
      ->groupBy('field_media_image_target_id')
      ->having('COUNT(entity_id) > 1')
      ->execute();

    // PHPStan gets confused that $duplicateFids might be NULL, but in reality
    // it won't be - and if it is, we do want an exception to be thrown.
    // @phpstan-ignore-next-line
    $duplicateFids = $duplicateFids->fetchCol();

    if (empty($duplicateFids)) {
      return [];
    }

    // Find all medias that actually reference the duplicated file IDs.
    $mediaIds = $this->connection->select('media__field_media_image', 'mfi')
      ->fields('mfi', ['entity_id'])
      ->condition('mfi.field_media_image_target_id', $duplicateFids, 'IN')
      ->execute();

    // PHPStan gets confused that $duplicateFids might be NULL, but in reality
    // it won't be - and if it is, we do want an exception to be thrown.
    // @phpstan-ignore-next-line
    $mediaIds = $mediaIds->fetchCol();

    if (empty($mediaIds)) {
      return [];
    }

    return $mediaIds;
  }

  /**
   * Find out which supplied media IDs are also orphaned.
   *
   * @param array<int|string> $mediaIds
   *   The media IDs we want to check.
   *
   * @return array<int|string>
   *   The supplied media IDs that are orphaned.
   */
  public function checkForOrphanedMedias(array $mediaIds) {
    if (empty($mediaIds)) {
      return [];
    }

    $tables = $this->getFieldTables();
    $usedMediaIds = [];

    foreach ($tables as $table => $field) {
      // Looking up if there are any entities that reference the duplicate
      // media IDs.
      $tableMediaIds = $this->connection->select($table, 't')
        ->fields('t', [$field])
        ->condition($field, $mediaIds, 'IN')
        ->execute();

      // PHPStan gets confused that $duplicateFids might be NULL, but in reality
      // it won't be - and if it is, we do want an exception to be thrown.
      // @phpstan-ignore-next-line
      $tableMediaIds = $tableMediaIds->fetchCol();

      $usedMediaIds = array_merge($usedMediaIds, $tableMediaIds);
    }

    // Finding any medias that have duplicates, but also aren't referenced
    // in any entities AKA orphaned.
    $usedMediaIds = array_unique($usedMediaIds);

    return array_values(array_diff($mediaIds, $usedMediaIds));
  }

  /**
   * Getting the tables and fields to look up media data.
   *
   * @return array<string>
   *   table-name => field-name.
   */
  protected function getFieldTables(): array {
    $tables = [];
    $definitions = $this->entityTypeManager->getDefinitions();

    // Go through all the different entity types (paragraphs, nodes, etc.)
    foreach ($definitions as $entityTypeId => $definition) {
      $entityClass = $definition->getClass();

      // Skip entities that cannot reference the medias.
      if (!is_subclass_of($entityClass, FieldableEntityInterface::class)) {
        continue;
      }

      $entityBundles = array_keys($this->bundleInfo->getBundleInfo($entityTypeId));

      // Looping through each bundle of the entity types (articles, pages, etc.)
      foreach ($entityBundles as $bundle) {
        $fields = $this->fieldManager->getFieldDefinitions($entityTypeId, $bundle);

        // Going through all fields that exists on this bundle, and see if it is
        // a media-reference.
        foreach ($fields as $field) {
          if (!in_array($field->getType(), ['entity_reference', 'entity_reference_revisions'])
              || $field->getSetting('target_type') !== 'media') {
            continue;
          }

          $fieldName = $field->getName();
          $table = "{$entityTypeId}__{$fieldName}";

          if ($this->connection->schema()->tableExists($table)) {
            $tables[$table] = "{$fieldName}_target_id";
          }
        }
      }
    }

    return $tables;
  }

}
