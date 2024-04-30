<?php

namespace Drupal\dpl_event\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Service\SerializerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_rest_base\Plugin\RestResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Adding dpl_event specific dependencies to the REST controller.
 */
abstract class EventResourceBase extends RestResourceBase {

  /**
   * Constructor.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    protected SerializerInterface $serializer,
    protected EntityTypeManagerInterface $entityTypeManager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger, $serializer);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest'),
      $container->get('dpl_rest_base.serializer'),
      $container->get('entity_type.manager')
    );
  }

}
