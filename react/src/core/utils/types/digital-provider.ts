/**
 * Which service a digital loan or reservation lives in.
 *
 * The material page and the loan list both have to answer "which reader opens
 * this?", and during the transition the answer differs per item rather than
 * per library: a loan made before the switch stays with the provider that
 * issued it, because that is where the entitlement lives. The two readers do
 * not recognise each other's keys - Publizon's takes an order id, the service
 * layer's a loan id - so a loan has to say which one it belongs to.
 *
 * Goes away with the Publizon integration, at which point there is only one
 * provider and nothing left to distinguish.
 */
export type DigitalProvider = "publizon" | "serviceLayer";

export default {};
