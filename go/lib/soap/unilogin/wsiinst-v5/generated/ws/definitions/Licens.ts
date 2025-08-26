import type { Tjeneste } from "./Tjeneste";

/**
 * licens
 * @targetNSAlias `tns`
 * @targetNamespace `https://unilogin.dk`
 */
export interface Licens {
    /** tjeneste */
    tjeneste?: Tjeneste;
    /** xs:date */
    fraDato?: Date;
    /** xs:date */
    tilDato?: Date;
}
