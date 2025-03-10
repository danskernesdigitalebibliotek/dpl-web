import { Gruppe } from "./Gruppe";
import { Licens } from "./Licens";

/**
 * gruppeLicens
 * @targetNSAlias `uni`
 * @targetNamespace `https://unilogin.dk`
 */
export interface GruppeLicens {
    /** gruppe */
    gruppe?: Gruppe;
    /** licens */
    licens?: Licens;
}
