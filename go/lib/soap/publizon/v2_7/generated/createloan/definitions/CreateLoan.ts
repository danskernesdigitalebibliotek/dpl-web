import type { InstitutionTags } from "./InstitutionTags";

/** CreateLoan */
export interface CreateLoan {
    /** s:string */
    retailerid?: string;
    /** s:string */
    retailerkeycode?: string;
    /** s:string */
    ebookid?: string;
    /** s:string */
    cardnumber?: string;
    /** s:string */
    countrycode?: string;
    /** s:string */
    clientid?: string;
    /** s:string */
    institutionid?: string;
    /** institutionTags */
    institutionTags?: InstitutionTags;
}
