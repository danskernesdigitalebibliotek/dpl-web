# DanskernesDigitaleBibliotek\FBS\ExternalAgencyidPatronsPatronidLoansApi

All URIs are relative to http://localhost.

Method | HTTP request | Description
------------- | ------------- | -------------
[**getLoansV2()**](ExternalAgencyidPatronsPatronidLoansApi.md#getLoansV2) | **GET** /external/agencyid/patrons/patronid/loans/v2 | Get list of current loans by the patron.
[**renewLoansV2()**](ExternalAgencyidPatronsPatronidLoansApi.md#renewLoansV2) | **POST** /external/agencyid/patrons/patronid/loans/renew/v2 | Renew loans.


## `getLoansV2()`

```php
getLoansV2(): \DanskernesDigitaleBibliotek\FBS\Model\LoanV2[]
```

Get list of current loans by the patron.

Returns an array of loans.  <p>  </p>  If a loan is not renewable then the field renewalStatus will contain a list of one or more of these values:  <ul>  <li>- deniedReserved</li>  <li>- deniedMaxRenewalsReached</li>  <li>- deniedLoanerIsBlocked</li>  <li>- deniedMaterialIsNotLoanable</li>  <li>- deniedMaterialIsNotFound</li>  <li>- deniedLoanerNotFound</li>  <li>- deniedLoaningProfileNotFound</li>  <li>- deniedOtherReason</li>  </ul>  <p>  If any other value is encountered then it must be treated as 'deniedOtherReason'.  </p>  The response contains the field loanDetails.loanType, which can be any of these values:  <ul>  <li>- loan</li>  <li>- interLibraryLoan</li>  </ul>  <p>  The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other' .  </p>  <p>  NOTE: Cicero can decide to skip evaluation of the returned loans to minimize response time for loaners with  many loans. In that case isRenewable will have the value true, as if it were a successful validation.  </p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsPatronidLoansApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->getLoansV2();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronsPatronidLoansApi->getLoansV2: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\LoanV2[]**](../Model/LoanV2.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `renewLoansV2()`

```php
renewLoansV2($material_loan_ids): \DanskernesDigitaleBibliotek\FBS\Model\RenewedLoanV2[]
```

Renew loans.

Returns an array of the updated loans.  <p>  If the materials could not be renewed, the return date will be unchanged.  </p>   The response field renewalStatus will contain a list of one or more of these values:  <ul>  <li>- renewed</li>  <li>- deniedReserved</li>  <li>- deniedMaxRenewalsReached</li>  <li>- deniedLoanerIsBlocked</li>  <li>- deniedMaterialIsNotLoanable</li>  <li>- deniedMaterialIsNotFound</li>  <li>- deniedLoanerNotFound</li>  <li>- deniedLoaningProfileNotFound</li>  <li>- deniedOtherReason</li>  </ul>  <p>  If any other value is encountered then it must be treated as 'deniedOtherReason'.  </p>  The response contains the field loanDetails.loanType, which can be any of these values:  <ul>  <li>- loan</li>  <li>- interLibraryLoan</li>  </ul>  <p>  The values are subject to change. If an unrecognized value is encountered, it should be treated as 'other' .  </p>

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure OAuth2 access token for authorization: oauth
$config = DanskernesDigitaleBibliotek\FBS\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsPatronidLoansApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$material_loan_ids = array(56); // int[] | a list of loanId to be renewed

try {
    $result = $apiInstance->renewLoansV2($material_loan_ids);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling ExternalAgencyidPatronsPatronidLoansApi->renewLoansV2: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **material_loan_ids** | [**int[]**](../Model/int.md)| a list of loanId to be renewed |

### Return type

[**\DanskernesDigitaleBibliotek\FBS\Model\RenewedLoanV2[]**](../Model/RenewedLoanV2.md)

### Authorization

[oauth](../../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
