import { useQuery, useSuspenseQuery, UseQueryOptions, UseSuspenseQueryOptions } from '@tanstack/react-query';
import { fetchData } from '@/lib/graphql/fetchers/fbi.fetcher';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: unknown; output: unknown; }
  PaginationLimitScalar: { input: unknown; output: unknown; }
};

export type AccessType = {
  __typename?: 'AccessType';
  code: AccessTypeCodeEnum;
  display: Scalars['String']['output'];
};

export type AccessTypeCodeEnum =
  | 'ONLINE'
  | 'PHYSICAL'
  | 'UNKNOWN';

export type AccessUnion = AccessUrl | DigitalArticleService | Ereol | InfomediaService | InterLibraryLoan;

export type AccessUrl = {
  __typename?: 'AccessUrl';
  /** If the resource requires login */
  loginRequired: Scalars['Boolean']['output'];
  /** Notes for the resource */
  note?: Maybe<Scalars['String']['output']>;
  /** The origin, e.g. "DBC Webarkiv" */
  origin: Scalars['String']['output'];
  /** Status from linkcheck */
  status: LinkStatusEnum;
  /** The type of content that can be found at this URL */
  type?: Maybe<AccessUrlTypeEnum>;
  /** The url where manifestation is located */
  url: Scalars['String']['output'];
  /** Description/type of URL */
  urlText?: Maybe<Scalars['String']['output']>;
};

export type AccessUrlTypeEnum =
  | 'IMAGE'
  | 'OTHER'
  | 'RESOURCE'
  | 'SAMPLE'
  | 'TABLE_OF_CONTENTS'
  | 'THUMBNAIL';

export type Audience = {
  __typename?: 'Audience';
  /**
   * PEGI age rating for games
   * @deprecated Use 'Audience.pegi' instead expires: 01/06-2025
   */
  PEGI?: Maybe<Pegi>;
  /** Range of numbers with either beginning of range or end of range or both e.g. 6-10, 1980-1999 */
  ages: Array<Range>;
  /** Is this material for children or adults */
  childrenOrAdults: Array<ChildOrAdult>;
  /** Appropriate audience for this manifestation */
  generalAudience: Array<Scalars['String']['output']>;
  /** LET number of this manifestion, defines the reability level, LET stands for læseegnethedstal */
  let?: Maybe<Scalars['String']['output']>;
  /** Level of difficulty, illustrations, length, and realism in children's literature */
  levelForChildren8to12?: Maybe<LevelForAudience>;
  /** Appropriate audience as recommended by the library */
  libraryRecommendation?: Maybe<Scalars['String']['output']>;
  /** Lix number of this manifestion, defines the reability level, Lix stands for læsbarhedsindex */
  lix?: Maybe<Scalars['String']['output']>;
  /** Media council age recommendation */
  mediaCouncilAgeRestriction?: Maybe<MediaCouncilAgeRestriction>;
  /** PEGI age rating for games  */
  pegi?: Maybe<Pegi>;
  /** Number of players in the game. */
  players?: Maybe<Players>;
  /** Primary target audience for this manifestation */
  primaryTarget: Array<Scalars['String']['output']>;
  /** Is this material for use in schools (folkeskole/ungdomsuddannelse) or is this material for use in schools by the teacher (folkeskole only) */
  schoolUse: Array<SchoolUse>;
};

export type CatalogueCodes = {
  __typename?: 'CatalogueCodes';
  /** CatalogueCodes from the national registers */
  nationalBibliography: Array<Scalars['String']['output']>;
  /** CatalogueCodes from local bibliographies or catalogues that the manifestation belongs to */
  otherCatalogues: Array<Scalars['String']['output']>;
};

export type CataloguedPublicationStatus = {
  __typename?: 'CataloguedPublicationStatus';
  /** The code representing the catalogued publication status. */
  code: CataloguedPublicationStatusEnum;
  /** The display text corresponding to the publication status code. */
  display: Scalars['String']['output'];
};

/** Represents the publication status of a catalogued manifestation. */
export type CataloguedPublicationStatusEnum =
  /** New title */
  | 'NT'
  /** New edition */
  | 'NU'
  /** New print run */
  | 'OP';

export type ChildOrAdult = {
  __typename?: 'ChildOrAdult';
  code: ChildOrAdultCodeEnum;
  display: Scalars['String']['output'];
};

export type ChildOrAdultCodeEnum =
  | 'FOR_ADULTS'
  | 'FOR_CHILDREN';

export type Classification = {
  __typename?: 'Classification';
  /** The classification code */
  code: Scalars['String']['output'];
  /** Descriptive text for the classification code (DK5 only) */
  display: Scalars['String']['output'];
  /** The dk5Heading for the classification (DK5 only) */
  dk5Heading?: Maybe<Scalars['String']['output']>;
  /** For DK5 only. The DK5 entry type: main entry, national entry, or additional entry */
  entryType?: Maybe<EntryTypeEnum>;
  /** Name of the classification system */
  system: Scalars['String']['output'];
};

/** The complete facet in response */
export type ComplexSearchFacetResponse = {
  __typename?: 'ComplexSearchFacetResponse';
  name?: Maybe<Scalars['String']['output']>;
  values?: Maybe<Array<ComplexSearchFacetValue>>;
};

/** A Facet value in response */
export type ComplexSearchFacetValue = {
  __typename?: 'ComplexSearchFacetValue';
  key: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  traceId?: Maybe<Scalars['String']['output']>;
};

/** The supported facet fields */
export type ComplexSearchFacetsEnum =
  | 'ACCESSTYPE'
  | 'AGES'
  | 'CATALOGUECODE'
  | 'CHAMBERMUSICTYPE'
  | 'CHOIRTYPE'
  | 'CONTRIBUTOR'
  | 'CONTRIBUTORFUNCTION'
  | 'CREATOR'
  | 'CREATORCONTRIBUTOR'
  | 'CREATORCONTRIBUTORFUNCTION'
  | 'CREATORFUNCTION'
  | 'FICTIONALCHARACTER'
  | 'FILMNATIONALITY'
  | 'GAMEPLATFORM'
  | 'GENERALAUDIENCE'
  | 'GENERALMATERIALTYPE'
  | 'GENREANDFORM'
  | 'HOSTPUBLICATION'
  | 'HOSTPUBLICATIONTYPE'
  | 'INSTRUMENT'
  | 'ISSUE'
  | 'LANGUAGE'
  | 'LET'
  | 'LIBRARYRECOMMENDATION'
  | 'LIX'
  | 'MAINLANGUAGE'
  | 'MEDIACOUNCILAGERESTRICTION'
  | 'MOOD'
  | 'MUSICALENSEMBLEORCAST'
  | 'NARRATIVETECHNIQUE'
  | 'PEGI'
  | 'PLAYERS'
  | 'PRIMARYTARGET'
  | 'PUBLICATIONYEAR'
  | 'SERIES'
  | 'SETTING'
  | 'SOURCE'
  | 'SPECIFICMATERIALTYPE'
  | 'SPOKENLANGUAGE'
  | 'SUBJECT'
  | 'SUBTITLELANGUAGE'
  | 'TYPEOFSCORE';

/** The facets to ask for */
export type ComplexSearchFacetsInput = {
  facetLimit: Scalars['Int']['input'];
  facets?: InputMaybe<Array<ComplexSearchFacetsEnum>>;
};

