
/**
 * elev
 * @targetNSAlias `tns`
 * @targetNamespace `https://brugerdatabasen.stil.dk/bpi/wsiinst/6`
 */
export interface Elev {
    /** Elevrolle|xs:string|Barn,Elev,Studerende */
    rolle?: string;
    /** xs:string */
    hovedgruppeid?: string;
    /** xs:string */
    hovedgruppenavn?: string;
}
