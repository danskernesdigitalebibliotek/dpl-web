# # ReservationDetails

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**date_of_reservation** | **string** |  |
**expiry_date** | **string** | The date when the patron is no longer interested in the reserved material |
**il_bibliographic_record** | [**\DanskernesDigitaleBibliotek\FBS\Model\ILLBibliographicRecord**](ILLBibliographicRecord.md) |  | [optional]
**loan_type** | **string** |  |
**number_in_queue** | **int** | The number in the reservation queue. | [optional]
**periodical** | [**\DanskernesDigitaleBibliotek\FBS\Model\Periodical**](Periodical.md) |  | [optional]
**pickup_branch** | **string** | ISIL-number of pickup branch |
**pickup_deadline** | **string** | Set if reserved material is available for loan | [optional]
**pickup_number** | **string** | The reservation number. Will be present if the reservation is ready for pickup (the state is &#39;readyForPickup&#39;) | [optional]
**record_id** | **string** | The FAUST number |
**reservation_id** | **int** | Identifies the reservation for use when updating or deleting the reservation |
**state** | **string** |  |

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
