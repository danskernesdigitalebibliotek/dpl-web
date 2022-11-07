# DanskernesDigitaleBibliotek\FBS\ExternalV1AgencyidPatronsPatronidReservationsApi

All URIs are relative to http://localhost.

Method | HTTP request | Description
------------- | ------------- | -------------
[**addReservationsDeprecated()**](ExternalV1AgencyidPatronsPatronidReservationsApi.md#addReservationsDeprecated) | **POST** /external/v1/agencyid/patrons/patronid/reservations | Create new reservations for the patron (DEPRECATED).
[**addReservationsV2()**](ExternalV1AgencyidPatronsPatronidReservationsApi.md#addReservationsV2) | **POST** /external/v1/agencyid/patrons/patronid/reservations/v2 | Create new reservations for the patron.
[**deleteReservations()**](ExternalV1AgencyidPatronsPatronidReservationsApi.md#deleteReservations) | **DELETE** /external/v1/agencyid/patrons/patronid/reservations | Delete existing reservations.
[**getReservations()**](ExternalV1AgencyidPatronsPatronidReservationsApi.md#getReservations) | **GET** /external/v1/agencyid/patrons/patronid/reservations | Get all unfulfilled reservations made by the patron (DEPRECATED).
[**getReservationsV2()**](ExternalV1AgencyidPatronsPatronidReservationsApi.md#getReservationsV2) | **GET** /external/v1/agencyid/patrons/patronid/reservations/v2 | Get all unfulfilled reservations made by the patron.
[**updateReservations()**](ExternalV1AgencyidPatronsPatronidReservationsApi.md#updateReservations) | **PUT** /external/v1/agencyid/patrons/patronid/reservations | Update existing reservations.


## `addReservationsDeprecated()`

```php
addReservationsDeprecated($create_reservation_batch): \DanskernesDigitaleBibliotek\FBS\Model\ReservationDetails[]
```

Create new reservations for the patron (DEPRECATED).

Returns an array of reservation details for the created reservations.  <p></p>  The response contains reservation state, which can be any of these values:  <ul>      <li>- reserved</li>      <li>- readyForPickup</li>      <li>- interLibraryReservation</li>      <li>- inTransit</li>      <li>- other</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other'.</p>  The response contains loanType, which can be any of these values:  <ul>      <li>- loan</li>      <li>- interLibraryLoan</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other'  .</p>  <p>      When making a reservation of a periodical, the values to put in the PeriodicalReservation structure can be obtained      from the periodical information retrieved with the Catalog service.  </p>  <p><b>This method has been deprecated use /external/v1/{agencyid}/patrons/{patronid}/reservations/add instead</b></p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidPatronsPatronidReservationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$create_reservation_batch = new \DanskernesDigitaleBibliotek\FBS\Model\CreateReservationBatch(); // \DanskernesDigitaleBibliotek\FBS\Model\CreateReservationBatch | the reservations to be created

try {
    $result = $apiInstance->addReservationsDeprecated($create_reservation_batch);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalV1AgencyidPatronsPatronidReservationsApi->addReservationsDeprecated: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **create_reservation_batch** | [**\DanskernesDigitaleBibliotek\FBS\Model\CreateReservationBatch**](../Model/CreateReservationBatch.md)| the reservations to be created |

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\ReservationDetails[]**](../Model/ReservationDetails.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `addReservationsV2()`

```php
addReservationsV2($create_reservation_batch): \DanskernesDigitaleBibliotek\FBS\Model\ReservationResponseV2
```

Create new reservations for the patron.

<p>Given a CreateReservationBatch, it creates a list of reservations and returns a ReservationResponse.</p>  <p>The CreateReservationBatch.type indicates the reservation type of the request. If left out the request will be considered of type  normal. The type can be any of the following values:</p>  <ul>      <li>- normal</li>      <li>- parallel</li>  </ul>  <p>The values are subject to change.</p>   <p>ReservationResponse.success indicates if the reservations were created sucessfully. If any of the reservations have failed then all  reservations will be failed and ReservationResponse.success will be false. If all reservations are successfully created ReservationResponse.success will be true.   <p></p>   <p>ReservationResponse.reservationResults contains details about each reservation.  A ReservationResult.result has the status of a reservation and can be any of the following values:</p>  <ul>      <li>- success</li>      <li>- patron_is_blocked</li>      <li>- patron_not_found</li>      <li>- already_reserved</li>      <li>- already_loaned</li>      <li>- material_not_loanable</li>      <li>- material_not_reservable</li>      <li>- material_lost</li>      <li>- material_Discarded</li>      <li>- loaning_profile_not_found</li>      <li>- material_not_found</li>      <li>- material_part_of_collection</li>      <li>- not_reservable</li>      <li>- no_reservable_materials</li>      <li>- interlibrary_material_not_reservable</li>      <li>- previously_loaned_by_homebound_patron</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as an error.</p>   <p></p>   The reservation detail in the response contains a reservation state, which can be any of these values:  <ul>      <li>- reserved</li>      <li>- readyForPickup</li>      <li>- interLibraryReservation</li>      <li>- inTransit</li>      <li>- other</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other'.</p>   <p></p>   <p>      When making a reservation of a periodical, the values to put in the PeriodicalReservation structure can be obtained      from the periodical information retrieved with the Catalog service.  </p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidPatronsPatronidReservationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$create_reservation_batch = new \DanskernesDigitaleBibliotek\FBS\Model\CreateReservationBatchV2(); // \DanskernesDigitaleBibliotek\FBS\Model\CreateReservationBatchV2 | the reservations to be created

try {
    $result = $apiInstance->addReservationsV2($create_reservation_batch);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalV1AgencyidPatronsPatronidReservationsApi->addReservationsV2: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **create_reservation_batch** | [**\DanskernesDigitaleBibliotek\FBS\Model\CreateReservationBatchV2**](../Model/CreateReservationBatchV2.md)| the reservations to be created |

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\ReservationResponseV2**](../Model/ReservationResponseV2.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `deleteReservations()`

```php
deleteReservations($reservationid)
```

Delete existing reservations.

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidPatronsPatronidReservationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$reservationid = array(56); // int[] | a list of reservation ids for reservations that are to be deleted

try {
    $apiInstance->deleteReservations($reservationid);
} catch (Exception $e) {
    echo 'Exception when calling ExternalV1AgencyidPatronsPatronidReservationsApi->deleteReservations: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **reservationid** | [**int[]**](../Model/int.md)| a list of reservation ids for reservations that are to be deleted |

### Return type

void (empty response body)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `getReservations()`

```php
getReservations(): \DanskernesDigitaleBibliotek\FBS\Model\ReservationDetails[]
```

Get all unfulfilled reservations made by the patron (DEPRECATED).

Returns an array of reservation details.  <p>When the patron picks up the reserved materials,  the reservation will no longer be returned.  Expired or deleted reservations will not be returned.</p>   The response contains reservation state, which can be any of these values:  <ul>      <li>- reserved</li>      <li>- readyForPickup</li>      <li>- interLibraryReservation</li>      <li>- inTransit</li>      <li>- other</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other'  .</p>  The response contains loanType, which can be any of these values:  <ul>      <li>- loan</li>      <li>- interLibraryLoan</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'loan'  .</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidPatronsPatronidReservationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->getReservations();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalV1AgencyidPatronsPatronidReservationsApi->getReservations: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\ReservationDetails[]**](../Model/ReservationDetails.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `getReservationsV2()`

```php
getReservationsV2(): \DanskernesDigitaleBibliotek\FBS\Model\ReservationDetailsV2[]
```

Get all unfulfilled reservations made by the patron.

Returns an array of reservation details.  <p>When the patron picks up the reserved materials,  the reservation will no longer be returned.  Expired or deleted reservations will not be returned.</p>   The response contains reservation state, which can be any of these values:  <ul>      <li>- reserved</li>      <li>- readyForPickup</li>      <li>- interLibraryReservation</li>      <li>- inTransit</li>      <li>- other</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other'  .</p>  The response contains reservationType, which can be any of these values:  <ul>      <li>- NORMAL</li>      <li>- PARALLEL</li>      <li>- SERIAL</li>      <li>- INTER_LIBRARY</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, iit should be treated as 'normal'</p>  <p>The response contains a transactionId, which links together parallel reservations.</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidPatronsPatronidReservationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->getReservationsV2();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalV1AgencyidPatronsPatronidReservationsApi->getReservationsV2: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\ReservationDetailsV2[]**](../Model/ReservationDetailsV2.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `updateReservations()`

```php
updateReservations($reservations): \DanskernesDigitaleBibliotek\FBS\Model\ReservationDetails[]
```

Update existing reservations.

Returns an array of the updated reservation details.  <p></p>  The response contains reservation state, which can be any of these values:  <ul>      <li>- reserved</li>      <li>- readyForPickup</li>      <li>- interLibraryReservation</li>      <li>- inTransit</li>      <li>- other</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other'.</p>  The response contains loanType, which can be any of these values:  <ul>      <li>- loan</li>      <li>- interLibraryLoan</li>  </ul>  <p>The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other'  .</p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidPatronsPatronidReservationsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$reservations = new \DanskernesDigitaleBibliotek\FBS\Model\UpdateReservationBatch(); // \DanskernesDigitaleBibliotek\FBS\Model\UpdateReservationBatch | the reservations to be updated

try {
    $result = $apiInstance->updateReservations($reservations);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalV1AgencyidPatronsPatronidReservationsApi->updateReservations: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **reservations** | [**\DanskernesDigitaleBibliotek\FBS\Model\UpdateReservationBatch**](../Model/UpdateReservationBatch.md)| the reservations to be updated |

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\ReservationDetails[]**](../Model/ReservationDetails.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
