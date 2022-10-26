# # PatronSettingsV3

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email_address** | **string** | Required if patron should receive email notifications  Existing email addresses are overwritten with this value  If left empty existing email addresses are deleted | [optional]
**on_hold** | [**\DanskernesDigitaleBibliotek\FBS\Model\Period**](Period.md) |  | [optional]
**phone_number** | **string** | Required if patron should receive SMS notifications  Existing phonenumbers are overwritten with this value  If left empty existing phonenumbers are deleted | [optional]
**preferred_language** | **string** | Language in which the patron prefers the communication with the library to take place  If left empty default library language will be used | [optional]
**preferred_pickup_branch** | **string** | ISIL-number of preferred pickup branch |
**receive_email** | **bool** |  |
**receive_postal_mail** | **bool** |  |
**receive_sms** | **bool** |  |

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
