
/**
 * elev
 * @targetNSAlias `tns`
 * @targetNamespace `https://unilogin.dk`
 */
export interface Elev {
    /** Elevrolle|xs:string|Barn,Elev,Studerende */
    rolle?: string;
    /** xs:string */
    hovedgruppeid?: string;
    /** xs:string */
    hovedgruppenavn?: string;
}
