<?php

namespace Drupal\dpl_mail\Config;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;

use function Safe\parse_url;

/**
 * Azure Mailer configuration override.
 */
class AzureMailerConfigOverrides implements ConfigFactoryOverrideInterface {

  /**
   * {@inheritdoc}
   */
  public function loadOverrides($names) {
    return $this->getAzureMailerSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheSuffix() {
    return __CLASS__;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata($name) {
    return new CacheableMetadata();
  }

  /**
   * {@inheritdoc}
   */
  public function createConfigObject($name, $collection = StorageInterface::DEFAULT_COLLECTION) {
    return NULL;
  }

  /**
   * Get Azure Mailer settings from environment variable.
   *
   * @return mixed[]
   *   The Azure Mailer settings.
   */
  public function getAzureMailerSettings(): array {
    $config = [];
    if (!$azure_mail_connection_string = getenv('AZURE_MAIL_CONNECTION_STRING')) {
      return $config;
    }

    // Split the connection string by the ';' delimiter.
    $parts = explode(';', $azure_mail_connection_string);
    array_map(function ($element) use (&$config) {
      [$key, $value] = explode('=', $element, 2);

      switch ($key) {
        case 'endpoint':
          $config['azure_mailer.settings']['endpoint'] = parse_url($value, PHP_URL_HOST);
          break;

        case 'accesskey':
          $config['azure_mailer.settings']['secret'] = $value;
          break;
      }

    }, $parts);

    return $config;
  }

}
