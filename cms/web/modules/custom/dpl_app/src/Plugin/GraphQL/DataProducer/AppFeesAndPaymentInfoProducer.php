<?php

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\dpl_fees\DplFeesSettings;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\preg_match;

/**
 * Gets fees and payment info for the app.
 *
 * @DataProducer(
 *   id = "app_fees_and_payment_info",
 *   name = @Translation("App fees and payment info"),
 *   description = @Translation("Returns the app fees and payment info settings."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("App Fees and Payment Info")
 *   )
 * )
 */
class AppFeesAndPaymentInfoProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The DPL fees settings.
   *
   * @var \Drupal\dpl_fees\DplFeesSettings
   */
  protected DplFeesSettings $feesSettings;

  /**
   * Constructs an AppFeesAndPaymentInfoProducer object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_fees\DplFeesSettings $feesSettings
   *   The DPL fees settings service.
   */
  public function __construct(array $configuration, string $plugin_id, $plugin_definition, DplFeesSettings $feesSettings) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->feesSettings = $feesSettings;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_fees.settings')
    );
  }

  /**
   * Resolves the app fees and payment info.
   *
   * @return array{feesAndReplacementCostsUrl: ?string, paymentSiteUrl: ?string,
   *   paymentSiteButtonLabel: ?string}
   *   The fees and payment info.
   */
  public function resolve(): array {
    return [
      'feesAndReplacementCostsUrl' => $this->ensureAbsoluteUrl($this->feesSettings->getFeesAndReplacementCostsUrl()),
      'paymentSiteUrl' => $this->ensureAbsoluteUrl($this->feesSettings->getPaymentSiteUrl()),
      'paymentSiteButtonLabel' => $this->feesSettings->getFeeListConfig()['paymentSiteButtonLabel'] ?? '',
    ];
  }

  /**
   * Ensure string is an absolute URL.
   */
  protected function ensureAbsoluteUrl(?string $url): ?string {
    if (empty($url)) {
      return NULL;
    }

    try {
      if (preg_match('/^https?:/', $url)) {
        return $url;
      }
      elseif (str_starts_with($url, '/')) {
        return Url::fromUserInput($url)->setAbsolute()->toString();
      }
    }
    catch (\Exception $e) {
      // Do nothing.
    }

    return NULL;
  }

}