/** Search Filters */
export type ComplexSearchFiltersInput = {
  /** Id of agency. */
  agencyId?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Name of the branch. */
  branch?: InputMaybe<Array<Scalars['String']['input']>>;
  /** BranchId.  */
  branchId?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Overall location in library (eg. Voksne). */
  department?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Date of first accession */
  firstAccessionDate?: InputMaybe<Scalars['String']['input']>;
  /** Id of publishing issue. */
  issueId?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Local id of the item. */
  itemId?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Where is the book physically located  (eg. skønlitteratur). */
  location?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Onloan or OnShelf. */
  status?: InputMaybe<Array<HoldingsStatusEnum>>;
  /** More specific location (eg. Fantasy). */
  sublocation?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ComplexSearchIndex = {
  __typename?: 'ComplexSearchIndex';
  /** Aliases for this index */
  aliases?: Maybe<Array<Scalars['String']['output']>>;
  /** Can be used for faceting */
  facet: Scalars['Boolean']['output'];
  /** The name of a Complex Search index */
  index: Scalars['String']['output'];
  /** Can be used for searching */
  search: Scalars['Boolean']['output'];
  /** Can be used for sorting */
  sort: Scalars['Boolean']['output'];
};

/** The search response */
export type ComplexSearchResponse = {
  __typename?: 'ComplexSearchResponse';
  /** Error message, for instance if CQL is invalid */
  errorMessage?: Maybe<Scalars['String']['output']>;
  /** Facets for this response */
  facets?: Maybe<Array<ComplexSearchFacetResponse>>;
  /** Total number of works found. May be used for pagination. */
  hitcount: Scalars['Int']['output'];
  /** The works matching the given search query. Use offset and limit for pagination. */
  works: Array<Work>;
};


/** The search response */
export type ComplexSearchResponseWorksArgs = {
  limit: Scalars['PaginationLimitScalar']['input'];
  offset: Scalars['Int']['input'];
  sort?: InputMaybe<Array<SortInput>>;
};

export type ComplexSearchSuggestion = {
  __typename?: 'ComplexSearchSuggestion';
  /** The suggested term which can be searched for */
  term: Scalars['String']['output'];
  /**
   * A unique identifier for tracking user interactions with this suggestion.
   * It is generated in the response and should be included in subsequent
   * API calls when this suggestion is selected.
   */
  traceId: Scalars['String']['output'];
  /** The type of suggestion */
  type: Scalars['String']['output'];
  /** A work related to the term */
  work?: Maybe<Work>;
};

export type ComplexSuggestResponse = {
  __typename?: 'ComplexSuggestResponse';
  result: Array<ComplexSearchSuggestion>;
};

export type ComplexSuggestionTypeEnum =
  | 'CONTRIBUTORFUNCTION'
  | 'CREATOR'
  | 'CREATORCONTRIBUTOR'
  | 'CREATORCONTRIBUTORFUNCTION'
  | 'CREATORFUNCTION'
  | 'DEFAULT'
  | 'FICTIONALCHARACTER'
  | 'HOSTPUBLICATION'
  | 'PUBLISHER'
  | 'SERIES'
  | 'SUBJECT'
  | 'TITLE';

export type Complexity = {
  __typename?: 'Complexity';
  class: Scalars['String']['output'];
  max: Scalars['Int']['output'];
  value: Scalars['Int']['output'];
};

export type ContentEntry = {
  __typename?: 'ContentEntry';
  /** Additional 'authors' (lyricists, arrangers, performers/soloists etc.), quoted as strings (including possible author's statement) from the record */
  contributors?: Maybe<Array<Scalars['String']['output']>>;
  /** Main creator(s) of the entry i.e. composer (classical music), artist/band (rhythmic music), author (fiction, articles). For music and sheet music always only 1 creator, for articles and fiction possibly more than 1 */
  creators?: Maybe<ContentEntryCreators>;
  /** Playing time for music tracks, quoted from the record */
  playingTime?: Maybe<Scalars['String']['output']>;
  /** Possible entry data (title, creators, contributors, playingtime) subordinate to the entry's top level */
  sublevel?: Maybe<Array<ContentSublevel>>;
  /** Top level title of the entry */
  title: ContentEntryTitle;
};

export type ContentEntryCreators = {
  __typename?: 'ContentEntryCreators';
  /** Details about a corporation or conference, name, role, etc. */
  corporations?: Maybe<Array<Corporation>>;
  /** Details about a person, name, role etc. */
  persons?: Maybe<Array<Person>>;
};

export type ContentEntryTitle = {
  __typename?: 'ContentEntryTitle';
  /** Title of the content entry */
  display: Scalars['String']['output'];
};

export type ContentSublevel = {
  __typename?: 'ContentSublevel';
  /** Additional 'authors' (lyricists, arrangers, performers/soloists etc.) related to the title on sublevel 1, quoted as strings (including possible author's statement) from the record */
  contributors?: Maybe<Array<Scalars['String']['output']>>;
  /** Playing time for music tracks */
  playingTime?: Maybe<Scalars['String']['output']>;
  /** Possible entry data (title, contributors, playingtime) subordinate to the entry's sublevel 1 */
  sublevel?: Maybe<Array<ContentSublevelLast>>;
  /** Title subordinate to the title in the entry's top level */
  title: ContentEntryTitle;
};

export type ContentSublevelLast = {
  __typename?: 'ContentSublevelLast';
  /** Additional 'authors' (lyricists, arrangers, performers/soloists etc.) related to the title on sublevel 1, quoted as strings (including possible author's statement) from the record */
  contributors?: Maybe<Array<Scalars['String']['output']>>;
  /** Playing time for music tracks */
  playingTime?: Maybe<Scalars['String']['output']>;
  /** Title subordinate to the title in the entry's top level */
  title: ContentEntryTitle;
};

export type ContentsEntity = {
  __typename?: 'ContentsEntity';
  /** Content entry with title and possible creator(s), contributors and (for some music and movies) playing time */
  entries?: Maybe<Array<ContentEntry>>;
  /** Heading for the contents of this entity */
  heading: Scalars['String']['output'];
  /** Contents text note quoted as it is from the marc field. Used for non-machine-decipherable content notes (un)formatted in only 1 subfield) */
  raw?: Maybe<Scalars['String']['output']>;
  /** ENUM for type of content entries (music tracks, articles, fiction etc.) in this entity */
  type: ContentsEntityEnum;
};

export type ContentsEntityEnum =
  | 'ARTICLES'
  | 'CHAPTERS'
  | 'FICTION'
  | 'MUSIC_TRACKS'
  | 'NOT_SPECIFIED'
  | 'SHEET_MUSIC';

export type CopyRequestInput = {
  authorOfComponent?: InputMaybe<Scalars['String']['input']>;
  issueOfComponent?: InputMaybe<Scalars['String']['input']>;
  openURL?: InputMaybe<Scalars['String']['input']>;
  pagesOfComponent?: InputMaybe<Scalars['String']['input']>;
  pickUpAgencySubdivision?: InputMaybe<Scalars['String']['input']>;
  /** The pid of an article or periodica */
  pid: Scalars['String']['input'];
  publicationDateOfComponent?: InputMaybe<Scalars['String']['input']>;
  publicationTitle?: InputMaybe<Scalars['String']['input']>;
  publicationYearOfComponent?: InputMaybe<Scalars['String']['input']>;
  titleOfComponent?: InputMaybe<Scalars['String']['input']>;
  userInterestDate?: InputMaybe<Scalars['String']['input']>;
  userMail?: InputMaybe<Scalars['String']['input']>;
  userName?: InputMaybe<Scalars['String']['input']>;
  volumeOfComponent?: InputMaybe<Scalars['String']['input']>;
};

export type CopyRequestResponse = {
  __typename?: 'CopyRequestResponse';
  status: CopyRequestStatusEnum;
};

export type CopyRequestStatusEnum =
  | 'BORCHK_USER_BLOCKED_BY_AGENCY'
  | 'BORCHK_USER_NOT_VERIFIED'
  | 'BORCHK_USER_NO_LONGER_EXIST_ON_AGENCY'
  | 'ERROR_AGENCY_NOT_SUBSCRIBED'
  | 'ERROR_INVALID_PICKUP_BRANCH'
  | 'ERROR_MISSING_CLIENT_CONFIGURATION'
  | 'ERROR_MISSING_MUNICIPALITYAGENCYID'
  | 'ERROR_MUNICIPALITYAGENCYID_NOT_FOUND'
  | 'ERROR_PID_NOT_RESERVABLE'
  | 'ERROR_UNAUTHENTICATED_USER'
  | 'INTERNAL_ERROR'
  | 'OK'
  | 'UNKNOWN_USER';

export type Corporation = CreatorInterface & SubjectInterface & {
  __typename?: 'Corporation';
  /** Added information about the corporation, like M. Folmer Andersen (firma) */
  attributeToName?: Maybe<Scalars['String']['output']>;
  /** The full corporation or conference name */
  display: Scalars['String']['output'];
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  /** Location or jurisdiction of the corporation or conference, like Københavns Kommune, Statistisk Kontor */
  location?: Maybe<Scalars['String']['output']>;
  /** Main corporation or conference */
  main?: Maybe<Scalars['String']['output']>;
  /** The full corporation or conference name to sort after */
  nameSort: Scalars['String']['output'];
  /** Number of the conference */
  number?: Maybe<Scalars['String']['output']>;
  /** A list of which kinds of contributions this corporation made to this creation */
  roles: Array<Role>;
  /** Sub corporation or conference/meeting */
  sub?: Maybe<Scalars['String']['output']>;
  type: SubjectTypeEnum;
  /** VIAF identifier of the creator */
  viafid?: Maybe<Scalars['String']['output']>;
  /** Year of the conference */
  year?: Maybe<Scalars['String']['output']>;
};

export type Cover = {
  __typename?: 'Cover';
  detail?: Maybe<Scalars['String']['output']>;
  detail_42?: Maybe<Scalars['String']['output']>;
  detail_117?: Maybe<Scalars['String']['output']>;
  detail_207?: Maybe<Scalars['String']['output']>;
  detail_500?: Maybe<Scalars['String']['output']>;
  large?: Maybe<CoverDetails>;
  medium?: Maybe<CoverDetails>;
  origin?: Maybe<Scalars['String']['output']>;
  original?: Maybe<CoverDetails>;
  small?: Maybe<CoverDetails>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  xSmall?: Maybe<CoverDetails>;
};

export type CoverDetails = {
  __typename?: 'CoverDetails';
  height?: Maybe<Scalars['Int']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

export type CreatorInterface = {
  /** Name of the creator */
  display: Scalars['String']['output'];
  /** Name of the creator which can be used to sort after  */
  nameSort: Scalars['String']['output'];
  /** A list of which kinds of contributions this creator made to this creation */
  roles: Array<Role>;
  /** VIAF identifier of the creator */
  viafid?: Maybe<Scalars['String']['output']>;
};

export type Dk5MainEntry = {
  __typename?: 'DK5MainEntry';
  /** Main DK5 classification code */
  code: Scalars['String']['output'];
  /** Displayable main DK5 classification */
  display: Scalars['String']['output'];
  /** The dk5Heading for the classification */
  dk5Heading: Scalars['String']['output'];
};

export type Debug = {
  __typename?: 'Debug';
  complexity: Complexity;
  depth: Depth;
};

export type Depth = {
  __typename?: 'Depth';
  max: Scalars['Int']['output'];
  value: Scalars['Int']['output'];
};

export type DidYouMean = {
  __typename?: 'DidYouMean';
  /** An alternative query */
  query: Scalars['String']['output'];
  /** A probability score between 0-1 indicating how relevant the query is */
  score: Scalars['Float']['output'];
  /**
   * A unique identifier for tracking user interactions with this didYouMean value.
   * It is generated in the response and should be included in subsequent
   * API calls when this manifestation is selected.
   */
  traceId: Scalars['String']['output'];
};

export type DigitalArticleService = {
  __typename?: 'DigitalArticleService';
  /** Issn which can be used to order article through Digital Article Service */
  issn: Scalars['String']['output'];
};

export type Edition = {
  __typename?: 'Edition';
  /** Quotation of contributor statements related to the edition */
  contributors: Array<Scalars['String']['output']>;
  /** The edition number and name */
  edition?: Maybe<Scalars['String']['output']>;
  /** A note about this specific edition */
  note?: Maybe<Scalars['String']['output']>;
  /** A year as displayable text and as number */
  publicationYear?: Maybe<PublicationYear>;
  /** Properties 'edition', 'contributorsToEdition' and 'publicationYear' as one string, e.g.: '3. udgave, revideret af Hugin Eide, 2005' */
  summary: Scalars['String']['output'];
};

export type ElbaServices = {
  __typename?: 'ElbaServices';
  placeCopyRequest: CopyRequestResponse;
};


export type ElbaServicesPlaceCopyRequestArgs = {
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  input: CopyRequestInput;
};

export type EntryTypeEnum =
  | 'ADDITIONAL_ENTRY'
  | 'MAIN_ENTRY'
  | 'NATIONAL_BIBLIOGRAPHY_ADDITIONAL_ENTRY'
  | 'NATIONAL_BIBLIOGRAPHY_ENTRY';

export type Ereol = {
  __typename?: 'Ereol';
  /** Is this a manifestation that always can be loaned on ereolen.dk even if you've run out of loans this month */
  canAlwaysBeLoaned: Scalars['Boolean']['output'];
  /** Notes for the resource */
  note?: Maybe<Scalars['String']['output']>;
  /** The origin, e.g. "Ereolen" or "Ereolen Go" */
  origin: Scalars['String']['output'];
  /** The url where manifestation is located */
  url: Scalars['String']['output'];
};

/** The supported facet fields */
export type FacetFieldEnum =
  | 'ACCESSTYPES'
  | 'AGE'
  | 'CANALWAYSBELOANED'
  | 'CHILDRENORADULTS'
  | 'CREATORS'
  | 'DK5'
  | 'FICTIONALCHARACTERS'
  | 'FICTIONNONFICTION'
  | 'GAMEPLATFORM'
  | 'GENERALAUDIENCE'
  | 'GENREANDFORM'
  | 'LET'
  | 'LIBRARYRECOMMENDATION'
  | 'LIX'
  | 'MAINLANGUAGES'
  | 'MATERIALTYPESGENERAL'
  | 'MATERIALTYPESSPECIFIC'
  | 'SUBJECTS'
  | 'WORKTYPES'
  | 'YEAR';

/** The result for a specific facet */
export type FacetResult = {
  __typename?: 'FacetResult';
  /** The name of the facet. */
  name: Scalars['String']['output'];
  /** The enum type of the facet. */
  type: FacetFieldEnum;
  /** The values of thie facet result */
  values: Array<FacetValue>;
};


/** The result for a specific facet */
export type FacetResultValuesArgs = {
  limit: Scalars['Int']['input'];
};

/** A facet value consists of a term and a count. */
export type FacetValue = {
  __typename?: 'FacetValue';
  /** Use the key when applying filters */
  key: Scalars['String']['output'];
  /** A score indicating relevance */
  score?: Maybe<Scalars['Int']['output']>;
  /** A value of a facet field */
  term: Scalars['String']['output'];
  /**
   * A unique identifier for tracking user interactions with this facet value.
   * It is generated in the response and should be included in subsequent
   * API calls when this manifestation is selected.
   */
  traceId: Scalars['String']['output'];
};

export type FictionNonfiction = {
  __typename?: 'FictionNonfiction';
  /** Binary code fiction/nonfiction used for filtering */
  code: FictionNonfictionCodeEnum;
  /** Displayable overall category/genre. In Danish skønlitteratur/faglitteratur for literature, fiktion/nonfiktion for other types. */
  display: Scalars['String']['output'];
};

export type FictionNonfictionCodeEnum =
  | 'FICTION'
  | 'NONFICTION'
  | 'NOT_SPECIFIED';

export type GeneralMaterialType = {
  __typename?: 'GeneralMaterialType';
  /** code for materialType # @TODO - is this a finite list ?? - and where to get it */
  code: GeneralMaterialTypeCodeEnum;
  /** Ths string to display */
  display: Scalars['String']['output'];
};

export type GeneralMaterialTypeCodeEnum =
  | 'ARTICLES'
  | 'AUDIO_BOOKS'
  | 'BOARD_GAMES'
  | 'BOOKS'
  | 'COMICS'
  | 'COMPUTER_GAMES'
  | 'EBOOKS'
  | 'FILMS'
  | 'IMAGE_MATERIALS'
  | 'MUSIC'
  | 'NEWSPAPER_JOURNALS'
  | 'OTHER'
  | 'PODCASTS'
  | 'SHEET_MUSIC'
  | 'TV_SERIES';

export type HoldingsStatusEnum =
  /** Holding is on loan */
  | 'ONLOAN'
  /** Holding is physically available at the branch */
  | 'ONSHELF';

export type HostPublication = {
  __typename?: 'HostPublication';
  /** Creator of the host publication if host publication is book */
  creator?: Maybe<Scalars['String']['output']>;
  /** Edition statement for the host publication */
  edition?: Maybe<Scalars['String']['output']>;
  /** ISBN of the publication this manifestation can be found in */
  isbn?: Maybe<Scalars['String']['output']>;
  /** ISSN of the publication this manifestation can be found in */
  issn?: Maybe<Scalars['String']['output']>;
  /** The issue of the publication this manifestation can be found in */
  issue?: Maybe<Scalars['String']['output']>;
  /** Notes about the publication where this manifestation can be found in */
  notes?: Maybe<Array<Scalars['String']['output']>>;
  /** The pages in the publication where this manifestation can be found in */
  pages?: Maybe<Scalars['String']['output']>;
  /** The publisher of the publication where this manifestation can be found in */
  publisher?: Maybe<Scalars['String']['output']>;
  /** Series of the publication this manifestation can be found in */
  series?: Maybe<Series>;
  /** All details about the publication this manifestation can be found in */
  summary: Scalars['String']['output'];
  /** Publication this manifestation can be found in */
  title: Scalars['String']['output'];
  /** The publication year of the publication this manifestation can be found in */
  year?: Maybe<PublicationYear>;
};

export type Identifier = {
  __typename?: 'Identifier';
  /** The type of identifier */
  type: IdentifierTypeEnum;
  /** The actual identifier */
  value: Scalars['String']['output'];
};

export type IdentifierTypeEnum =
  | 'BARCODE'
  | 'DOI'
  | 'ISBN'
  | 'ISMN'
  | 'ISSN'
  | 'MOVIE'
  | 'MUSIC'
  | 'NOT_SPECIFIED'
  | 'ORDER_NUMBER'
  | 'PUBLIZON'
  | 'UPC'
  | 'URI';

export type InfomediaArticle = {
  __typename?: 'InfomediaArticle';
  byLine?: Maybe<Scalars['String']['output']>;
  dateLine?: Maybe<Scalars['String']['output']>;
  headLine?: Maybe<Scalars['String']['output']>;
  hedLine?: Maybe<Scalars['String']['output']>;
  html?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  paper?: Maybe<Scalars['String']['output']>;
  subHeadLine?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export type InfomediaErrorEnum =
  | 'BORROWERCHECK_NOT_ALLOWED'
  | 'BORROWER_NOT_FOUND'
  | 'BORROWER_NOT_IN_MUNICIPALITY'
  | 'BORROWER_NOT_LOGGED_IN'
  | 'ERROR_IN_REQUEST'
  | 'INTERNAL_SERVER_ERROR'
  | 'LIBRARY_NOT_FOUND'
  | 'NO_AGENCYID'
  | 'SERVICE_NOT_LICENSED'
  | 'SERVICE_UNAVAILABLE';

export type InfomediaResponse = {
  __typename?: 'InfomediaResponse';
  article?: Maybe<InfomediaArticle>;
  /** Infomedia error */
  error?: Maybe<InfomediaErrorEnum>;
};

export type InfomediaService = {
  __typename?: 'InfomediaService';
  /** Infomedia ID which can be used to fetch article through Infomedia Service */
  id: Scalars['String']['output'];
};

export type InterLibraryLoan = {
  __typename?: 'InterLibraryLoan';
  /** Is newly added - nice to know if there are no localizations */
  accessNew: Scalars['Boolean']['output'];
  /** Is true when manifestation can be borrowed via ill */
  loanIsPossible: Scalars['Boolean']['output'];
};

export type KidRecommenderTagsInput = {
  tag?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type Language = {
  __typename?: 'Language';
  /** Language as displayable text */
  display: Scalars['String']['output'];
  /** ISO639-1 language code (2 letters) */
  iso639Set1: Scalars['String']['output'];
  /** ISO639-2 language code (3 letters) */
  iso639Set2: Scalars['String']['output'];
  /** ISO639-2 language code */
  isoCode: Scalars['String']['output'];
};

export type LanguageCodeEnum =
  | 'DA'
  | 'EN';

export type Languages = {
  __typename?: 'Languages';
  /** Summary/abstract languages of this manifestation, if the manifestation contains short summaries of the content in another language */
  abstract?: Maybe<Array<Language>>;
  /** Main language of this manifestation */
  main?: Maybe<Array<Language>>;
  /** Notes of the languages that describe subtitles, spoken/written (original, dubbed/synchonized), visual interpretation, parallel (notes are written in Danish) */
  notes?: Maybe<Array<Scalars['String']['output']>>;
  /** Original language of this manifestation */
  original?: Maybe<Array<Language>>;
  /** Parallel languages of this manifestation, if more languages are printed in the same book */
  parallel?: Maybe<Array<Language>>;
  /** Spoken language in this manifestation e.g. dubbed/syncronized language in movie */
  spoken?: Maybe<Array<Language>>;
  /** Subtitles in this manifestation */
  subtitles?: Maybe<Array<Language>>;
};

export type LevelForAudience = {
  __typename?: 'LevelForAudience';
  /** Level expressed as integer on a scale from 1 to 5 */
  difficulty?: Maybe<Scalars['Int']['output']>;
  /** Level expressed as integer on a scale from 1 to 5 */
  illustrationsLevel?: Maybe<Scalars['Int']['output']>;
  /** Level expressed as integer on a scale from 1 to 5 */
  length?: Maybe<Scalars['Int']['output']>;
  /** Level expressed as integer on a scale from 1 to 5 */
  realisticVsFictional?: Maybe<Scalars['Int']['output']>;
};

export type LinkCheckResponse = {
  __typename?: 'LinkCheckResponse';
  brokenSince?: Maybe<Scalars['DateTime']['output']>;
  lastCheckedAt?: Maybe<Scalars['DateTime']['output']>;
  status: LinkCheckStatusEnum;
  url: Scalars['String']['output'];
};

export type LinkCheckService = {
  __typename?: 'LinkCheckService';
  checks: Array<LinkCheckResponse>;
};


export type LinkCheckServiceChecksArgs = {
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type LinkCheckStatusEnum =
  | 'BROKEN'
  | 'GONE'
  | 'INVALID'
  | 'OK';

export type LinkStatusEnum =
  | 'BROKEN'
  | 'GONE'
  | 'INVALID'
  | 'OK';

export type LocalSuggestResponse = {
  __typename?: 'LocalSuggestResponse';
  result: Array<Suggestion>;
};

export type Manifestation = {
  __typename?: 'Manifestation';
  /** Abstract of the entity */
  abstract: Array<Scalars['String']['output']>;
  /** Different options to access manifestation */
  access: Array<AccessUnion>;
  /** Access type of this manifestation */
  accessTypes: Array<AccessType>;
  /** Different kinds of definitions of appropriate audience for this manifestation */
  audience?: Maybe<Audience>;
  /** CatalogueCodes divided in codes from the national bibliography and other codes */
  catalogueCodes: CatalogueCodes;
  /** The publication status of a catalogued manifestation. */
  cataloguedPublicationStatus?: Maybe<CataloguedPublicationStatus>;
  /** Classification codes for this manifestation from any classification system */
  classifications: Array<Classification>;
  /** Content title entries with possible creators, contributors and playing time for music tracks, sheet music titles, articles, poems, short stories etc. */
  contents?: Maybe<Array<ContentsEntity>>;
  /** Contributors to the manifestation, actors, illustrators etc */
  contributors: Array<CreatorInterface>;
  /** Additional contributors of this manifestation as described on the publication. E.g. 'på dansk ved Vivi Berendt' */
  contributorsFromDescription: Array<Scalars['String']['output']>;
  /** Cover for this manifestation */
  cover: Cover;
  /** Primary creators of the manifestation e.g. authors, directors, musicians etc */
  creators: Array<CreatorInterface>;
  /** Additional creators of this manifestation as described on the publication. E.g. 'tekst af William Warren' */
  creatorsFromDescription: Array<Scalars['String']['output']>;
  /** The year for the publication of the first edition for this work  */
  dateFirstEdition?: Maybe<PublicationYear>;
  /** Edition details for this manifestation */
  edition?: Maybe<Edition>;
  /** Overall literary category/genre of this manifestation. e.g. fiction or nonfiction. In Danish skønlitteratur/faglitteratur for literature, fiktion/nonfiktion for other types. */
  fictionNonfiction?: Maybe<FictionNonfiction>;
  /** The genre, (literary) form, type etc. of this manifestation */
  genreAndForm: Array<Scalars['String']['output']>;
  /** Details about the host publications of this manifestation */
  hostPublication?: Maybe<HostPublication>;
  /** Identifiers for this manifestation - often used for search indexes */
  identifiers: Array<Identifier>;
  /** Languages in this manifestation */
  languages?: Maybe<Languages>;
  /** Details about the latest printing of this manifestation */
  latestPrinting?: Maybe<Printing>;
  /** Identification of the local id of this manifestation */
  localId?: Maybe<Scalars['String']['output']>;
  /**
   * Tracks on music album, sheet music content, or articles/short stories etc. in this manifestation
   * @deprecated Use 'Manifestation.contents' instead expires: 01/11-2025
   */
  manifestationParts?: Maybe<ManifestationParts>;
  /** The type of material of the manifestation based on bibliotek.dk types */
  materialTypes: Array<MaterialType>;
  /** Notes about the manifestation */
  notes: Array<Note>;
  /** The work that this manifestation is part of */
  ownerWork: Work;
  /** Physical description  of this manifestation like extent (pages/minutes), illustrations etc. */
  physicalDescription?: Maybe<PhysicalUnitDescription>;
  /** Unique identification of the manifestation e.g 870970-basis:54029519 */
  pid: Scalars['String']['output'];
  /** Publisher of this manifestion */
  publisher: Array<Scalars['String']['output']>;
  /** The creation date of the record describing this manifestation in the format YYYYMMDD */
  recordCreationDate: Scalars['String']['output'];
  /** Notes about relations to this book/periodical/journal, - like previous names or related journals */
  relatedPublications: Array<RelatedPublication>;
  /** Relations to other manifestations */
  relations: Relations;
  /** Some review data, if this manifestation is a review */
  review?: Maybe<ManifestationReview>;
  /** Series for this manifestation */
  series: Array<Series>;
  /** Material that can be identified as sheet music */
  sheetMusicCategories?: Maybe<SheetMusicCategory>;
  /** Information about on which shelf in the library this manifestation can be found */
  shelfmark?: Maybe<Shelfmark>;
  /** The source of the manifestation, e.g. own library catalogue (Bibliotekskatalog) or online source e.g. Filmstriben, Ebook Central, eReolen Global etc. */
  source: Array<Scalars['String']['output']>;
  /** Subjects for this manifestation */
  subjects: SubjectContainer;
  /**
   * Quotation of the manifestation's table of contents or a similar content list
   * @deprecated Use 'Manifestation.contents' instead expires: 01/11-2025
   */
  tableOfContents?: Maybe<TableOfContent>;
  /** Different kinds of titles for this work */
  titles: ManifestationTitles;
  /**
   * A unique identifier for tracking user interactions with this manifestation.
   * It is generated in the response and should be included in subsequent
   * API calls when this manifestation is selected.
   */
  traceId: Scalars['String']['output'];
  /** id of the manifestaion unit */
  unit?: Maybe<Unit>;
  /** Universes for this manifestation */
  universes: Array<Universe>;
  /** Information about on which volume this manifestation is in multi volume work */
  volume?: Maybe<Scalars['String']['output']>;
  /** Worktypes for this manifestations work */
  workTypes: Array<WorkTypeEnum>;
  /** The year this manifestation was originally published or produced */
  workYear?: Maybe<PublicationYear>;
};

export type ManifestationPart = {
  __typename?: 'ManifestationPart';
  /** Classification of this entry (music track or literary analysis) */
  classifications: Array<Classification>;
  /** Contributors from description - additional contributor to this entry */
  contributorsFromDescription: Array<Scalars['String']['output']>;
  /** The creator of the music track or literary analysis */
  creators: Array<CreatorInterface>;
  /** Additional creator or contributor to this entry (music track or literary analysis) as described on the publication. E.g. 'arr.: H. Cornell' */
  creatorsFromDescription: Array<Scalars['String']['output']>;
  /** The playing time for this specific part (i.e. the duration of a music track)  */
  playingTime?: Maybe<Scalars['String']['output']>;
  /** Subjects of this entry (music track or literary analysis) */
  subjects?: Maybe<Array<SubjectInterface>>;
  /** The title of the entry (music track or title of a literary analysis) */
  title: Scalars['String']['output'];
};

export type ManifestationPartTypeEnum =
  | 'MUSIC_TRACKS'
  | 'NOT_SPECIFIED'
  | 'PARTS_OF_BOOK'
  | 'SHEET_MUSIC_CONTENT';

export type ManifestationParts = {
  __typename?: 'ManifestationParts';
  /** Heading for the music content note */
  heading?: Maybe<Scalars['String']['output']>;
  /** The creator and title etc of the individual parts */
  parts: Array<ManifestationPart>;
  /** The type of manifestation parts, is this music tracks, book parts etc. */
  type: ManifestationPartTypeEnum;
};

export type ManifestationReview = {
  __typename?: 'ManifestationReview';
  rating?: Maybe<Scalars['String']['output']>;
  reviewByLibrarians?: Maybe<Array<Maybe<ReviewElement>>>;
};

export type ManifestationTitles = {
  __typename?: 'ManifestationTitles';
  /** Alternative titles for this manifestation e.g. a title in a different language */
  alternative: Array<Scalars['String']['output']>;
  /** The full title(s) of the manifestation including subtitles etc */
  full: Array<Scalars['String']['output']>;
  /** Information that distinguishes this manifestation from a similar manifestation with same title, e.g. 'illustrated by Ted Kirby' */
  identifyingAddition?: Maybe<Scalars['String']['output']>;
  /** The main title(s) of the work */
  main: Array<Scalars['String']['output']>;
  /** The title of the work that this expression/manifestation is translated from or based on. The original title(s) of a film which has a different distribution title. */
  original?: Maybe<Array<Scalars['String']['output']>>;
  /** Titles (in other languages) parallel to the main 'title' of the manifestation */
  parallel: Array<Scalars['String']['output']>;
  /** The sorted title of the entity */
  sort: Scalars['String']['output'];
  /** The standard title of the entity, used for music and movies */
  standard?: Maybe<Scalars['String']['output']>;
  /** The title of the entity with the language of the entity in parenthesis after. This field is only generated for non-danish titles. */
  titlePlusLanguage?: Maybe<Scalars['String']['output']>;
  /** Danish translation of the main title */
  translated?: Maybe<Array<Scalars['String']['output']>>;
  /** detailed title for tv series  */
  tvSeries?: Maybe<TvSeries>;
};

export type Manifestations = {
  __typename?: 'Manifestations';
  all: Array<Manifestation>;
  bestRepresentation: Manifestation;
  bestRepresentations: Array<Manifestation>;
  first: Manifestation;
  latest: Manifestation;
  mostRelevant: Array<Manifestation>;
  /**
   * A list of manifestations that matched the search query.
   *
   * This field is populated only when a work is retrieved within a search context.
   * Each entry is a SearchHit object representing a manifestation that matched the search criteria.
   * Only one manifestation per unit is returned.
   */
  searchHits?: Maybe<Array<SearchHit>>;
};

export type MaterialType = {
  __typename?: 'MaterialType';
  /** jed 1.1 - the general materialtype */
  materialTypeGeneral: GeneralMaterialType;
  /** jed 1.1 - the specific materialtType */
  materialTypeSpecific: SpecificMaterialType;
};

export type MediaCouncilAgeRestriction = {
  __typename?: 'MediaCouncilAgeRestriction';
  /** Display string for minimum age */
  display?: Maybe<Scalars['String']['output']>;
  /** Minimum age */
  minimumAge?: Maybe<Scalars['Int']['output']>;
};

export type Mood = SubjectInterface & {
  __typename?: 'Mood';
  display: Scalars['String']['output'];
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  type: SubjectTypeEnum;
};

export type MoodKidsRecommendFiltersInput = {
  difficulty?: InputMaybe<Array<Scalars['Int']['input']>>;
  fictionNonfiction?: InputMaybe<FictionNonfictionCodeEnum>;
  illustrationsLevel?: InputMaybe<Array<Scalars['Int']['input']>>;
  length?: InputMaybe<Array<Scalars['Int']['input']>>;
  realisticVsFictional?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type MoodQueries = {
  __typename?: 'MoodQueries';
  moodRecommendKids: MoodRecommendKidsResponse;
  moodSearch: MoodSearchResponse;
  moodSearchKids: MoodSearchKidsResponse;
  moodSuggest: MoodSuggestResponse;
  moodTagRecommend: Array<Maybe<MoodTagRecommendResponse>>;
  moodWorkRecommend: Array<Maybe<MoodTagRecommendResponse>>;
};


export type MoodQueriesMoodRecommendKidsArgs = {
  dislikes?: InputMaybe<Array<Scalars['String']['input']>>;
  filters?: InputMaybe<MoodKidsRecommendFiltersInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<KidRecommenderTagsInput>>;
  work?: InputMaybe<Scalars['String']['input']>;
};


export type MoodQueriesMoodSearchArgs = {
  field?: InputMaybe<MoodSearchFieldValuesEnum>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  q: Scalars['String']['input'];
};


export type MoodQueriesMoodSearchKidsArgs = {
  field?: InputMaybe<MoodSearchFieldValuesEnum>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  q: Scalars['String']['input'];
};


export type MoodQueriesMoodSuggestArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  q: Scalars['String']['input'];
};


export type MoodQueriesMoodTagRecommendArgs = {
  hasCover?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  minus?: InputMaybe<Array<Scalars['String']['input']>>;
  plus?: InputMaybe<Array<Scalars['String']['input']>>;
  tags: Array<Scalars['String']['input']>;
};


export type MoodQueriesMoodWorkRecommendArgs = {
  dislikes?: InputMaybe<Array<Scalars['String']['input']>>;
  hasCover?: InputMaybe<Scalars['Boolean']['input']>;
  likes: Array<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxAuthorRecommendations?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  threshold?: InputMaybe<Scalars['Float']['input']>;
};

/** The reponse from moodrecommenkids */
export type MoodRecommendKidsResponse = {
  __typename?: 'MoodRecommendKidsResponse';
  works: Array<Work>;
};


/** The reponse from moodrecommenkids */
export type MoodRecommendKidsResponseWorksArgs = {
  limit: Scalars['PaginationLimitScalar']['input'];
  offset: Scalars['Int']['input'];
};

/** Supported fields for moodsearch request */
export type MoodSearchFieldValuesEnum =
  | 'ALL'
  | 'ALLTAGS'
  | 'CREATOR'
  | 'MOODTAGS'
  | 'TITLE';

/** The reponse from moodsearchkids */
export type MoodSearchKidsResponse = {
  __typename?: 'MoodSearchKidsResponse';
  works: Array<Work>;
};


/** The reponse from moodsearchkids */
export type MoodSearchKidsResponseWorksArgs = {
  limit: Scalars['PaginationLimitScalar']['input'];
  offset: Scalars['Int']['input'];
};

/** The response from moodsearch */
export type MoodSearchResponse = {
  __typename?: 'MoodSearchResponse';
  /** The works matching the given search query. Use offset and limit for pagination. */
  works: Array<Work>;
};


/** The response from moodsearch */
export type MoodSearchResponseWorksArgs = {
  limit: Scalars['PaginationLimitScalar']['input'];
  offset: Scalars['Int']['input'];
};

/** Type of moodSuggest response */
export type MoodSuggestEnum =
  | 'CREATOR'
  | 'TAG'
  | 'TITLE';

/** MoodSuggest item */
export type MoodSuggestItem = {
  __typename?: 'MoodSuggestItem';
  /** Suggestion */
  term: Scalars['String']['output'];
  /**
   * A unique identifier for tracking user interactions with this suggestion.
   * It is generated in the response and should be included in subsequent
   * API calls when this manifestation is selected.
   */
  traceId: Scalars['String']['output'];
  /** The type of suggestion title/creator/tag */
  type: MoodSuggestEnum;
  /** A work associated with the suggestion */
  work?: Maybe<Work>;
};

/** The response type for moodSuggest */
export type MoodSuggestResponse = {
  __typename?: 'MoodSuggestResponse';
  /** Response is an array of MoodSuggestResponse */
  response: Array<MoodSuggestItem>;
};

/** Response type for moodTagRecommend */
export type MoodTagRecommendResponse = {
  __typename?: 'MoodTagRecommendResponse';
  similarity?: Maybe<Scalars['Float']['output']>;
  work: Work;
};

export type Mutation = {
  __typename?: 'Mutation';
  elba: ElbaServices;
};

export type NarrativeTechnique = SubjectInterface & {
  __typename?: 'NarrativeTechnique';
  display: Scalars['String']['output'];
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  type: SubjectTypeEnum;
};

export type Note = {
  __typename?: 'Note';
  /** The actual notes */
  display: Array<Scalars['String']['output']>;
  /** Heading before note */
  heading?: Maybe<Scalars['String']['output']>;
  /** The type of note - e.g. note about language, genre etc, NOT_SPECIFIED if not known.  */
  type: NoteTypeEnum;
  /** A link and possible link text */
  urls?: Maybe<Array<Maybe<AccessUrl>>>;
};

export type NoteTypeEnum =
  | 'CONNECTION_TO_OTHER_WORKS'
  | 'CONTAINS_AI_GENERATED_CONTENT'
  | 'DESCRIPTION_OF_MATERIAL'
  | 'DISSERTATION'
  | 'EDITION'
  | 'ESTIMATED_PLAYING_TIME_FOR_GAMES'
  | 'EXPECTED_PUBLICATION_DATE'
  | 'FREQUENCY'
  | 'MUSICAL_ENSEMBLE_OR_CAST'
  | 'NOT_SPECIFIED'
  | 'OCCASION_FOR_PUBLICATION'
  | 'ORIGINAL_TITLE'
  | 'ORIGINAL_VERSION'
  | 'REFERENCES'
  | 'RESTRICTIONS_ON_USE'
  | 'TECHNICAL_REQUIREMENTS'
  | 'TYPE_OF_SCORE'
  | 'WITHDRAWN_PUBLICATION';

export type Pegi = {
  __typename?: 'PEGI';
  /** Display string for PEGI minimum age */
  display?: Maybe<Scalars['String']['output']>;
  /** Minimum age to play the game. PEGI rating */
  minimumAge?: Maybe<Scalars['Int']['output']>;
};

export type Person = CreatorInterface & SubjectInterface & {
  __typename?: 'Person';
  /** Creator aliases, creators behind used pseudonym */
  aliases: Array<Person>;
  /** Added information about the person, like Henri, konge af Frankrig */
  attributeToName?: Maybe<Scalars['String']['output']>;
  /** Birth year of the person */
  birthYear?: Maybe<Scalars['String']['output']>;
  /** The person's whole name in normal order */
  display: Scalars['String']['output'];
  /** First name of the person */
  firstName?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Language>;
  /** Last name of the person */
  lastName?: Maybe<Scalars['String']['output']>;
  local?: Maybe<Scalars['Boolean']['output']>;
  /** The person's full name inverted */
  nameSort: Scalars['String']['output'];
  /** A list of which kinds of contributions this person made to this creation */
  roles: Array<Role>;
  /** A roman numeral added to the person, like Christian IV */
  romanNumeral?: Maybe<Scalars['String']['output']>;
  type: SubjectTypeEnum;
  /** VIAF identifier of the creator */
  viafid?: Maybe<Scalars['String']['output']>;
};

export type PhysicalUnitDescription = {
  __typename?: 'PhysicalUnitDescription';
  /** Material that comes with the manifestation (bilag) */
  accompanyingMaterial?: Maybe<Scalars['String']['output']>;
  /** List of units contained within the material */
  materialUnits?: Maybe<Array<UnitDescription>>;
  /** Number of pages of the manifestation as number */
  numberOfPages?: Maybe<Scalars['Int']['output']>;
  /** A summary of the physical description of this manifestation like extent (pages/minutes), illustrations etc. */
  summaryFull?: Maybe<Scalars['String']['output']>;
};

export type Players = {
  __typename?: 'Players';
  /** Number of players interval begin. */
  begin?: Maybe<Scalars['Int']['output']>;
  /** Display name for the number of players. */
  display?: Maybe<Scalars['String']['output']>;
  /** Number of players interval end. */
  end?: Maybe<Scalars['Int']['output']>;
};

export type Printing = {
  __typename?: 'Printing';
  /** The printing number and name */
  printing: Scalars['String']['output'];
  /** A year as displayable text and as number */
  publicationYear?: Maybe<PublicationYear>;
  /** Publisher of printing when other than the original publisher of the edition (260*b) */
  publisher?: Maybe<Scalars['String']['output']>;
  /** Properties 'printing' and 'publicationYear' as one string, e.g.: '11. oplag, 2020' */
  summary: Scalars['String']['output'];
};

export type PublicationYear = {
  __typename?: 'PublicationYear';
  display: Scalars['String']['output'];
  endYear?: Maybe<Scalars['Int']['output']>;
  frequency?: Maybe<Scalars['String']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type Query = {
  __typename?: 'Query';
  complexSearch: ComplexSearchResponse;
  /** All indexes in complex search */
  complexSearchIndexes?: Maybe<Array<ComplexSearchIndex>>;
  complexSuggest: ComplexSuggestResponse;
  debug?: Maybe<Debug>;
  infomedia: InfomediaResponse;
  linkCheck: LinkCheckService;
  localSuggest: LocalSuggestResponse;
  manifestation?: Maybe<Manifestation>;
  manifestations: Array<Maybe<Manifestation>>;
  mood: MoodQueries;
  /** Get recommendations */
  recommend: RecommendationResponse;
  /** Access to various types of recommendations. */
  recommendations: Recommendations;
  refWorks: Scalars['String']['output'];
  /** @deprecated Use 'Recommendations.subjects' instead expires: 01/03-2025 */
  relatedSubjects?: Maybe<Array<Scalars['String']['output']>>;
  ris: Scalars['String']['output'];
  search: SearchResponse;
  series?: Maybe<Series>;
  suggest: SuggestResponse;
  universe?: Maybe<Universe>;
  work?: Maybe<Work>;
  works: Array<Maybe<Work>>;
};


export type QueryComplexSearchArgs = {
  cql: Scalars['String']['input'];
  facets?: InputMaybe<ComplexSearchFacetsInput>;
  filters?: InputMaybe<ComplexSearchFiltersInput>;
};


export type QueryComplexSuggestArgs = {
  q: Scalars['String']['input'];
  type: ComplexSuggestionTypeEnum;
};


export type QueryInfomediaArgs = {
  id: Scalars['String']['input'];
};


export type QueryLocalSuggestArgs = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  q: Scalars['String']['input'];
  suggestType?: InputMaybe<Array<SuggestionTypeEnum>>;
};


export type QueryManifestationArgs = {
  faust?: InputMaybe<Scalars['String']['input']>;
  pid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryManifestationsArgs = {
  faust?: InputMaybe<Array<Scalars['String']['input']>>;
  pid?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryRecommendArgs = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  faust?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  pid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRefWorksArgs = {
  pids: Array<Scalars['String']['input']>;
};


export type QueryRelatedSubjectsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  q: Array<Scalars['String']['input']>;
};


export type QueryRisArgs = {
  pids: Array<Scalars['String']['input']>;
};


export type QuerySearchArgs = {
  filters?: InputMaybe<SearchFiltersInput>;
  q: SearchQueryInput;
  search_exact?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerySeriesArgs = {
  seriesId: Scalars['String']['input'];
};


export type QuerySuggestArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  q: Scalars['String']['input'];
  suggestType?: InputMaybe<SuggestionTypeEnum>;
  suggestTypes?: InputMaybe<Array<SuggestionTypeEnum>>;
  workType?: InputMaybe<WorkTypeEnum>;
};


export type QueryUniverseArgs = {
  key?: InputMaybe<Scalars['String']['input']>;
  universeId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkArgs = {
  faust?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<LanguageCodeEnum>;
  oclc?: InputMaybe<Scalars['String']['input']>;
  pid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorksArgs = {
  faust?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Array<Scalars['String']['input']>>;
  language?: InputMaybe<LanguageCodeEnum>;
  oclc?: InputMaybe<Array<Scalars['String']['input']>>;
  pid?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Range = {
  __typename?: 'Range';
  begin?: Maybe<Scalars['Int']['output']>;
  display: Scalars['String']['output'];
  end?: Maybe<Scalars['Int']['output']>;
};

export type Recommendation = {
  __typename?: 'Recommendation';
  /** The recommended manifestation */
  manifestation: Manifestation;
  /** Info on how this recommendation was generated */
  reader: Array<Scalars['String']['output']>;
  /** The recommended work */
  work: Work;
};

export type RecommendationResponse = {
  __typename?: 'RecommendationResponse';
  result: Array<Recommendation>;
};

/** Get different kinds of recommendations */
export type Recommendations = {
  __typename?: 'Recommendations';
  /**
   * Retrieve subject-based recommendations based on a list of query strings and an optional limit.
   * - q: An array of strings used to generate subject recommendations.
   * - limit: The maximum number of recommendations to return.
   */
  subjects?: Maybe<Array<SubjectRecommendation>>;
};


/** Get different kinds of recommendations */
export type RecommendationsSubjectsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  q: Array<Scalars['String']['input']>;
};

export type RelatedPublication = {
  __typename?: 'RelatedPublication';
  /** Faust of the related publication */
  faust?: Maybe<Scalars['String']['output']>;
  /** Notes describing the relation of the related periodical/journal/publication */
  heading: Scalars['String']['output'];
  /** ISBN of the related publication */
  isbn?: Maybe<Scalars['String']['output']>;
  /** ISSN of the related periodical/journal/publication */
  issn?: Maybe<Scalars['String']['output']>;
  /** Title of the related periodical/journal */
  title: Array<Scalars['String']['output']>;
  /** The first URL of the urls in related publications */
  url?: Maybe<Scalars['String']['output']>;
  /** Note regarding the URL of the related publication */
  urlText?: Maybe<Scalars['String']['output']>;
  /** Alle urls of the related publication */
  urls: Array<Maybe<Scalars['String']['output']>>;
};

export type Relations = {
  __typename?: 'Relations';
  /** The story of this article is continued in this or these other article(s) */
  continuedIn: Array<Manifestation>;
  /** This story of this article actually started in this or these other article(s) */
  continues: Array<Manifestation>;
  /** The contents of this articles is also discussed in these articles */
  discussedIn: Array<Manifestation>;
  /** The article discusses the content of these articles */
  discusses: Array<Manifestation>;
  /** This story is adapted in this or these movie(s) */
  hasAdaptation: Array<Manifestation>;
  /** The contents of this manifestation is analysed in these manifestations */
  hasAnalysis: Array<Manifestation>;
  /** The creator of this manifestation is portrayed in these manifestations */
  hasCreatorDescription: Array<Manifestation>;
  /** The publisher of this manifestation has made a description of the content */
  hasDescriptionFromPublisher: Array<Manifestation>;
  /** This movie is based on this manuscript */
  hasManuscript: Array<Manifestation>;
  /** This manifestation has a 'materialevurdering' that was originally made for another manifestation, but it is still relevant (e.g. book/ebook) */
  hasReusedReview: Array<Manifestation>;
  /** This manifestation has these reviews */
  hasReview: Array<Manifestation>;
  /** This movie or game has this sound track */
  hasSoundtrack: Array<Manifestation>;
  /** This album has these tracks */
  hasTrack: Array<Manifestation>;
  /** This movie is based on this or these books */
  isAdaptationOf: Array<Manifestation>;
  /** This manifestation is an analysis of these manifestations */
  isAnalysisOf: Array<Manifestation>;
  /** This is a description from the original publisher of these manifestations */
  isDescriptionFromPublisherOf: Array<Manifestation>;
  /** This movie is based on this manuscript */
  isManuscriptOf: Array<Manifestation>;
  /** This music track is part of these albums */
  isPartOfAlbum: Array<Manifestation>;
  /** This article or book part can be found in these manifestations */
  isPartOfManifestation: Array<Manifestation>;
  /** This 'materialevurdering' can also be used to review these relevant manifestations, even though it was originally made for another publication */
  isReusedReviewOf: Array<Manifestation>;
  /** This manifestation is a review of these manifestations */
  isReviewOf: Array<Manifestation>;
  /** This sound track for a game is related to these games */
  isSoundtrackOfGame: Array<Manifestation>;
  /** This sound track for a movie is related to these movies */
  isSoundtrackOfMovie: Array<Manifestation>;
};

export type ReviewElement = {
  __typename?: 'ReviewElement';
  content?: Maybe<Scalars['String']['output']>;
  /**
   * This is a paragraph containing markup where links to manifestations
   * can be inserted. For instance '"Axel Steens nye job minder om [870970-basis:20307021] fra ...'.
   * Relevant manifestations are located in the manifestations field.
   */
  contentSubstitute?: Maybe<Scalars['String']['output']>;
  heading?: Maybe<Scalars['String']['output']>;
  /** Manifestations that can be used to generate and insert links into 'contentSubsitute'. */
  manifestations?: Maybe<Array<Maybe<Manifestation>>>;
  type?: Maybe<ReviewElementTypeEnum>;
};

export type ReviewElementTypeEnum =
  | 'ABSTRACT'
  | 'ACQUISITION_RECOMMENDATIONS'
  | 'AUDIENCE'
  | 'CONCLUSION'
  | 'DESCRIPTION'
  | 'EVALUATION'
  | 'SIMILAR_MATERIALS';

export type Role = {
  __typename?: 'Role';
  /** The type of creator/contributor as text in singular and plural in Danish, e.g. forfatter/forfattere, komponist/komponister etc */
  function: Translation;
  /** The code for the type of creator or contributor, e.g. 'aut' for author, 'ill' for illustrator etc */
  functionCode: Scalars['String']['output'];
};

export type SchoolUse = {
  __typename?: 'SchoolUse';
  code: SchoolUseCodeEnum;
  display: Scalars['String']['output'];
};

export type SchoolUseCodeEnum =
  | 'FOR_SCHOOL_USE'
  | 'FOR_TEACHER';

/** Search Filters */
export type SearchFiltersInput = {
  accessTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  age?: InputMaybe<Array<Scalars['String']['input']>>;
  ageRange?: InputMaybe<Array<Scalars['String']['input']>>;
  branchId?: InputMaybe<Array<Scalars['String']['input']>>;
  canAlwaysBeLoaned?: InputMaybe<Array<Scalars['String']['input']>>;
  childrenOrAdults?: InputMaybe<Array<Scalars['String']['input']>>;
  creators?: InputMaybe<Array<Scalars['String']['input']>>;
  department?: InputMaybe<Array<Scalars['String']['input']>>;
  dk5?: InputMaybe<Array<Scalars['String']['input']>>;
  fictionNonfiction?: InputMaybe<Array<Scalars['String']['input']>>;
  fictionalCharacters?: InputMaybe<Array<Scalars['String']['input']>>;
  gamePlatform?: InputMaybe<Array<Scalars['String']['input']>>;
  generalAudience?: InputMaybe<Array<Scalars['String']['input']>>;
  genreAndForm?: InputMaybe<Array<Scalars['String']['input']>>;
  letRange?: InputMaybe<Array<Scalars['String']['input']>>;
  libraryRecommendation?: InputMaybe<Array<Scalars['String']['input']>>;
  lixRange?: InputMaybe<Array<Scalars['String']['input']>>;
  location?: InputMaybe<Array<Scalars['String']['input']>>;
  mainLanguages?: InputMaybe<Array<Scalars['String']['input']>>;
  materialTypesGeneral?: InputMaybe<Array<Scalars['String']['input']>>;
  materialTypesSpecific?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<Array<HoldingsStatusEnum>>;
  subjects?: InputMaybe<Array<Scalars['String']['input']>>;
  sublocation?: InputMaybe<Array<Scalars['String']['input']>>;
  workTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  year?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A search hit that encapsulates a matched manifestation from a search query. */
export type SearchHit = {
  __typename?: 'SearchHit';
  /** The manifestation that was matched during the search. */
  match?: Maybe<Manifestation>;
};

/** The supported fields to query */
export type SearchQueryInput = {
  /**
   * Search for title, creator, subject or a combination.
   * This is typically used where a single search box is desired.
   */
  all?: InputMaybe<Scalars['String']['input']>;
  /** Search for creator */
  creator?: InputMaybe<Scalars['String']['input']>;
  /** Search for specific subject */
  subject?: InputMaybe<Scalars['String']['input']>;
  /** Search for specific title */
  title?: InputMaybe<Scalars['String']['input']>;
};

/** The simple search response */
export type SearchResponse = {
  __typename?: 'SearchResponse';
  /** A list of alternative search queries */
  didYouMean: Array<DidYouMean>;
  /**
   * Make sure only to fetch this when needed
   * This may take seconds to complete
   */
  facets: Array<FacetResult>;
  /** Total number of works found. May be used for pagination. */
  hitcount: Scalars['Int']['output'];
  /** Will return the facets that best match the input query and filters */
  intelligentFacets: Array<FacetResult>;
  /** The works matching the given search query. Use offset and limit for pagination. */
  works: Array<Work>;
};


/** The simple search response */
export type SearchResponseDidYouMeanArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** The simple search response */
export type SearchResponseFacetsArgs = {
  facets: Array<FacetFieldEnum>;
};


/** The simple search response */
export type SearchResponseIntelligentFacetsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** The simple search response */
export type SearchResponseWorksArgs = {
  limit: Scalars['PaginationLimitScalar']['input'];
  offset: Scalars['Int']['input'];
};

export type SerieWork = {
  __typename?: 'SerieWork';
  /** The number of work in the series as a number (as text) */
  numberInSeries?: Maybe<Scalars['String']['output']>;
  /** Information about whether this work in the series should be read first */
  readThisFirst?: Maybe<Scalars['Boolean']['output']>;
  /** Information about whether this work in the series can be read without considering the order of the series, it can be read at any time */
  readThisWhenever?: Maybe<Scalars['Boolean']['output']>;
  /** Work of a serieWork */
  work: Work;
};

export type Series = {
  __typename?: 'Series';
  /** A alternative title to the main 'title' of the series */
  alternativeTitles: Array<Scalars['String']['output']>;
  /** Description of the series */
  description?: Maybe<Scalars['String']['output']>;
  /** The number of members in the series */
  hitcount: Scalars['Int']['output'];
  /** Additional information  */
  identifyingAddition?: Maybe<Scalars['String']['output']>;
  /** Whether this is a popular series or general series */
  isPopular?: Maybe<Scalars['Boolean']['output']>;
  /** MainLanguages of the series */
  mainLanguages: Array<Scalars['String']['output']>;
  /** Members of this serie.  */
  members: Array<SerieWork>;
  /** The number in the series as text qoutation */
  numberInSeries?: Maybe<Scalars['String']['output']>;
  /** A parallel title to the main 'title' of the series, in a different language */
  parallelTitles: Array<Scalars['String']['output']>;
  /** Information about whether this work in the series should be read first */
  readThisFirst?: Maybe<Scalars['Boolean']['output']>;
  /** Information about whether this work in the series can be read without considering the order of the series, it can be read at any time */
  readThisWhenever?: Maybe<Scalars['Boolean']['output']>;
  /** Identifier for the series */
  seriesId?: Maybe<Scalars['String']['output']>;
  /** The title of the series */
  title: Scalars['String']['output'];
  /** Traceid for tracking */
  traceId: Scalars['String']['output'];
  /** WorkTypes for the series */
  workTypes: Array<Scalars['String']['output']>;
};


export type SeriesMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Setting = SubjectInterface & {
  __typename?: 'Setting';
  display: Scalars['String']['output'];
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  type: SubjectTypeEnum;
};

export type SheetMusicCategory = {
  __typename?: 'SheetMusicCategory';
  /** The types of chamber music material covers */
  chamberMusicTypes: Array<Scalars['String']['output']>;
  /** The types of choir material covers */
  choirTypes: Array<Scalars['String']['output']>;
  /** I this node for exercises */
  forMusicalExercise?: Maybe<Scalars['Boolean']['output']>;
  /** The types of instruments material covers */
  instruments: Array<Scalars['String']['output']>;
  /** The types of orchestra material covers */
  orchestraTypes: Array<Scalars['String']['output']>;
};

export type Shelfmark = {
  __typename?: 'Shelfmark';
  /** A postfix to the shelfmark, eg. 99.4 Christensen, Inger. f. 1935 */
  postfix?: Maybe<Scalars['String']['output']>;
  /** The actual shelfmark - e.g. information about on which shelf in the library this manifestation can be found, e.g. 99.4 */
  shelfmark: Scalars['String']['output'];
};

export type SortInput = {
  index: Scalars['String']['input'];
  order: SortOrderEnum;
};

export type SortOrderEnum =
  | 'ASC'
  | 'DESC';

export type SpecificMaterialType = {
  __typename?: 'SpecificMaterialType';
  /** code for materialType */
  code: Scalars['String']['output'];
  /** Ths string to display */
  display: Scalars['String']['output'];
};

export type SubjectContainer = {
  __typename?: 'SubjectContainer';
  /** All subjects */
  all: Array<SubjectInterface>;
  /** Only DBC verified subjects */
  dbcVerified: Array<SubjectInterface>;
};

export type SubjectInterface = {
  display: Scalars['String']['output'];
  /** Language of the subject - contains display and isoCode  */
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  /** The type of subject - 'location', 'time period' etc., 'topic' if not specific kind of subject term */
  type: SubjectTypeEnum;
};

/** Details about a single subject recommendation. */
export type SubjectRecommendation = {
  __typename?: 'SubjectRecommendation';
  /** The recommended subject. */
  subject: Scalars['String']['output'];
  /**
   * A unique identifier for tracking user interactions with this subject recommendation.
   * It is generated in the response and should be included in subsequent
   * API calls when this suggestion is selected.
   */
  traceId: Scalars['String']['output'];
};

export type SubjectText = SubjectInterface & {
  __typename?: 'SubjectText';
  display: Scalars['String']['output'];
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  type: SubjectTypeEnum;
};

export type SubjectTypeEnum =
  | 'CORPORATION'
  | 'ENVIRONMENT'
  | 'FICTIONAL_CHARACTER'
  | 'FICTIONAL_LOCATION'
  | 'FILM_NATIONALITY'
  | 'LAESEKOMPASSET'
  | 'LIBRARY_OF_CONGRESS_SUBJECT_HEADING'
  | 'LOCATION'
  | 'MEDICAL_SUBJECT_HEADING'
  | 'MOOD'
  | 'MOOD_CHILDREN'
  | 'MUSICAL_INSTRUMENTATION'
  | 'MUSIC_COUNTRY_OF_ORIGIN'
  | 'MUSIC_TIME_PERIOD'
  | 'NATIONAL_AGRICULTURAL_LIBRARY'
  /** added for manifestation.parts.creators/person - they get a type from small-rye */
  | 'PERSON'
  | 'PERSPECTIVE'
  | 'REALITY'
  | 'STYLE'
  | 'TEMPO'
  | 'TIME_PERIOD'
  | 'TITLE'
  | 'TOPIC'
  /** Subject describing selected topics for children, and a rating. */
  | 'TOPIC_CHILDREN';

export type SubjectWithRating = SubjectInterface & {
  __typename?: 'SubjectWithRating';
  display: Scalars['String']['output'];
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  /** Expressed as integer on a scale from 1 to 5 */
  rating?: Maybe<Scalars['Int']['output']>;
  type: SubjectTypeEnum;
};

export type SuggestResponse = {
  __typename?: 'SuggestResponse';
  result: Array<Suggestion>;
};

export type Suggestion = {
  __typename?: 'Suggestion';
  /** The suggested term which can be searched for */
  term: Scalars['String']['output'];
  /**
   * A unique identifier for tracking user interactions with this suggestion.
   * It is generated in the response and should be included in subsequent
   * API calls when this suggestion is selected.
   */
  traceId: Scalars['String']['output'];
  /** The type of suggestion: creator, subject or title */
  type: SuggestionTypeEnum;
  /** A work related to the term */
  work?: Maybe<Work>;
};

export type SuggestionTypeEnum =
  | 'COMPOSIT'
  | 'CREATOR'
  | 'SUBJECT'
  | 'TITLE';

export type TableOfContent = {
  __typename?: 'TableOfContent';
  content?: Maybe<Scalars['String']['output']>;
  heading?: Maybe<Scalars['String']['output']>;
  listOfContent?: Maybe<Array<TableOfContent>>;
};

export type TimePeriod = SubjectInterface & {
  __typename?: 'TimePeriod';
  display: Scalars['String']['output'];
  language?: Maybe<Language>;
  local?: Maybe<Scalars['Boolean']['output']>;
  period: Range;
  type: SubjectTypeEnum;
};

export type Translation = {
  __typename?: 'Translation';
  /** Translation in plural form, e.g. forfattere, komponister, instruktører etc. */
  plural: Scalars['String']['output'];
  /** Translation in singular form, e.g. forfatter, komponist, instruktør */
  singular: Scalars['String']['output'];
};

export type TvSeries = {
  __typename?: 'TvSeries';
  /** Dansih translated title of the tv serie */
  danishLaunchTitle?: Maybe<Scalars['String']['output']>;
  /** Detailed information about the disc */
  disc?: Maybe<TvSeriesDetails>;
  /** Detailed information about the episode */
  episode?: Maybe<TvSeriesDetails>;
  /** Episode titles */
  episodeTitles?: Maybe<Array<Scalars['String']['output']>>;
  /** Detailed information about the season */
  season?: Maybe<TvSeriesDetails>;
  /** Title of the tv serie */
  title?: Maybe<Scalars['String']['output']>;
  /** Detailed information about the volume */
  volume?: Maybe<TvSeriesDetails>;
};

export type TvSeriesDetails = {
  __typename?: 'TvSeriesDetails';
  display?: Maybe<Scalars['String']['output']>;
  numbers?: Maybe<Array<Scalars['Int']['output']>>;
};

export type Unit = {
  __typename?: 'Unit';
  id: Scalars['String']['output'];
  manifestations: Array<Manifestation>;
};

export type UnitDescription = {
  __typename?: 'UnitDescription';
  /** Other physical description, eg. illustrations, color or b/w, mono/stereo, rpm */
  additionalDescription?: Maybe<Scalars['String']['output']>;
  /** Number of pages, tab (books, articles etc.) or playingtime (cd, dvd etc.) */
  extent?: Maybe<Scalars['String']['output']>;
  /** Technical formats, e.g. Playstation 4, blu-ray */
  numberAndType?: Maybe<Scalars['String']['output']>;
  /** Size of the material unit */
  size?: Maybe<Scalars['String']['output']>;
  /** Assemblance of the data from all the other properties, separated by a comma */
  summary: Scalars['String']['output'];
  /** Technical formats, e.g. Playstation 4, blu-ray */
  technicalInformation?: Maybe<Scalars['String']['output']>;
};

export type Universe = {
  __typename?: 'Universe';
  /** A alternative title to the main 'title' of the universe */
  alternativeTitles?: Maybe<Array<Scalars['String']['output']>>;
  /** both series and works in a list */
  content: UniverseContentResult;
  /** Description of the universe */
  description?: Maybe<Scalars['String']['output']>;
  /** A key that identifies a universe. */
  key?: Maybe<Scalars['String']['output']>;
  /** All series within the universe */
  series: Array<Series>;
  /** Literary/movie universe this work is part of e.g. Wizarding World, Marvel Cinematic Universe */
  title: Scalars['String']['output'];
  /**
   * A unique identifier for tracking user interactions with this universe.
   * It is generated in the response and should be included in subsequent
   * API calls when this work is selected.
   */
  traceId: Scalars['String']['output'];
  /** An id that identifies a universe. */
  universeId?: Maybe<Scalars['String']['output']>;
  /** work types that are in this universe */
  workTypes: Array<WorkTypeEnum>;
  /** All works within the universe but not in any series */
  works: Array<Work>;
};


export type UniverseContentArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  workType?: InputMaybe<WorkTypeEnum>;
};


export type UniverseSeriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  workType?: InputMaybe<WorkTypeEnum>;
};


export type UniverseWorksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  workType?: InputMaybe<WorkTypeEnum>;
};

export type UniverseContentResult = {
  __typename?: 'UniverseContentResult';
  entries: Array<UniverseContentUnion>;
  hitcount: Scalars['Int']['output'];
};

export type UniverseContentUnion = Series | Work;

export type Work = {
  __typename?: 'Work';
  /** Abstract of the entity */
  abstract?: Maybe<Array<Scalars['String']['output']>>;
  /** Creators */
  creators: Array<CreatorInterface>;
  /** DK5 main entry for this work */
  dk5MainEntry?: Maybe<Dk5MainEntry>;
  /** Overall literary category/genre of this work. e.g. fiction or nonfiction. In Danish skønlitteratur/faglitteratur for literature, fiktion/nonfiktion for other types. */
  fictionNonfiction?: Maybe<FictionNonfiction>;
  /** The genre, (literary) form, type etc. of this work */
  genreAndForm: Array<Scalars['String']['output']>;
  /** Date of latest publication */
  latestPublicationDate?: Maybe<Scalars['String']['output']>;
  /** The main language(s) of the work's content */
  mainLanguages: Array<Language>;
  /** Details about the manifestations of this work */
  manifestations: Manifestations;
  /** The type of material of the manifestation based on bibliotek.dk types */
  materialTypes: Array<MaterialType>;
  /** Relations to other manifestations */
  relations: Relations;
  /** Series for this work */
  series: Array<Series>;
  /** Subjects for this work */
  subjects: SubjectContainer;
  titles: WorkTitles;
  /**
   * A unique identifier for tracking user interactions with this work.
   * It is generated in the response and should be included in subsequent
   * API calls when this work is selected.
   */
  traceId: Scalars['String']['output'];
  /** Literary/movie universes this work is part of, e.g. Wizarding World, Marvel Universe */
  universes: Array<Universe>;
  /** Unique identification of the work based on work-presentation id e.g work-of:870970-basis:54029519 */
  workId: Scalars['String']['output'];
  /** Worktypes for this work - 'none' replaced by 'other' */
  workTypes: Array<WorkTypeEnum>;
  /** The year this work was originally published or produced */
  workYear?: Maybe<PublicationYear>;
};

export type WorkTitles = {
  __typename?: 'WorkTitles';
  /** The full title(s) of the work including subtitles etc */
  full: Array<Scalars['String']['output']>;
  /** The main title(s) of the work */
  main: Array<Scalars['String']['output']>;
  /** The title of the work that this expression/manifestation is translated from or based on. The original title(s) of a film which has a different distribution title. */
  original?: Maybe<Array<Scalars['String']['output']>>;
  /** Titles (in other languages) parallel to the main 'title' of the work */
  parallel: Array<Scalars['String']['output']>;
  /** The sorted title of the entity */
  sort: Scalars['String']['output'];
  /** The standard title of the entity, used for music and movies */
  standard?: Maybe<Scalars['String']['output']>;
  /** The title of the entity with the language of the entity in parenthesis after. This field is only generated for non-danish titles. */
  titlePlusLanguage?: Maybe<Scalars['String']['output']>;
  /** Danish translation of the main title */
  translated?: Maybe<Array<Scalars['String']['output']>>;
  /** detailed title for tv series  */
  tvSeries?: Maybe<TvSeries>;
};

export type WorkTypeEnum =
  | 'ANALYSIS'
  | 'ARTICLE'
  | 'BOOKDESCRIPTION'
  | 'GAME'
  | 'LITERATURE'
  | 'MAP'
  | 'MOVIE'
  | 'MUSIC'
  | 'OTHER'
  | 'PERIODICA'
  | 'PORTRAIT'
  | 'REVIEW'
  | 'SHEETMUSIC'
  | 'TRACK';

export type SearchFacetFragment = { __typename?: 'FacetResult', name: string, values: Array<{ __typename?: 'FacetValue', key: string, term: string, score?: number | null }> };

export type ManifestationCoverFragment = { __typename?: 'Manifestation', pid: string, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null } };

export type ManifestationIdentifiersFragment = { __typename?: 'Manifestation', pid: string, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }> };

export type ManifestationAccessFragment = { __typename?: 'Manifestation', accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
    | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
    | { __typename: 'DigitalArticleService', issn: string }
    | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
    | { __typename: 'InfomediaService', id: string }
    | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
  > };

export type ManifestationTitlesFragment = { __typename?: 'Manifestation', titles: { __typename?: 'ManifestationTitles', identifyingAddition?: string | null, full: Array<string> } };

export type ManifestationLanguagesFragment = { __typename?: 'Manifestation', languages?: { __typename?: 'Languages', main?: Array<{ __typename?: 'Language', display: string, isoCode: string }> | null } | null };

export type ManifestationDescriptionFragment = { __typename?: 'Manifestation', audience?: { __typename?: 'Audience', ages: Array<{ __typename?: 'Range', display: string }> } | null, series: Array<{ __typename?: 'Series', numberInSeries?: string | null, title: string }>, subjects: { __typename?: 'SubjectContainer', all: Array<
      | { __typename?: 'Corporation', display: string }
      | { __typename?: 'Mood', display: string }
      | { __typename?: 'NarrativeTechnique', display: string }
      | { __typename?: 'Person', display: string }
      | { __typename?: 'Setting', display: string }
      | { __typename?: 'SubjectText', display: string }
      | { __typename?: 'SubjectWithRating', display: string }
      | { __typename?: 'TimePeriod', display: string }
    > } };

export type ManifestationDetailsFragment = { __typename?: 'Manifestation', genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
    | { __typename?: 'Corporation', display: string }
    | { __typename?: 'Person', display: string }
  > };

export type ManifestationMaterialTypesFragment = { __typename?: 'Manifestation', materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }> };

export type ManifestationSearchPageTeaserFragment = { __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
    | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
    | { __typename: 'DigitalArticleService', issn: string }
    | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
    | { __typename: 'InfomediaService', id: string }
    | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
  >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
    | { __typename?: 'Corporation', display: string }
    | { __typename?: 'Person', display: string }
  > };

export type ManifestationWorkPageFragment = { __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
    | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
    | { __typename: 'DigitalArticleService', issn: string }
    | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
    | { __typename: 'InfomediaService', id: string }
    | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
  >, titles: { __typename?: 'ManifestationTitles', identifyingAddition?: string | null, full: Array<string> }, languages?: { __typename?: 'Languages', main?: Array<{ __typename?: 'Language', display: string, isoCode: string }> | null } | null, audience?: { __typename?: 'Audience', ages: Array<{ __typename?: 'Range', display: string }> } | null, series: Array<{ __typename?: 'Series', numberInSeries?: string | null, title: string }>, subjects: { __typename?: 'SubjectContainer', all: Array<
      | { __typename?: 'Corporation', display: string }
      | { __typename?: 'Mood', display: string }
      | { __typename?: 'NarrativeTechnique', display: string }
      | { __typename?: 'Person', display: string }
      | { __typename?: 'Setting', display: string }
      | { __typename?: 'SubjectText', display: string }
      | { __typename?: 'SubjectWithRating', display: string }
      | { __typename?: 'TimePeriod', display: string }
    > }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
    | { __typename?: 'Corporation', display: string }
    | { __typename?: 'Person', display: string }
  > };

export type WorkAccessFragment = { __typename?: 'Work', workId: string, manifestations: { __typename?: 'Manifestations', all: Array<{ __typename?: 'Manifestation', accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
        | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
        | { __typename: 'DigitalArticleService', issn: string }
        | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
        | { __typename: 'InfomediaService', id: string }
        | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
      > }> } };

export type WorkMaterialTypesFragment = { __typename?: 'Work', materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', display: string, code: GeneralMaterialTypeCodeEnum } }> };

export type WorkTitlesFragment = { __typename?: 'Work', titles: { __typename?: 'WorkTitles', full: Array<string>, original?: Array<string> | null } };

export type WorkCreatorsFragment = { __typename?: 'Work', creators: Array<
    | { __typename: 'Corporation', display: string }
    | { __typename: 'Person', display: string }
  > };

export type WorkPublicationYearFragment = { __typename?: 'Work', workYear?: { __typename?: 'PublicationYear', display: string } | null };

export type WorkDescriptionFragment = { __typename?: 'Work', abstract?: Array<string> | null };

export type WorkTeaserSearchPageFragment = { __typename?: 'Work', workId: string, manifestations: { __typename?: 'Manifestations', all: Array<{ __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
        | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
        | { __typename: 'DigitalArticleService', issn: string }
        | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
        | { __typename: 'InfomediaService', id: string }
        | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
      >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
        | { __typename?: 'Corporation', display: string }
        | { __typename?: 'Person', display: string }
      > }>, bestRepresentation: { __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
        | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
        | { __typename: 'DigitalArticleService', issn: string }
        | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
        | { __typename: 'InfomediaService', id: string }
        | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
      >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
        | { __typename?: 'Corporation', display: string }
        | { __typename?: 'Person', display: string }
      > } }, titles: { __typename?: 'WorkTitles', full: Array<string>, original?: Array<string> | null }, creators: Array<
    | { __typename: 'Corporation', display: string }
    | { __typename: 'Person', display: string }
  >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', display: string, code: GeneralMaterialTypeCodeEnum } }>, workYear?: { __typename?: 'PublicationYear', display: string } | null };

export type WorkFullWorkPageFragment = { __typename?: 'Work', workId: string, abstract?: Array<string> | null, manifestations: { __typename?: 'Manifestations', all: Array<{ __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
        | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
        | { __typename: 'DigitalArticleService', issn: string }
        | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
        | { __typename: 'InfomediaService', id: string }
        | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
      >, titles: { __typename?: 'ManifestationTitles', identifyingAddition?: string | null, full: Array<string> }, languages?: { __typename?: 'Languages', main?: Array<{ __typename?: 'Language', display: string, isoCode: string }> | null } | null, audience?: { __typename?: 'Audience', ages: Array<{ __typename?: 'Range', display: string }> } | null, series: Array<{ __typename?: 'Series', numberInSeries?: string | null, title: string }>, subjects: { __typename?: 'SubjectContainer', all: Array<
          | { __typename?: 'Corporation', display: string }
          | { __typename?: 'Mood', display: string }
          | { __typename?: 'NarrativeTechnique', display: string }
          | { __typename?: 'Person', display: string }
          | { __typename?: 'Setting', display: string }
          | { __typename?: 'SubjectText', display: string }
          | { __typename?: 'SubjectWithRating', display: string }
          | { __typename?: 'TimePeriod', display: string }
        > }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
        | { __typename?: 'Corporation', display: string }
        | { __typename?: 'Person', display: string }
      > }>, bestRepresentation: { __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
        | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
        | { __typename: 'DigitalArticleService', issn: string }
        | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
        | { __typename: 'InfomediaService', id: string }
        | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
      >, titles: { __typename?: 'ManifestationTitles', identifyingAddition?: string | null, full: Array<string> }, languages?: { __typename?: 'Languages', main?: Array<{ __typename?: 'Language', display: string, isoCode: string }> | null } | null, audience?: { __typename?: 'Audience', ages: Array<{ __typename?: 'Range', display: string }> } | null, series: Array<{ __typename?: 'Series', numberInSeries?: string | null, title: string }>, subjects: { __typename?: 'SubjectContainer', all: Array<
          | { __typename?: 'Corporation', display: string }
          | { __typename?: 'Mood', display: string }
          | { __typename?: 'NarrativeTechnique', display: string }
          | { __typename?: 'Person', display: string }
          | { __typename?: 'Setting', display: string }
          | { __typename?: 'SubjectText', display: string }
          | { __typename?: 'SubjectWithRating', display: string }
          | { __typename?: 'TimePeriod', display: string }
        > }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
        | { __typename?: 'Corporation', display: string }
        | { __typename?: 'Person', display: string }
      > } }, titles: { __typename?: 'WorkTitles', full: Array<string>, original?: Array<string> | null }, creators: Array<
    | { __typename: 'Corporation', display: string }
    | { __typename: 'Person', display: string }
  >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', display: string, code: GeneralMaterialTypeCodeEnum } }>, workYear?: { __typename?: 'PublicationYear', display: string } | null };

export type SearchWithPaginationQueryVariables = Exact<{
  q: SearchQueryInput;
  offset: Scalars['Int']['input'];
  limit: Scalars['PaginationLimitScalar']['input'];
  filters?: InputMaybe<SearchFiltersInput>;
}>;


export type SearchWithPaginationQuery = { __typename?: 'Query', search: { __typename?: 'SearchResponse', hitcount: number, works: Array<{ __typename?: 'Work', workId: string, manifestations: { __typename?: 'Manifestations', all: Array<{ __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
            | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
            | { __typename: 'DigitalArticleService', issn: string }
            | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
            | { __typename: 'InfomediaService', id: string }
            | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
          >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
            | { __typename?: 'Corporation', display: string }
            | { __typename?: 'Person', display: string }
          > }>, bestRepresentation: { __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
            | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
            | { __typename: 'DigitalArticleService', issn: string }
            | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
            | { __typename: 'InfomediaService', id: string }
            | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
          >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
            | { __typename?: 'Corporation', display: string }
            | { __typename?: 'Person', display: string }
          > } }, titles: { __typename?: 'WorkTitles', full: Array<string>, original?: Array<string> | null }, creators: Array<
        | { __typename: 'Corporation', display: string }
        | { __typename: 'Person', display: string }
      >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', display: string, code: GeneralMaterialTypeCodeEnum } }>, workYear?: { __typename?: 'PublicationYear', display: string } | null }> } };

export type SearchFacetsQueryVariables = Exact<{
  q: SearchQueryInput;
  facets: Array<FacetFieldEnum> | FacetFieldEnum;
  facetLimit: Scalars['Int']['input'];
  filters?: InputMaybe<SearchFiltersInput>;
}>;


export type SearchFacetsQuery = { __typename?: 'Query', search: { __typename?: 'SearchResponse', facets: Array<{ __typename?: 'FacetResult', name: string, values: Array<{ __typename?: 'FacetValue', key: string, term: string, score?: number | null }> }> } };

export type ComplexSearchForWorkTeaserQueryVariables = Exact<{
  cql: Scalars['String']['input'];
  offset: Scalars['Int']['input'];
  limit: Scalars['PaginationLimitScalar']['input'];
  filters: ComplexSearchFiltersInput;
}>;


export type ComplexSearchForWorkTeaserQuery = { __typename?: 'Query', complexSearch: { __typename?: 'ComplexSearchResponse', hitcount: number, works: Array<{ __typename?: 'Work', workId: string, manifestations: { __typename?: 'Manifestations', all: Array<{ __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
            | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
            | { __typename: 'DigitalArticleService', issn: string }
            | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
            | { __typename: 'InfomediaService', id: string }
            | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
          >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
            | { __typename?: 'Corporation', display: string }
            | { __typename?: 'Person', display: string }
          > }>, bestRepresentation: { __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
            | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
            | { __typename: 'DigitalArticleService', issn: string }
            | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
            | { __typename: 'InfomediaService', id: string }
            | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
          >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
            | { __typename?: 'Corporation', display: string }
            | { __typename?: 'Person', display: string }
          > } }, titles: { __typename?: 'WorkTitles', full: Array<string>, original?: Array<string> | null }, creators: Array<
        | { __typename: 'Corporation', display: string }
        | { __typename: 'Person', display: string }
      >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', display: string, code: GeneralMaterialTypeCodeEnum } }>, workYear?: { __typename?: 'PublicationYear', display: string } | null }> } };

export type GetMaterialQueryVariables = Exact<{
  wid: Scalars['String']['input'];
}>;


export type GetMaterialQuery = { __typename?: 'Query', work?: { __typename?: 'Work', workId: string, abstract?: Array<string> | null, manifestations: { __typename?: 'Manifestations', all: Array<{ __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
          | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
          | { __typename: 'DigitalArticleService', issn: string }
          | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
          | { __typename: 'InfomediaService', id: string }
          | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
        >, titles: { __typename?: 'ManifestationTitles', identifyingAddition?: string | null, full: Array<string> }, languages?: { __typename?: 'Languages', main?: Array<{ __typename?: 'Language', display: string, isoCode: string }> | null } | null, audience?: { __typename?: 'Audience', ages: Array<{ __typename?: 'Range', display: string }> } | null, series: Array<{ __typename?: 'Series', numberInSeries?: string | null, title: string }>, subjects: { __typename?: 'SubjectContainer', all: Array<
            | { __typename?: 'Corporation', display: string }
            | { __typename?: 'Mood', display: string }
            | { __typename?: 'NarrativeTechnique', display: string }
            | { __typename?: 'Person', display: string }
            | { __typename?: 'Setting', display: string }
            | { __typename?: 'SubjectText', display: string }
            | { __typename?: 'SubjectWithRating', display: string }
            | { __typename?: 'TimePeriod', display: string }
          > }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
          | { __typename?: 'Corporation', display: string }
          | { __typename?: 'Person', display: string }
        > }>, bestRepresentation: { __typename?: 'Manifestation', pid: string, genreAndForm: Array<string>, publisher: Array<string>, contributorsFromDescription: Array<string>, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', code: GeneralMaterialTypeCodeEnum, display: string } }>, identifiers: Array<{ __typename?: 'Identifier', type: IdentifierTypeEnum, value: string }>, cover: { __typename?: 'Cover', thumbnail?: string | null, xSmall?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, small?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, medium?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null, large?: { __typename?: 'CoverDetails', url?: string | null, width?: number | null, height?: number | null } | null }, accessTypes: Array<{ __typename?: 'AccessType', code: AccessTypeCodeEnum, display: string }>, access: Array<
          | { __typename: 'AccessUrl', origin: string, url: string, loginRequired: boolean }
          | { __typename: 'DigitalArticleService', issn: string }
          | { __typename: 'Ereol', origin: string, url: string, canAlwaysBeLoaned: boolean }
          | { __typename: 'InfomediaService', id: string }
          | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
        >, titles: { __typename?: 'ManifestationTitles', identifyingAddition?: string | null, full: Array<string> }, languages?: { __typename?: 'Languages', main?: Array<{ __typename?: 'Language', display: string, isoCode: string }> | null } | null, audience?: { __typename?: 'Audience', ages: Array<{ __typename?: 'Range', display: string }> } | null, series: Array<{ __typename?: 'Series', numberInSeries?: string | null, title: string }>, subjects: { __typename?: 'SubjectContainer', all: Array<
            | { __typename?: 'Corporation', display: string }
            | { __typename?: 'Mood', display: string }
            | { __typename?: 'NarrativeTechnique', display: string }
            | { __typename?: 'Person', display: string }
            | { __typename?: 'Setting', display: string }
            | { __typename?: 'SubjectText', display: string }
            | { __typename?: 'SubjectWithRating', display: string }
            | { __typename?: 'TimePeriod', display: string }
          > }, physicalDescription?: { __typename?: 'PhysicalUnitDescription', summaryFull?: string | null } | null, dateFirstEdition?: { __typename?: 'PublicationYear', display: string } | null, edition?: { __typename?: 'Edition', contributors: Array<string>, edition?: string | null, summary: string, publicationYear?: { __typename?: 'PublicationYear', display: string, year?: number | null } | null } | null, contributors: Array<
          | { __typename?: 'Corporation', display: string }
          | { __typename?: 'Person', display: string }
        > } }, titles: { __typename?: 'WorkTitles', full: Array<string>, original?: Array<string> | null }, creators: Array<
      | { __typename: 'Corporation', display: string }
      | { __typename: 'Person', display: string }
    >, materialTypes: Array<{ __typename?: 'MaterialType', materialTypeGeneral: { __typename?: 'GeneralMaterialType', display: string, code: GeneralMaterialTypeCodeEnum } }>, workYear?: { __typename?: 'PublicationYear', display: string } | null } | null };


export const SearchFacetFragmentDoc = `
    fragment SearchFacet on FacetResult {
  name
  values(limit: $facetLimit) {
    key
    term
    score
  }
}
    `;
export const ManifestationAccessFragmentDoc = `
    fragment ManifestationAccess on Manifestation {
  accessTypes {
    code
    display
  }
  access {
    __typename
    ... on AccessUrl {
      origin
      url
      loginRequired
    }
    ... on InfomediaService {
      id
    }
    ... on InterLibraryLoan {
      loanIsPossible
    }
    ... on Ereol {
      origin
      url
      canAlwaysBeLoaned
    }
    ... on DigitalArticleService {
      issn
    }
  }
}
    `;
export const WorkAccessFragmentDoc = `
    fragment WorkAccess on Work {
  workId
  manifestations {
    all {
      ...ManifestationAccess
    }
  }
}
    ${ManifestationAccessFragmentDoc}`;
export const WorkTitlesFragmentDoc = `
    fragment WorkTitles on Work {
  titles {
    full
    original
  }
}
    `;
export const WorkCreatorsFragmentDoc = `
    fragment WorkCreators on Work {
  creators {
    display
    __typename
  }
}
    `;
export const WorkMaterialTypesFragmentDoc = `
    fragment WorkMaterialTypes on Work {
  materialTypes {
    materialTypeGeneral {
      display
      code
    }
  }
}
    `;
export const WorkPublicationYearFragmentDoc = `
    fragment WorkPublicationYear on Work {
  workYear {
    display
  }
}
    `;
export const ManifestationMaterialTypesFragmentDoc = `
    fragment ManifestationMaterialTypes on Manifestation {
  materialTypes {
    materialTypeGeneral {
      code
      display
    }
  }
}
    `;
export const ManifestationIdentifiersFragmentDoc = `
    fragment ManifestationIdentifiers on Manifestation {
  pid
  identifiers {
    type
    value
  }
}
    `;
export const ManifestationCoverFragmentDoc = `
    fragment ManifestationCover on Manifestation {
  pid
  cover {
    thumbnail
    xSmall {
      url
      width
      height
    }
    small {
      url
      width
      height
    }
    medium {
      url
      width
      height
    }
    large {
      url
      width
      height
    }
  }
}
    `;
export const ManifestationDetailsFragmentDoc = `
    fragment ManifestationDetails on Manifestation {
  physicalDescription {
    summaryFull
  }
  dateFirstEdition {
    display
  }
  edition {
    publicationYear {
      display
      year
    }
    contributors
    edition
    summary
  }
  genreAndForm
  publisher
  contributors {
    display
  }
  contributorsFromDescription
}
    `;
export const ManifestationSearchPageTeaserFragmentDoc = `
    fragment ManifestationSearchPageTeaser on Manifestation {
  ...ManifestationAccess
  ...ManifestationMaterialTypes
  ...ManifestationIdentifiers
  ...ManifestationCover
  ...ManifestationDetails
}
    ${ManifestationAccessFragmentDoc}
${ManifestationMaterialTypesFragmentDoc}
${ManifestationIdentifiersFragmentDoc}
${ManifestationCoverFragmentDoc}
${ManifestationDetailsFragmentDoc}`;
export const WorkTeaserSearchPageFragmentDoc = `
    fragment WorkTeaserSearchPage on Work {
  workId
  ...WorkTitles
  ...WorkCreators
  ...WorkMaterialTypes
  ...WorkPublicationYear
  manifestations {
    all {
      ...ManifestationSearchPageTeaser
    }
    bestRepresentation {
      ...ManifestationSearchPageTeaser
    }
  }
}
    ${WorkTitlesFragmentDoc}
${WorkCreatorsFragmentDoc}
${WorkMaterialTypesFragmentDoc}
${WorkPublicationYearFragmentDoc}
${ManifestationSearchPageTeaserFragmentDoc}`;
export const WorkDescriptionFragmentDoc = `
    fragment WorkDescription on Work {
  abstract
}
    `;
export const ManifestationTitlesFragmentDoc = `
    fragment ManifestationTitles on Manifestation {
  titles {
    identifyingAddition
    full
  }
}
    `;
export const ManifestationLanguagesFragmentDoc = `
    fragment ManifestationLanguages on Manifestation {
  languages {
    main {
      display
      isoCode
    }
  }
}
    `;
export const ManifestationDescriptionFragmentDoc = `
    fragment ManifestationDescription on Manifestation {
  audience {
    ages {
      display
    }
  }
  series {
    numberInSeries
    title
  }
  subjects {
    all {
      display
    }
  }
}
    `;
export const ManifestationWorkPageFragmentDoc = `
    fragment ManifestationWorkPage on Manifestation {
  ...ManifestationMaterialTypes
  ...ManifestationIdentifiers
  ...ManifestationCover
  ...ManifestationAccess
  ...ManifestationTitles
  ...ManifestationLanguages
  ...ManifestationDescription
  ...ManifestationDetails
}
    ${ManifestationMaterialTypesFragmentDoc}
${ManifestationIdentifiersFragmentDoc}
${ManifestationCoverFragmentDoc}
${ManifestationAccessFragmentDoc}
${ManifestationTitlesFragmentDoc}
${ManifestationLanguagesFragmentDoc}
${ManifestationDescriptionFragmentDoc}
${ManifestationDetailsFragmentDoc}`;
export const WorkFullWorkPageFragmentDoc = `
    fragment WorkFullWorkPage on Work {
  workId
  ...WorkTitles
  ...WorkCreators
  ...WorkMaterialTypes
  ...WorkPublicationYear
  ...WorkDescription
  manifestations {
    all {
      ...ManifestationWorkPage
    }
    bestRepresentation {
      ...ManifestationWorkPage
    }
  }
}
    ${WorkTitlesFragmentDoc}
${WorkCreatorsFragmentDoc}
${WorkMaterialTypesFragmentDoc}
${WorkPublicationYearFragmentDoc}
${WorkDescriptionFragmentDoc}
${ManifestationWorkPageFragmentDoc}`;
export const SearchWithPaginationDocument = `
    query searchWithPagination($q: SearchQueryInput!, $offset: Int!, $limit: PaginationLimitScalar!, $filters: SearchFiltersInput) {
  search(q: $q, filters: $filters) {
    hitcount
    works(offset: $offset, limit: $limit) {
      ...WorkTeaserSearchPage
    }
  }
}
    ${WorkTeaserSearchPageFragmentDoc}`;

export const useSearchWithPaginationQuery = <
      TData = SearchWithPaginationQuery,
      TError = unknown
    >(
      variables: SearchWithPaginationQueryVariables,
      options?: Omit<UseQueryOptions<SearchWithPaginationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SearchWithPaginationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<SearchWithPaginationQuery, TError, TData>(
      {
    queryKey: ['searchWithPagination', variables],
    queryFn: fetchData<SearchWithPaginationQuery, SearchWithPaginationQueryVariables>(SearchWithPaginationDocument, variables),
    ...options
  }
    )};

useSearchWithPaginationQuery.getKey = (variables: SearchWithPaginationQueryVariables) => ['searchWithPagination', variables];

export const useSuspenseSearchWithPaginationQuery = <
      TData = SearchWithPaginationQuery,
      TError = unknown
    >(
      variables: SearchWithPaginationQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<SearchWithPaginationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<SearchWithPaginationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<SearchWithPaginationQuery, TError, TData>(
      {
    queryKey: ['searchWithPaginationSuspense', variables],
    queryFn: fetchData<SearchWithPaginationQuery, SearchWithPaginationQueryVariables>(SearchWithPaginationDocument, variables),
    ...options
  }
    )};

useSuspenseSearchWithPaginationQuery.getKey = (variables: SearchWithPaginationQueryVariables) => ['searchWithPaginationSuspense', variables];


useSearchWithPaginationQuery.fetcher = (variables: SearchWithPaginationQueryVariables, options?: RequestInit['headers']) => fetchData<SearchWithPaginationQuery, SearchWithPaginationQueryVariables>(SearchWithPaginationDocument, variables, options);

export const SearchFacetsDocument = `
    query searchFacets($q: SearchQueryInput!, $facets: [FacetFieldEnum!]!, $facetLimit: Int!, $filters: SearchFiltersInput) {
  search(q: $q, filters: $filters) {
    facets(facets: $facets) {
      ...SearchFacet
    }
  }
}
    ${SearchFacetFragmentDoc}`;

export const useSearchFacetsQuery = <
      TData = SearchFacetsQuery,
      TError = unknown
    >(
      variables: SearchFacetsQueryVariables,
      options?: Omit<UseQueryOptions<SearchFacetsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SearchFacetsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<SearchFacetsQuery, TError, TData>(
      {
    queryKey: ['searchFacets', variables],
    queryFn: fetchData<SearchFacetsQuery, SearchFacetsQueryVariables>(SearchFacetsDocument, variables),
    ...options
  }
    )};

useSearchFacetsQuery.getKey = (variables: SearchFacetsQueryVariables) => ['searchFacets', variables];

export const useSuspenseSearchFacetsQuery = <
      TData = SearchFacetsQuery,
      TError = unknown
    >(
      variables: SearchFacetsQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<SearchFacetsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<SearchFacetsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<SearchFacetsQuery, TError, TData>(
      {
    queryKey: ['searchFacetsSuspense', variables],
    queryFn: fetchData<SearchFacetsQuery, SearchFacetsQueryVariables>(SearchFacetsDocument, variables),
    ...options
  }
    )};

useSuspenseSearchFacetsQuery.getKey = (variables: SearchFacetsQueryVariables) => ['searchFacetsSuspense', variables];


useSearchFacetsQuery.fetcher = (variables: SearchFacetsQueryVariables, options?: RequestInit['headers']) => fetchData<SearchFacetsQuery, SearchFacetsQueryVariables>(SearchFacetsDocument, variables, options);

export const ComplexSearchForWorkTeaserDocument = `
    query complexSearchForWorkTeaser($cql: String!, $offset: Int!, $limit: PaginationLimitScalar!, $filters: ComplexSearchFiltersInput!) {
  complexSearch(cql: $cql, filters: $filters) {
    hitcount
    works(offset: $offset, limit: $limit) {
      ...WorkTeaserSearchPage
    }
  }
}
    ${WorkTeaserSearchPageFragmentDoc}`;

export const useComplexSearchForWorkTeaserQuery = <
      TData = ComplexSearchForWorkTeaserQuery,
      TError = unknown
    >(
      variables: ComplexSearchForWorkTeaserQueryVariables,
      options?: Omit<UseQueryOptions<ComplexSearchForWorkTeaserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ComplexSearchForWorkTeaserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ComplexSearchForWorkTeaserQuery, TError, TData>(
      {
    queryKey: ['complexSearchForWorkTeaser', variables],
    queryFn: fetchData<ComplexSearchForWorkTeaserQuery, ComplexSearchForWorkTeaserQueryVariables>(ComplexSearchForWorkTeaserDocument, variables),
    ...options
  }
    )};

useComplexSearchForWorkTeaserQuery.getKey = (variables: ComplexSearchForWorkTeaserQueryVariables) => ['complexSearchForWorkTeaser', variables];

export const useSuspenseComplexSearchForWorkTeaserQuery = <
      TData = ComplexSearchForWorkTeaserQuery,
      TError = unknown
    >(
      variables: ComplexSearchForWorkTeaserQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<ComplexSearchForWorkTeaserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<ComplexSearchForWorkTeaserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<ComplexSearchForWorkTeaserQuery, TError, TData>(
      {
    queryKey: ['complexSearchForWorkTeaserSuspense', variables],
    queryFn: fetchData<ComplexSearchForWorkTeaserQuery, ComplexSearchForWorkTeaserQueryVariables>(ComplexSearchForWorkTeaserDocument, variables),
    ...options
  }
    )};

useSuspenseComplexSearchForWorkTeaserQuery.getKey = (variables: ComplexSearchForWorkTeaserQueryVariables) => ['complexSearchForWorkTeaserSuspense', variables];


useComplexSearchForWorkTeaserQuery.fetcher = (variables: ComplexSearchForWorkTeaserQueryVariables, options?: RequestInit['headers']) => fetchData<ComplexSearchForWorkTeaserQuery, ComplexSearchForWorkTeaserQueryVariables>(ComplexSearchForWorkTeaserDocument, variables, options);

export const GetMaterialDocument = `
    query getMaterial($wid: String!) {
  work(id: $wid) {
    ...WorkFullWorkPage
  }
}
    ${WorkFullWorkPageFragmentDoc}`;

export const useGetMaterialQuery = <
      TData = GetMaterialQuery,
      TError = unknown
    >(
      variables: GetMaterialQueryVariables,
      options?: Omit<UseQueryOptions<GetMaterialQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMaterialQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMaterialQuery, TError, TData>(
      {
    queryKey: ['getMaterial', variables],
    queryFn: fetchData<GetMaterialQuery, GetMaterialQueryVariables>(GetMaterialDocument, variables),
    ...options
  }
    )};

useGetMaterialQuery.getKey = (variables: GetMaterialQueryVariables) => ['getMaterial', variables];

export const useSuspenseGetMaterialQuery = <
      TData = GetMaterialQuery,
      TError = unknown
    >(
      variables: GetMaterialQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetMaterialQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetMaterialQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetMaterialQuery, TError, TData>(
      {
    queryKey: ['getMaterialSuspense', variables],
    queryFn: fetchData<GetMaterialQuery, GetMaterialQueryVariables>(GetMaterialDocument, variables),
    ...options
  }
    )};

useSuspenseGetMaterialQuery.getKey = (variables: GetMaterialQueryVariables) => ['getMaterialSuspense', variables];


useGetMaterialQuery.fetcher = (variables: GetMaterialQueryVariables, options?: RequestInit['headers']) => fetchData<GetMaterialQuery, GetMaterialQueryVariables>(GetMaterialDocument, variables, options);

export const operationNames = {
  Query: {
    searchWithPagination: 'searchWithPagination' as const,
    searchFacets: 'searchFacets' as const,
    complexSearchForWorkTeaser: 'complexSearchForWorkTeaser' as const,
    getMaterial: 'getMaterial' as const
  },
  Fragment: {
    SearchFacet: 'SearchFacet' as const,
    ManifestationCover: 'ManifestationCover' as const,
    ManifestationIdentifiers: 'ManifestationIdentifiers' as const,
    ManifestationAccess: 'ManifestationAccess' as const,
    ManifestationTitles: 'ManifestationTitles' as const,
    ManifestationLanguages: 'ManifestationLanguages' as const,
    ManifestationDescription: 'ManifestationDescription' as const,
    ManifestationDetails: 'ManifestationDetails' as const,
    ManifestationMaterialTypes: 'ManifestationMaterialTypes' as const,
    ManifestationSearchPageTeaser: 'ManifestationSearchPageTeaser' as const,
    ManifestationWorkPage: 'ManifestationWorkPage' as const,
    WorkAccess: 'WorkAccess' as const,
    WorkMaterialTypes: 'WorkMaterialTypes' as const,
    WorkTitles: 'WorkTitles' as const,
    WorkCreators: 'WorkCreators' as const,
    WorkPublicationYear: 'WorkPublicationYear' as const,
    WorkDescription: 'WorkDescription' as const,
    WorkTeaserSearchPage: 'WorkTeaserSearchPage' as const,
    WorkFullWorkPage: 'WorkFullWorkPage' as const
  }
}