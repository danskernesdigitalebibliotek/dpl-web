<?php

namespace Drupal\dpl_rest_base\Plugin;

use DanskernesDigitaleBibliotek\CMS\Api\Service\SerializerInterface;
use DanskernesDigitaleBibliotek\CMS\Api\Service\TypeMismatchException;
use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Base class for REST resources, with serializers.
 */
abstract class RestResourceBase extends ResourceBase {

  /**
   * Constructor for RestResourceBase class.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    protected SerializerInterface $serializer
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
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
    );
  }

  /**
   * Generate the format to use by the serializer from the request.
   */
  protected function serializerFormat(Request $request): string {
    $contentTypeFormat = $request->getContentTypeFormat();
    if (!$contentTypeFormat) {
      // Default to JSON format. Some code generators will not provide a default
      // value even though it is provided in the spec.
      $contentTypeFormat = $request->get('_format', 'json');
    }
    $mimeType = $request->getMimeType($contentTypeFormat);
    if (!$mimeType) {
      throw new \InvalidArgumentException("Unable to identify serializer format from content type form: $contentTypeFormat");
    }
    return $mimeType;
  }

  /**
   * Deserialize an HTTP request to an OpenAPI request.
   *
   * @param class-string<T> $className
   *   The required class name to deserialize to.
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming HTTP request to deserialize.
   *
   * @template T of object
   *
   * @return T
   *   The specified response.
   */
  protected function deserialize(string $className, Request $request): object {
    try {
      $requestData = $this->serializer->deserialize($request->getContent(), $className, $this->serializerFormat($request));
    }
    catch (TypeMismatchException $e) {
      throw new \InvalidArgumentException("Unable to deserialize request: {$e->getMessage()}");
    }
    if (!is_object($requestData) || !($requestData instanceof $className)) {
      throw new \InvalidArgumentException("Unable to deserialize request");
    }
    return $requestData;
  }

}
