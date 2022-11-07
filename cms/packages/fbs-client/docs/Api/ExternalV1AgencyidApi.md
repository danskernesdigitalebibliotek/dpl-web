# DanskernesDigitaleBibliotek\FBS\ExternalV1AgencyidApi

All URIs are relative to http://localhost.

Method | HTTP request | Description
------------- | ------------- | -------------
[**getBranches()**](ExternalV1AgencyidApi.md#getBranches) | **GET** /external/v1/agencyid/branches | Get branches for an agency.


## `getBranches()`

```php
getBranches($exclude): \DanskernesDigitaleBibliotek\FBS\Model\AgencyBranch[]
```

Get branches for an agency.

Returns array of branches.  <p>Can be used for giving the patron the option of choosing a preferred branch or where to pick up  reservations.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$exclude = array('exclude_example'); // string[] | Identifies the branchIds which are excluded from the result

try {
    $result = $apiInstance->getBranches($exclude);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalV1AgencyidApi->getBranches: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exclude** | [**string[]**](../Model/string.md)| Identifies the branchIds which are excluded from the result | [optional]

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\AgencyBranch[]**](../Model/AgencyBranch.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
