import type { InstitutionTags } from "./InstitutionTags";

/** GetLibraryProfile */
export interface GetLibraryProfile {
    /** s:string */
    retailerid?: string;
    /** s:string */
    retailerkeycode?: string;
    /** s:string */
    clientid?: string;
    /** institutionTags */
    institutionTags?: InstitutionTags;
}
