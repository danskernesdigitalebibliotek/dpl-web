# # FeeV2

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | **double** | The amount to pay, in the currency of the agency |
**creation_date** | **string** | The date the fee was created |
**due_date** | **string** | Expected payment due date | [optional]
**fee_id** | **int** | Identifies the fee, used when registering a payment that covers the fee |
**materials** | [**\DanskernesDigitaleBibliotek\FBS\Model\FeeMaterialV2[]**](FeeMaterialV2.md) | Set if fee covers materials |
**paid_date** | **string** | If the fee has been paid in full, this will be set to the date of the final payment, otherwise not set | [optional]
**payable_by_client** | **bool** | true if the client system is allowed to offer payment for the fee, false if not allowed |
**reason_message** | **string** | Human readable free text message about the reason for the fee, presentable to an end user (language is likely  to be the mother tongue of the agency) |
**type** | **string** | Can be used to distinguish between different types of fees |

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
