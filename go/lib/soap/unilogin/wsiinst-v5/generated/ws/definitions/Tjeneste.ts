
/**
 * tjeneste
 * @targetNSAlias `tns`
 * @targetNamespace `https://unilogin.dk`
 */
export interface Tjeneste {
    /** xs:string */
    udbydernr?: string;
    /** xs:string */
    serienavn?: string;
    /** xs:string */
    seriekode?: string;
    /** Token75char|tns:NonEmptyToken|maxLength */
    tjenestekode?: string;
    /** xs:string */
    tjenestenavn?: string;
    /** xs:string */
    url?: string;
    /** xs:string */
    matplatid?: string;
}
