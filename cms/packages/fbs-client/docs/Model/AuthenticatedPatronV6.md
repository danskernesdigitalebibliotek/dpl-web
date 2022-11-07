# # AuthenticatedPatronV6

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**authenticate_status** | **string** | AuthenticateStatus:  &lt;ul&gt;      &lt;li&gt;- &#39;VALID&#39;: successfully authenticated&lt;/li&gt;      &lt;li&gt;- &#39;INVALID&#39;: either the user is not known in the system, or an invalid combination of authentication parameters has been used.&lt;/li&gt;      &lt;li&gt;- &#39;LOANER_LOCKED_OUT&#39;: user has been blocked temporary because of too many failed login attempts&lt;/li&gt;  &lt;/ul&gt; |
**patron** | [**\DanskernesDigitaleBibliotek\FBS\Model\PatronV5**](PatronV5.md) |  | [optional]

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
