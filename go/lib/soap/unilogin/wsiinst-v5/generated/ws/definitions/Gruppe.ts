
/**
 * gruppe
 * @targetNSAlias `uni`
 * @targetNamespace `https://unilogin.dk`
 */
export interface Gruppe {
    /** Regnr|tns:NonEmptyToken|maxLength */
    instnr?: string;
    /** xs:string */
    gruppeid?: string;
    /** xs:string */
    gruppenavn?: string;
    /** Gruppetype|xs:string|Hovedgruppe,Årgang,Retning,Hold,SFO,Team,Institution,Andet */
    gruppetype?: string;
    /** Trin|xs:string|DT,0,1,2,3,4,5,6,7,8,9,10,U1,U2,U3,U4,VU,Andet */
    gruppetrin?: string;
    /** xs:date */
    fradato?: Date;
    /** xs:date */
    tildato?: Date;
}
