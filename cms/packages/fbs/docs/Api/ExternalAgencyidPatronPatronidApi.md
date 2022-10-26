# DanskernesDigitaleBibliotek\FBS\ExternalAgencyidPatronPatronidApi

All URIs are relative to http://localhost.

Method | HTTP request | Description
------------- | ------------- | -------------
[**getFeesV2()**](ExternalAgencyidPatronPatronidApi.md#getFeesV2) | **GET** /external/agencyid/patron/patronid/fees/v2 | List of fees in FBS for the patron with all available information about the fee.


## `getFeesV2()`

```php
getFeesV2($includepaid, $includenonpayable): \DanskernesDigitaleBibliotek\FBS\Model\FeeV2[]
```

List of fees in FBS for the patron with all available information about the fee.

Returns array of fees.  <p>If the fee covers loaned materials, information about the materials is returned.  Each fee in the response includes a 'type', which is used to distinguish between different types of  fees.</p>  <p>If the material exists no more, which is the case for fees that are related to closed interlibraryloans,  then the fee is still returned, but without material information</p>  The list of available types currently is  <ul>  <li>fee</li>  <li>compensation</li>  </ul>  <p>While the type can be used by client systems to look up a suitable display message for the end user, it is  important that unrecognized types are treated as 'other'.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronPatronidApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$includepaid = True; // bool | true if all paid/unpaid fees should be included, false if only unpaid fees should                     be included; default=false
$includenonpayable = True; // bool | true if fees that are not payable through a CMS system should be included (for read                           only access); default=false

try {
    $result = $apiInstance->getFeesV2($includepaid, $includenonpayable);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronPatronidApi->getFeesV2: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **includepaid** | **bool**| true if all paid/unpaid fees should be included, false if only unpaid fees should                     be included; default&#x3D;false |
 **includenonpayable** | **bool**| true if fees that are not payable through a CMS system should be included (for read                           only access); default&#x3D;false |

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\FeeV2[]**](../Model/FeeV2.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
