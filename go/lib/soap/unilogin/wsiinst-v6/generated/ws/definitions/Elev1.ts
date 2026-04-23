
/**
 * elev
 * @targetNSAlias `tns`
 * @targetNamespace `https://brugerdatabasen.stil.dk/bpi/wsiinst/6`
 */
export interface Elev1 {
    /** Elevrolle|xs:string|Barn,Elev,Studerende */
    rolle?: string;
    /** xs:string */
    hovedgruppeid?: string;
    /** xs:string */
    hovedgruppenavn?: string;
    /** trin|xs:string|DT,0,1,2,3,4,5,6,7,8,9,10,U1,U2,U3,U4,VU,Andet */
    elevtrin?: string;
}
