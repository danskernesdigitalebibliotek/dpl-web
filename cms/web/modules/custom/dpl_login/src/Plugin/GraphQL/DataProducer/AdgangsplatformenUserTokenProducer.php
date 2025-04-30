<?php

namespace Drupal\dpl_login\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_login\UserTokens;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Exposes an Adgangsplatformen user token.
 *
 * If a patron has been authenticated an access token should be available.
 * Otherwise NULL is returned.
 *
 * @DataProducer(
 *   id = "adgangsplatformen_user_token_producer",
 *   name = "Adgangsplatformen User Token Producer",
 *   description = "Exposes user access tokens.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class AdgangsplatformenUserTokenProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
      $container->get('dpl_login.user_tokens'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected UserTokens $userTokens,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Transforms a unix date into Drupal GraphQL datetime.
   *
   * @param int $expire
   *   The unix timestamp of the expiration date.
   *
   * @return mixed[]
   *   The formatted date array.
   */
  protected function formatExpireDate(int $expire): array {
    $dateTime = DrupalDateTime::createFromTimestamp($expire);
    return [
      'timestamp' => $dateTime->getTimestamp(),
      'timezone' => $dateTime->getTimezone()->getName(),
      'offset' => $dateTime->format('P'),
      'time' => $dateTime->format(\DateTime::RFC3339),
    ];
  }

  /**
   * Resolves the access token based on the token type.
   *
   * @return mixed[] | null
   *   Token and expiration date.
   */
  public function resolve(FieldContext $field_context): array | null {
    $field_context->addCacheableDependency((new CacheableMetadata())->setCacheMaxAge(0));
    if (!$token = $this->userTokens->getCurrent()) {
      return NULL;
    }

    return [
      'token' => $token->token,
      'expire' => $this->formatExpireDate($token->expire),
    ];
  }

}
