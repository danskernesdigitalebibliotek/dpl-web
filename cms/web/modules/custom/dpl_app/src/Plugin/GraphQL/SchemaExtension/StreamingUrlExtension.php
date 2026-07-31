<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Videotool extensions.
 *
 * @SchemaExtension(
 *   id = "dpl_app_videotool",
 *   name = "Videotool extensions",
 *   description = "Exposes Videotool stream URL via GraphQL",
 *   schema = "graphql_compose"
 * )
 */
class StreamingUrlExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $videotoolTypes = ['MediaVideotool', 'MediaVideotoolVertical'];
    foreach ($videotoolTypes as $type) {
      $registry->addFieldResolver($type, 'streamingUrl',
        $builder->produce('dpl_app_stream_url')
          ->map('media', $builder->fromParent())
      );
    }
  }

}
