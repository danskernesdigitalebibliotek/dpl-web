# DanskernesDigitaleBibliotek\FBS\ExternalAgencyidCatalogApi

All URIs are relative to http://localhost.

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAvailabilityV3()**](ExternalAgencyidCatalogApi.md#getAvailabilityV3) | **GET** /external/agencyid/catalog/availability/v3 | Get availability of bibliographical records.
[**getHoldingsV3()**](ExternalAgencyidCatalogApi.md#getHoldingsV3) | **GET** /external/agencyid/catalog/holdings/v3 | Get placement holdings for bibliographical records.


## `getAvailabilityV3()`

```php
getAvailabilityV3($recordid, $exclude): \DanskernesDigitaleBibliotek\FBS\Model\AvailabilityV3[]
```

Get availability of bibliographical records.

Returns an array of availability for each bibliographical record.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidCatalogApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$recordid = array('recordid_example'); // string[] | list of record ids
$exclude = array('exclude_example'); // string[] | Identifies the branchIds which are excluded from the result

try {
    $result = $apiInstance->getAvailabilityV3($recordid, $exclude);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidCatalogApi->getAvailabilityV3: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **recordid** | [**string[]**](../Model/string.md)| list of record ids |
 **exclude** | [**string[]**](../Model/string.md)| Identifies the branchIds which are excluded from the result | [optional]

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\AvailabilityV3[]**](../Model/AvailabilityV3.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `getHoldingsV3()`

```php
getHoldingsV3($recordid, $exclude): \DanskernesDigitaleBibliotek\FBS\Model\HoldingsForBibliographicalRecordV3[]
```

Get placement holdings for bibliographical records.

Returns an array of holdings for each bibliographical record.  The holdings lists the materials on each placement, and whether they are available on-shelf or lent out.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidCatalogApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$recordid = array('recordid_example'); // string[] | Identifies the bibliographical records - The FAUST number.
$exclude = array('exclude_example'); // string[] | Identifies the branchIds which are excluded from the result

try {
    $result = $apiInstance->getHoldingsV3($recordid, $exclude);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidCatalogApi->getHoldingsV3: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **recordid** | [**string[]**](../Model/string.md)| Identifies the bibliographical records - The FAUST number. |
 **exclude** | [**string[]**](../Model/string.md)| Identifies the branchIds which are excluded from the result | [optional]

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\HoldingsForBibliographicalRecordV3[]**](../Model/HoldingsForBibliographicalRecordV3.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
