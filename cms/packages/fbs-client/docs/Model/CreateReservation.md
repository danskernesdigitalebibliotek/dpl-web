# # CreateReservation

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**expiry_date** | **string** | The date where the patron is no longer interested in the reserved material.  If not set, a date will be calculated from the agency default interest period | [optional]
**periodical** | [**\DanskernesDigitaleBibliotek\FBS\Model\PeriodicalReservation**](PeriodicalReservation.md) |  | [optional]
**pickup_branch** | **string** | ISIL-number of pickup branch.  If not set, will default to patrons preferred pickup branch | [optional]
**record_id** | **string** | Identifies the bibliographical record to reserve - The FAUST number |

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
