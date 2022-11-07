# # PatronV3

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**address** | [**\DanskernesDigitaleBibliotek\FBS\Model\Address**](Address.md) |  | [optional]
**allow_bookings** | **bool** | True if the user is allowed to create bookings. | [optional]
**birthday** | **string** |  | [optional]
**block_status** | [**\DanskernesDigitaleBibliotek\FBS\Model\BlockStatus[]**](BlockStatus.md) | A list of block statuses -  if the patron is not blocked then this value is empty or null | [optional]
**default_interest_period** | **int** | Length of default interest period in days |
**email_address** | **string** |  | [optional]
**name** | **string** |  | [optional]
**on_hold** | [**\DanskernesDigitaleBibliotek\FBS\Model\Period**](Period.md) |  | [optional]
**patron_id** | **int** | Patron identifier to be used in subsequent service calls involving the patron |
**phone_number** | **string** |  | [optional]
**preferred_language** | **string** | Language in which the patron prefers the communication with the library to take place | [optional]
**preferred_pickup_branch** | **string** | ISIL of preferred pickup branch |
**receive_email** | **bool** |  |
**receive_postal_mail** | **bool** |  |
**receive_sms** | **bool** |  |
**resident** | **bool** | True if the user is resident in the same municipality as the library |
**secondary_address** | [**\DanskernesDigitaleBibliotek\FBS\Model\Address**](Address.md) |  | [optional]

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
