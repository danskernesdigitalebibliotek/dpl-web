<?php

namespace Drupal\dpl_app\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Schema extension for App Fees and Payment Info.
 *
 * @SchemaExtension(
 *   id = "dpl_app_fees_and_payment_info",
 *   name = "App Fees and Payment Info",
 *   description = "Add the app fees and payment info query.",
 *   schema = "graphql_compose"
 * )
 */
class AppFeesAndPaymentInfoExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('Query', 'getAppFeesAndPaymentInfo',
      $builder->produce('app_fees_and_payment_info')
    );

    $registry->addFieldResolver('AppFeesAndPaymentInfo', 'feesAndReplacementCostsUrl',
      $builder->callback(function ($value) {
        return $value['feesAndReplacementCostsUrl'] ?? NULL;
      })
    );

    $registry->addFieldResolver('AppFeesAndPaymentInfo', 'paymentSiteUrl',
      $builder->callback(function ($value) {
        return $value['paymentSiteUrl'] ?? NULL;
      })
    );

    $registry->addFieldResolver('AppFeesAndPaymentInfo', 'paymentSiteButtonLabel',
      $builder->callback(function ($value) {
        return $value['paymentSiteButtonLabel'] ?? NULL;
      })
    );
  }

}
