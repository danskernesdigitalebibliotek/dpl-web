/**
 * Which service a digital loan or reservation lives in.
 *
 * The material page and the loan list both have to answer "which reader opens
 * this?", and during the Publizon → Biblio transition the answer differs per
 * item rather than per library: a loan made before the switch stays with the
 * provider that issued it, because that is where the entitlement lives.
 *
 * Goes away with the Publizon integration, at which point there is only one
 * provider and nothing left to distinguish.
 */
export type DigitalProvider = "publizon" | "biblio";

export default {};
