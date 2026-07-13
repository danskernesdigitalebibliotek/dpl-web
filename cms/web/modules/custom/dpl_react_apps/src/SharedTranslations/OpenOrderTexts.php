<?php

namespace Drupal\dpl_react_apps\SharedTranslations;

/**
 * Translations for FBI openOrder (interlibrary loan) response statuses.
 *
 * One text per status the submitOrder mutation can return. The React
 * side resolves the status to a text key in translateOpenOrderStatus()
 * — a status without a matching text crashes the app, so every status
 * must be covered here. Kept as a shared class so any app that mounts
 * the reservation flow gets the complete set.
 */
class OpenOrderTexts {

  /**
   * Get the texts, keyed by their React text-prop key in kebab-case.
   *
   * @return array<string, \Drupal\Core\StringTranslation\TranslatableMarkup>
   *   The texts.
   */
  public static function texts(): array {
    return [
      'open-order-authentication-error-text' => t('An authentication error occurred', [], ['context' => 'Open order']),
      'open-order-error-missing-pincode-text' => t('Pincode is missing', [], ['context' => 'Open order']),
      'open-order-invalid-order-text' => t('The order is invalid', [], ['context' => 'Open order']),
      'open-order-no-servicerequester-text' => t('Service requester is missing', [], ['context' => 'Open order']),
      'open-order-not-owned-ill-loc-text' => t('Your material has been ordered from another library', [], ['context' => 'Open order']),
      'open-order-not-owned-no-ill-loc-text' => t('The material cannot be ordered from another library', [], ['context' => 'Open order']),
      'open-order-not-owned-wrong-ill-mediumtype-text' => t('This material type cannot be ordered from another library', [], ['context' => 'Open order']),
      'open-order-ors-error-text' => t('An error occurred while sending the order', [], ['context' => 'Open order']),
      'open-order-owned-own-catalogue-text' => t('Item available, order through the librarys catalogue', [], ['context' => 'Open order']),
      'open-order-owned-wrong-mediumtype-text' => t('Item available but medium type not accepted', [], ['context' => 'Open order']),
      'open-order-response-title-text' => t('Order from another library:', [], ['context' => 'Open order']),
      'open-order-service-unavailable-text' => t('Service is currently unavailable', [], ['context' => 'Open order']),
      'open-order-status-owned-accepted-text' => t('Your order is accepted', [], ['context' => 'Open order']),
      'open-order-unknown-error-text' => t('An unknown error occurred', [], ['context' => 'Open order']),
      'open-order-unknown-pickupagency-text' => t('Specified pickup agency not found', [], ['context' => 'Open order']),
      'open-order-unknown-user-text' => t('User not found', [], ['context' => 'Open order']),
      'open-order-user-blocked-by-agency-text' => t('You are blocked from making reservations at the library', [], ['context' => 'Open order']),
      'open-order-user-no-longer-exist-on-agency-text' => t('You are no longer registered at the pickup library', [], ['context' => 'Open order']),
      'open-order-user-not-verified-text' => t('Your user could not be verified', [], ['context' => 'Open order']),
    ];
  }

}
