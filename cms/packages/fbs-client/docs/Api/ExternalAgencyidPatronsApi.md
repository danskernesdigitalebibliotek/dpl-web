# DanskernesDigitaleBibliotek\FBS\ExternalAgencyidPatronsApi

All URIs are relative to http://localhost.

Method | HTTP request | Description
------------- | ------------- | -------------
[**createV4()**](ExternalAgencyidPatronsApi.md#createV4) | **POST** /external/agencyid/patrons/v4 | Create a new patron who is a person.
[**createWithGuardian()**](ExternalAgencyidPatronsApi.md#createWithGuardian) | **POST** /external/agencyid/patrons/withGuardian/v1 | Creates a person patron with a guardian (eg A financial responsible).
[**getPatronInformationByPatronIdV2()**](ExternalAgencyidPatronsApi.md#getPatronInformationByPatronIdV2) | **GET** /external/agencyid/patrons/patronid/v2 | Returns the patron details
[**updateGuardian()**](ExternalAgencyidPatronsApi.md#updateGuardian) | **PUT** /external/agencyid/patrons/withGuardian/v1 | Updates a person patron&#39;s guardian (eg A financial responsible).
[**updateV5()**](ExternalAgencyidPatronsApi.md#updateV5) | **PUT** /external/agencyid/patrons/patronid/v5 | Update information about the patron.


## `createV4()`

```php
createV4($create_patron_request): \DanskernesDigitaleBibliotek\FBS\Model\AuthenticatedPatronV4
```

Create a new patron who is a person.

When a patron doesn't have a patron account in the library system, but logs in using a trusted authentication  source (e.g NemId), the patron account can be created using this service. Name and address will be automatically  fetched from CPR-Registry, and cannot be supplied by the client. If the CPR-Registry is not authorized to  provide information about the patron, then repsonse message 404 will be sent back  <p></p>  If a patron is blocked the reason is available as a code:  <ul>      <li>- 'O': library card stolen</li>      <li>- 'U': exclusion</li>      <li>- 'F': extended exclusion</li>      <li>- 'S': blocked by self service automaton</li>      <li>- 'W': self created at website</li>  </ul>  <p>The codes are informational, and can be used for looking up end user messages by the client system. However,  the list is subject to change at any time, so any unexpected values should be interpreted as 'other reason'.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$create_patron_request = new \DanskernesDigitaleBibliotek\FBS\Model\CreatePatronRequestV3(); // \DanskernesDigitaleBibliotek\FBS\Model\CreatePatronRequestV3 | the patron to be created

try {
    $result = $apiInstance->createV4($create_patron_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronsApi->createV4: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **create_patron_request** | [**\DanskernesDigitaleBibliotek\FBS\Model\CreatePatronRequestV3**](../Model/CreatePatronRequestV3.md)| the patron to be created |

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\AuthenticatedPatronV4**](../Model/AuthenticatedPatronV4.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `createWithGuardian()`

```php
createWithGuardian($patron_with_guardian_request): int
```

Creates a person patron with a guardian (eg A financial responsible).

Returns the id of the patron if the request succeeds.  Name and address will be automatically fetched from the CPR-Registry.  <p>If the CPR-Registry is not authorized to provide information about the patron, then response message 404 will be sent back.</p>  <p>If the supplied cpr number of the patron equals that of the guardian, then response message 400 will be sent back.</p>  <p>If the email of the guardian is invalid, then response message 400 will be sent back.</p>  <p>If an email or phone number for the patron is supplied and it is invalid, then response message 400 will be sent back.</p>  <p>In case of a successful creation of the patron, a confirmation email is sent to the guardian.  In case of failure an email is sent to guardian stating the creation failed.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$patron_with_guardian_request = new \DanskernesDigitaleBibliotek\FBS\Model\PatronWithGuardianRequest(); // \DanskernesDigitaleBibliotek\FBS\Model\PatronWithGuardianRequest | The payload with information for the patron to create

try {
    $result = $apiInstance->createWithGuardian($patron_with_guardian_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronsApi->createWithGuardian: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **patron_with_guardian_request** | [**\DanskernesDigitaleBibliotek\FBS\Model\PatronWithGuardianRequest**](../Model/PatronWithGuardianRequest.md)| The payload with information for the patron to create |

### Return type

**int**

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `getPatronInformationByPatronIdV2()`

```php
getPatronInformationByPatronIdV2(): \DanskernesDigitaleBibliotek\FBS\Model\AuthenticatedPatronV6
```

Returns the patron details

<p></p>  If a patron is blocked the reason is available as a code:  <ul>      <li>- 'O': library card stolen</li>      <li>- 'U': exclusion</li>      <li>- 'F': extended exclusion</li>      <li>- 'S': blocked by self service automaton</li>      <li>- 'W': self created at website</li>  </ul>  <p>The codes are informational, and can be used for looking up end user messages by the client system. However,  the list is subject to change at any time, so any unexpected values should be interpreted as 'other reason'.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->getPatronInformationByPatronIdV2();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronsApi->getPatronInformationByPatronIdV2: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\AuthenticatedPatronV6**](../Model/AuthenticatedPatronV6.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `updateGuardian()`

```php
updateGuardian($update_guardian_request): int
```

Updates a person patron's guardian (eg A financial responsible).

If the person doesn't have a guardian, a new one is created with the information provided.   Returns the id of the patron if the request succeeds.  Name and address will be automatically fetched from the CPR-Registry.  <p>If the CPR-Registry is not authorized to provide information about the patron and guardian, then response message 404 will be sent back.</p>  <p>If the supplied cpr number of the patron equals that of the guardian, then response message 400 will be sent back.</p>  <p>If the email of the guardian is invalid, then response message 400 will be sent back.</p>  <p>In case of a successful update of the guardian, a confirmation email is sent to the guardian.  In case of failure an email is sent to guardian stating the update failed.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$update_guardian_request = new \DanskernesDigitaleBibliotek\FBS\Model\UpdateGuardianRequest(); // \DanskernesDigitaleBibliotek\FBS\Model\UpdateGuardianRequest | The payload with information for the guardian update

try {
    $result = $apiInstance->updateGuardian($update_guardian_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronsApi->updateGuardian: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **update_guardian_request** | [**\DanskernesDigitaleBibliotek\FBS\Model\UpdateGuardianRequest**](../Model/UpdateGuardianRequest.md)| The payload with information for the guardian update |

### Return type

**int**

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `updateV5()`

```php
updateV5($update_patron): \DanskernesDigitaleBibliotek\FBS\Model\AuthenticatedPatronV6
```

Update information about the patron.

The name and address cannot be supplied by the client. If the CPR-Registry is not authorized to provide  information about the patron, then the name and address will not be updated.  <p>It is possible to either update just the pincode, update just some patron settings, or update both.</p>  <p></p>  If a patron is blocked the reason is available as a code:  <ul>      <li>- 'O': library card stolen</li>      <li>- 'U': exclusion</li>      <li>- 'F': extended exclusion</li>      <li>- 'S': blocked by self service automaton</li>      <li>- 'W': self created at website</li>  </ul>  <p>The codes are informational, and can be used for looking up end user messages by the client system. However,  the list is subject to change at any time, so any unexpected values should be interpreted as 'other reason'.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$update_patron = new \DanskernesDigitaleBibliotek\FBS\Model\UpdatePatronRequestV4(); // \DanskernesDigitaleBibliotek\FBS\Model\UpdatePatronRequestV4 | updated information about the patron

try {
    $result = $apiInstance->updateV5($update_patron);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronsApi->updateV5: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **update_patron** | [**\DanskernesDigitaleBibliotek\FBS\Model\UpdatePatronRequestV4**](../Model/UpdatePatronRequestV4.md)| updated information about the patron |

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\AuthenticatedPatronV6**](../Model/AuthenticatedPatronV6.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
