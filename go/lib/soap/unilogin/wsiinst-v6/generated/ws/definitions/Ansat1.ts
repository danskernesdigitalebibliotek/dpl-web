
/**
 * ansat
 * @targetNSAlias `tns`
 * @targetNamespace `https://brugerdatabasen.stil.dk/bpi/wsiinst/6`
 */
export interface Ansat1 {
    /** Ansatrolle|xs:string|Lærer,Pædagog,Vikar,Leder,Ledelse,TAP,Konsulent */
    rolle?: Array<string>;
    /** xs:string */
    initialer?: string;
}
