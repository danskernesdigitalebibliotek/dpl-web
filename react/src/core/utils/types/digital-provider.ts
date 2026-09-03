/**
 * Which service a digital loan or reservation lives in. A loan made before the
 * switch stays with the provider that issued it, and the two readers do not
 * recognise each other's keys (order id vs loan id), so each item has to say.
 * Goes away with the Publizon integration.
 */
export type DigitalProvider = "publizon" | "serviceLayer";

export default {};
