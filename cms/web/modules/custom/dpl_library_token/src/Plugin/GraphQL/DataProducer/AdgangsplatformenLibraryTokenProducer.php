<?php

namespace Drupal\dpl_library_token\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Exposes an Adgangsplatformen library token.
 *
 * If a token has been generated, it will be returned. Otherwise,
 * NULL is returned.
 *
 * @DataProducer(
 *   id = "adgangsplatformen_library_token_producer",
 *   name = "Adgangsplatformen Library Token Producer",
 *   description = "Exposes access tokens.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class AdgangsplatformenLibraryTokenProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Creates an instance of the producer using dependency injection.
   *
   * This method ensures the necessary services, such as the logger and importer
   * are available for processing the import request.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get(id: 'dpl_library_token.handler'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected LibraryTokenHandler $libraryTokenHandler,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Transforms an RFC3339 formatted date string into Drupal GraphQL datetime.
   *
   * @param string $expire
   *   The date the token expires in RFC3339 format.
   *
   * @return mixed[]
   *   The formatted date array.
   */
  protected function formatExpireDate(string $expire): array {
    $dateTime = new DrupalDateTime($expire);
    return [
      'timestamp' => $dateTime->getTimestamp(),
      'timezone' => $dateTime->getTimezone()->getName(),
      'offset' => $dateTime->format('P'),
      'time' => $dateTime->format(\DateTime::RFC3339),
    ];
  }

  /**
   * Resolves the library access token.
   *
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   Field context.
   */
  public function resolve(FieldContext $field_context): object | null {
    $field_context->addCacheableDependency((new CacheableMetadata())->setCacheMaxAge(0));
    $token = $this->libraryTokenHandler->getToken();
    return $token ? (object) [
      'token' => $token->token,
      'expire' => $this->formatExpireDate($token->expiresAt),
    ] : NULL;
  }

}
