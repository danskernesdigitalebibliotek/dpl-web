import { Elev1 } from "./Elev1";
import { Ansat1 } from "./Ansat1";
import { Ekstern1 } from "./Ekstern1";
import { Gruppe } from "./Gruppe";

/**
 * instBruger
 * @targetNSAlias `uni`
 * @targetNamespace `https://unilogin.dk`
 */
export interface InstBruger {
    /** xs:string */
    instnr?: string;
    /** xs:string */
    brugerid?: string;
    /** xs:string */
    navn?: string;
    /** elev */
    elev?: Elev1;
    /** ansat */
    ansat?: Ansat1;
    /** ekstern */
    ekstern?: Ekstern1;
    /** gruppe[] */
    gruppe?: Array<Gruppe>;
}
