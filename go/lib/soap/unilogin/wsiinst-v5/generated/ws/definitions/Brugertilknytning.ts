import { Elev } from "./Elev";
import { Ansat } from "./Ansat";
import { Ekstern } from "./Ekstern";

/**
 * brugertilknytning
 * @targetNSAlias `uni`
 * @targetNamespace `https://unilogin.dk`
 */
export interface Brugertilknytning {
    /** xs:string */
    instnr?: string;
    /** xs:string */
    brugerid?: string;
    /** xs:string */
    navn?: string;
    /** elev */
    elev?: Elev;
    /** ansat */
    ansat?: Ansat;
    /** ekstern */
    ekstern?: Ekstern;
}
