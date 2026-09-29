/* eslint-disable */
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core"

export type Maybe<T> = T | null
export type InputMaybe<T> = T | null | undefined
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never
}
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  /**
   * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the
   * `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO
   * 8601 standard for representation of dates and times using the Gregorian
   */
  DateTime: { input: unknown; output: unknown }
  /** An integer in the range from 1 to 100 */
  PaginationLimitScalar: { input: unknown; output: unknown }
}

export enum AccessTypeCodeEnum {
  Online = "ONLINE",
  Physical = "PHYSICAL",
  Unknown = "UNKNOWN",
}

export enum AccessUrlTypeEnum {
  Image = "IMAGE",
  Other = "OTHER",
  Resource = "RESOURCE",
  Sample = "SAMPLE",
  TableOfContents = "TABLE_OF_CONTENTS",
  Thumbnail = "THUMBNAIL",
}

/** Represents the publication status of a catalogued manifestation. */
export enum CataloguedPublicationStatusEnum {
  /** New title */
  Nt = "NT",
  /** New edition */
  Nu = "NU",
  /** New print run */
  Op = "OP",
}

export enum ChildOrAdultCodeEnum {
  ForAdults = "FOR_ADULTS",
  ForChildren = "FOR_CHILDREN",
}

/** The supported facet fields */
export enum ComplexSearchFacetsEnum {
  Accesstype = "ACCESSTYPE",
  Ages = "AGES",
  Cataloguecode = "CATALOGUECODE",
  Chambermusictype = "CHAMBERMUSICTYPE",
  Choirtype = "CHOIRTYPE",
  Contributor = "CONTRIBUTOR",
  Contributorfunction = "CONTRIBUTORFUNCTION",
  Creator = "CREATOR",
  Creatorcontributor = "CREATORCONTRIBUTOR",
  Creatorcontributorfunction = "CREATORCONTRIBUTORFUNCTION",
  Creatorfunction = "CREATORFUNCTION",
  Fictionalcharacter = "FICTIONALCHARACTER",
  Filmnationality = "FILMNATIONALITY",
  Gameplatform = "GAMEPLATFORM",
  Generalaudience = "GENERALAUDIENCE",
  Generalmaterialtype = "GENERALMATERIALTYPE",
  Genreandform = "GENREANDFORM",
  Hostpublication = "HOSTPUBLICATION",
  Instrument = "INSTRUMENT",
  Issue = "ISSUE",
  Language = "LANGUAGE",
  Let = "LET",
  Libraryrecommendation = "LIBRARYRECOMMENDATION",
  Lix = "LIX",
  Mainlanguage = "MAINLANGUAGE",
  Mediacouncilagerestriction = "MEDIACOUNCILAGERESTRICTION",
  Mood = "MOOD",
  Musicalensembleorcast = "MUSICALENSEMBLEORCAST",
  Narrativetechnique = "NARRATIVETECHNIQUE",
  Pegi = "PEGI",
  Players = "PLAYERS",
  Primarytarget = "PRIMARYTARGET",
  Publicationyear = "PUBLICATIONYEAR",
  Series = "SERIES",
  Setting = "SETTING",
  Source = "SOURCE",
  Specificmaterialtype = "SPECIFICMATERIALTYPE",
  Spokenlanguage = "SPOKENLANGUAGE",
  Subject = "SUBJECT",
  Subtitlelanguage = "SUBTITLELANGUAGE",
  Typeofscore = "TYPEOFSCORE",
}

/** The facets to ask for */
export type ComplexSearchFacetsInput = {
  facetLimit: Scalars["Int"]["input"]
  facets?: InputMaybe<Array<ComplexSearchFacetsEnum>>
}

/** Search Filters */
export type ComplexSearchFiltersInput = {
  /** Id of agency. */
  agencyId?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Name of the branch. */
  branch?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** BranchId. */
  branchId?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Overall location in library (eg. Voksne). */
  department?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Date of first accession */
  firstAccessionDate?: InputMaybe<Scalars["String"]["input"]>
  /** Id of publishing issue. */
  issueId?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Local id of the item. */
  itemId?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Where is the book physically located  (eg. skønlitteratur). */
  location?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Onloan or OnShelf. */
  status?: InputMaybe<Array<HoldingsStatusEnum>>
  /** More specific location (eg. Fantasy). */
  sublocation?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export enum ComplexSuggestionTypeEnum {
  Contributorfunction = "CONTRIBUTORFUNCTION",
  Creator = "CREATOR",
  Creatorcontributor = "CREATORCONTRIBUTOR",
  Creatorcontributorfunction = "CREATORCONTRIBUTORFUNCTION",
  Creatorfunction = "CREATORFUNCTION",
  Default = "DEFAULT",
  Fictionalcharacter = "FICTIONALCHARACTER",
  Hostpublication = "HOSTPUBLICATION",
  Publisher = "PUBLISHER",
  Series = "SERIES",
  Subject = "SUBJECT",
  Title = "TITLE",
}

export enum ContentsEntityEnum {
  Articles = "ARTICLES",
  Chapters = "CHAPTERS",
  Fiction = "FICTION",
  MusicTracks = "MUSIC_TRACKS",
  NotSpecified = "NOT_SPECIFIED",
  SheetMusic = "SHEET_MUSIC",
}

export type CopyRequestInput = {
  authorOfComponent?: InputMaybe<Scalars["String"]["input"]>
  issueOfComponent?: InputMaybe<Scalars["String"]["input"]>
  openURL?: InputMaybe<Scalars["String"]["input"]>
  pagesOfComponent?: InputMaybe<Scalars["String"]["input"]>
  pickUpAgencySubdivision?: InputMaybe<Scalars["String"]["input"]>
  /** The pid of an article or periodica */
  pid: Scalars["String"]["input"]
  publicationDateOfComponent?: InputMaybe<Scalars["String"]["input"]>
  publicationTitle?: InputMaybe<Scalars["String"]["input"]>
  publicationYearOfComponent?: InputMaybe<Scalars["String"]["input"]>
  titleOfComponent?: InputMaybe<Scalars["String"]["input"]>
  userInterestDate?: InputMaybe<Scalars["String"]["input"]>
  userMail?: InputMaybe<Scalars["String"]["input"]>
  userName?: InputMaybe<Scalars["String"]["input"]>
  volumeOfComponent?: InputMaybe<Scalars["String"]["input"]>
}

export enum CopyRequestStatusEnum {
  BorchkUserBlockedByAgency = "BORCHK_USER_BLOCKED_BY_AGENCY",
  BorchkUserNotVerified = "BORCHK_USER_NOT_VERIFIED",
  BorchkUserNoLongerExistOnAgency = "BORCHK_USER_NO_LONGER_EXIST_ON_AGENCY",
  ErrorAgencyNotSubscribed = "ERROR_AGENCY_NOT_SUBSCRIBED",
  ErrorInvalidPickupBranch = "ERROR_INVALID_PICKUP_BRANCH",
  ErrorMissingClientConfiguration = "ERROR_MISSING_CLIENT_CONFIGURATION",
  ErrorMissingMunicipalityagencyid = "ERROR_MISSING_MUNICIPALITYAGENCYID",
  ErrorMunicipalityagencyidNotFound = "ERROR_MUNICIPALITYAGENCYID_NOT_FOUND",
  ErrorPidNotReservable = "ERROR_PID_NOT_RESERVABLE",
  ErrorUnauthenticatedUser = "ERROR_UNAUTHENTICATED_USER",
  InternalError = "INTERNAL_ERROR",
  Ok = "OK",
  UnknownUser = "UNKNOWN_USER",
}

export enum EntryTypeEnum {
  AdditionalEntry = "ADDITIONAL_ENTRY",
  MainEntry = "MAIN_ENTRY",
  NationalBibliographyAdditionalEntry = "NATIONAL_BIBLIOGRAPHY_ADDITIONAL_ENTRY",
  NationalBibliographyEntry = "NATIONAL_BIBLIOGRAPHY_ENTRY",
}

/** The supported facet fields */
export enum FacetFieldEnum {
  Accesstypes = "ACCESSTYPES",
  Age = "AGE",
  Canalwaysbeloaned = "CANALWAYSBELOANED",
  Childrenoradults = "CHILDRENORADULTS",
  Creators = "CREATORS",
  Dk5 = "DK5",
  Fictionalcharacters = "FICTIONALCHARACTERS",
  Fictionnonfiction = "FICTIONNONFICTION",
  Gameplatform = "GAMEPLATFORM",
  Generalaudience = "GENERALAUDIENCE",
  Genreandform = "GENREANDFORM",
  Let = "LET",
  Libraryrecommendation = "LIBRARYRECOMMENDATION",
  Lix = "LIX",
  Mainlanguages = "MAINLANGUAGES",
  Materialtypesgeneral = "MATERIALTYPESGENERAL",
  Materialtypesspecific = "MATERIALTYPESSPECIFIC",
  Subjects = "SUBJECTS",
  Worktypes = "WORKTYPES",
  Year = "YEAR",
}

export enum FictionNonfictionCodeEnum {
  Fiction = "FICTION",
  Nonfiction = "NONFICTION",
  NotSpecified = "NOT_SPECIFIED",
}

export enum GeneralMaterialTypeCodeEnum {
  Articles = "ARTICLES",
  AudioBooks = "AUDIO_BOOKS",
  BoardGames = "BOARD_GAMES",
  Books = "BOOKS",
  Comics = "COMICS",
  ComputerGames = "COMPUTER_GAMES",
  Ebooks = "EBOOKS",
  Films = "FILMS",
  ImageMaterials = "IMAGE_MATERIALS",
  Music = "MUSIC",
  NewspaperJournals = "NEWSPAPER_JOURNALS",
  Other = "OTHER",
  Podcasts = "PODCASTS",
  SheetMusic = "SHEET_MUSIC",
  TvSeries = "TV_SERIES",
}

export enum HoldingsStatusEnum {
  /** Holding is on loan */
  Onloan = "ONLOAN",
  /** Holding is physically available at the branch */
  Onshelf = "ONSHELF",
}

export enum IdentifierTypeEnum {
  Barcode = "BARCODE",
  Doi = "DOI",
  Isbn = "ISBN",
  Ismn = "ISMN",
  Issn = "ISSN",
  Movie = "MOVIE",
  Music = "MUSIC",
  NotSpecified = "NOT_SPECIFIED",
  OrderNumber = "ORDER_NUMBER",
  Publizon = "PUBLIZON",
  Upc = "UPC",
  Uri = "URI",
}

export enum InfomediaErrorEnum {
  BorrowercheckNotAllowed = "BORROWERCHECK_NOT_ALLOWED",
  BorrowerNotFound = "BORROWER_NOT_FOUND",
  BorrowerNotInMunicipality = "BORROWER_NOT_IN_MUNICIPALITY",
  BorrowerNotLoggedIn = "BORROWER_NOT_LOGGED_IN",
  ErrorInRequest = "ERROR_IN_REQUEST",
  InternalServerError = "INTERNAL_SERVER_ERROR",
  LibraryNotFound = "LIBRARY_NOT_FOUND",
  NoAgencyid = "NO_AGENCYID",
  ServiceNotLicensed = "SERVICE_NOT_LICENSED",
  ServiceUnavailable = "SERVICE_UNAVAILABLE",
}

export type KidRecommenderTagsInput = {
  tag?: InputMaybe<Scalars["String"]["input"]>
  weight?: InputMaybe<Scalars["Int"]["input"]>
}

export enum LanguageCodeEnum {
  Da = "DA",
  En = "EN",
}

export enum LinkCheckStatusEnum {
  Broken = "BROKEN",
  Gone = "GONE",
  Invalid = "INVALID",
  Ok = "OK",
}

export enum LinkStatusEnum {
  Broken = "BROKEN",
  Gone = "GONE",
  Invalid = "INVALID",
  Ok = "OK",
}

export enum ManifestationPartTypeEnum {
  MusicTracks = "MUSIC_TRACKS",
  NotSpecified = "NOT_SPECIFIED",
  PartsOfBook = "PARTS_OF_BOOK",
  SheetMusicContent = "SHEET_MUSIC_CONTENT",
}

export type MoodKidsRecommendFiltersInput = {
  difficulty?: InputMaybe<Array<Scalars["Int"]["input"]>>
  fictionNonfiction?: InputMaybe<FictionNonfictionCodeEnum>
  illustrationsLevel?: InputMaybe<Array<Scalars["Int"]["input"]>>
  length?: InputMaybe<Array<Scalars["Int"]["input"]>>
  realisticVsFictional?: InputMaybe<Array<Scalars["Int"]["input"]>>
}

/** Supported fields for moodsearch request */
export enum MoodSearchFieldValuesEnum {
  All = "ALL",
  Alltags = "ALLTAGS",
  Creator = "CREATOR",
  Moodtags = "MOODTAGS",
  Title = "TITLE",
}

/** Type of moodSuggest response */
export enum MoodSuggestEnum {
  Creator = "CREATOR",
  Tag = "TAG",
  Title = "TITLE",
}

export enum NoteTypeEnum {
  ConnectionToOtherWorks = "CONNECTION_TO_OTHER_WORKS",
  ContainsAiGeneratedContent = "CONTAINS_AI_GENERATED_CONTENT",
  DescriptionOfMaterial = "DESCRIPTION_OF_MATERIAL",
  Dissertation = "DISSERTATION",
  Edition = "EDITION",
  EstimatedPlayingTimeForGames = "ESTIMATED_PLAYING_TIME_FOR_GAMES",
  ExpectedPublicationDate = "EXPECTED_PUBLICATION_DATE",
  Frequency = "FREQUENCY",
  MusicalEnsembleOrCast = "MUSICAL_ENSEMBLE_OR_CAST",
  NotSpecified = "NOT_SPECIFIED",
  OccasionForPublication = "OCCASION_FOR_PUBLICATION",
  OriginalTitle = "ORIGINAL_TITLE",
  OriginalVersion = "ORIGINAL_VERSION",
  References = "REFERENCES",
  RestrictionsOnUse = "RESTRICTIONS_ON_USE",
  TechnicalRequirements = "TECHNICAL_REQUIREMENTS",
  TypeOfScore = "TYPE_OF_SCORE",
  WithdrawnPublication = "WITHDRAWN_PUBLICATION",
}

/** Error codes returned when an article cannot be fetched or the user is not allowed to access it. */
export enum RetrieverErrorEnum {
  ArticleNotFound = "ARTICLE_NOT_FOUND",
  BorrowercheckNotAllowed = "BORROWERCHECK_NOT_ALLOWED",
  BorrowerNotFound = "BORROWER_NOT_FOUND",
  BorrowerNotInMunicipality = "BORROWER_NOT_IN_MUNICIPALITY",
  BorrowerNotLoggedIn = "BORROWER_NOT_LOGGED_IN",
  InternalServerError = "INTERNAL_SERVER_ERROR",
  LibraryNotFound = "LIBRARY_NOT_FOUND",
  NoAgencyid = "NO_AGENCYID",
  ServiceNotLicensed = "SERVICE_NOT_LICENSED",
  ServiceUnavailable = "SERVICE_UNAVAILABLE",
}

export enum ReviewElementTypeEnum {
  Abstract = "ABSTRACT",
  AcquisitionRecommendations = "ACQUISITION_RECOMMENDATIONS",
  Audience = "AUDIENCE",
  Conclusion = "CONCLUSION",
  Description = "DESCRIPTION",
  Evaluation = "EVALUATION",
  SimilarMaterials = "SIMILAR_MATERIALS",
}

export enum SchoolUseCodeEnum {
  ForSchoolUse = "FOR_SCHOOL_USE",
  ForTeacher = "FOR_TEACHER",
}

/** Search Filters */
export type SearchFiltersInput = {
  accessTypes?: InputMaybe<Array<Scalars["String"]["input"]>>
  age?: InputMaybe<Array<Scalars["String"]["input"]>>
  ageRange?: InputMaybe<Array<Scalars["String"]["input"]>>
  branchId?: InputMaybe<Array<Scalars["String"]["input"]>>
  canAlwaysBeLoaned?: InputMaybe<Array<Scalars["String"]["input"]>>
  childrenOrAdults?: InputMaybe<Array<Scalars["String"]["input"]>>
  creators?: InputMaybe<Array<Scalars["String"]["input"]>>
  department?: InputMaybe<Array<Scalars["String"]["input"]>>
  dk5?: InputMaybe<Array<Scalars["String"]["input"]>>
  fictionNonfiction?: InputMaybe<Array<Scalars["String"]["input"]>>
  fictionalCharacters?: InputMaybe<Array<Scalars["String"]["input"]>>
  gamePlatform?: InputMaybe<Array<Scalars["String"]["input"]>>
  generalAudience?: InputMaybe<Array<Scalars["String"]["input"]>>
  genreAndForm?: InputMaybe<Array<Scalars["String"]["input"]>>
  letRange?: InputMaybe<Array<Scalars["String"]["input"]>>
  libraryRecommendation?: InputMaybe<Array<Scalars["String"]["input"]>>
  lixRange?: InputMaybe<Array<Scalars["String"]["input"]>>
  location?: InputMaybe<Array<Scalars["String"]["input"]>>
  mainLanguages?: InputMaybe<Array<Scalars["String"]["input"]>>
  materialTypesGeneral?: InputMaybe<Array<Scalars["String"]["input"]>>
  materialTypesSpecific?: InputMaybe<Array<Scalars["String"]["input"]>>
  status?: InputMaybe<Array<HoldingsStatusEnum>>
  subjects?: InputMaybe<Array<Scalars["String"]["input"]>>
  sublocation?: InputMaybe<Array<Scalars["String"]["input"]>>
  workTypes?: InputMaybe<Array<Scalars["String"]["input"]>>
  year?: InputMaybe<Array<Scalars["String"]["input"]>>
}

/** The supported fields to query */
export type SearchQueryInput = {
  /**
   * Search for title, creator, subject or a combination.
   * This is typically used where a single search box is desired.
   */
  all?: InputMaybe<Scalars["String"]["input"]>
  /** Search for creator */
  creator?: InputMaybe<Scalars["String"]["input"]>
  /** Search for specific subject */
  subject?: InputMaybe<Scalars["String"]["input"]>
  /** Search for specific title */
  title?: InputMaybe<Scalars["String"]["input"]>
}

export type SortInput = {
  index: Scalars["String"]["input"]
  order: SortOrderEnum
}

export enum SortOrderEnum {
  Asc = "ASC",
  Desc = "DESC",
}

export enum SubjectTypeEnum {
  Corporation = "CORPORATION",
  Environment = "ENVIRONMENT",
  FictionalCharacter = "FICTIONAL_CHARACTER",
  FictionalLocation = "FICTIONAL_LOCATION",
  FilmNationality = "FILM_NATIONALITY",
  Laesekompasset = "LAESEKOMPASSET",
  LibraryOfCongressSubjectHeading = "LIBRARY_OF_CONGRESS_SUBJECT_HEADING",
  Location = "LOCATION",
  MedicalSubjectHeading = "MEDICAL_SUBJECT_HEADING",
  Mood = "MOOD",
  MoodChildren = "MOOD_CHILDREN",
  MusicalInstrumentation = "MUSICAL_INSTRUMENTATION",
  MusicCountryOfOrigin = "MUSIC_COUNTRY_OF_ORIGIN",
  MusicTimePeriod = "MUSIC_TIME_PERIOD",
  NationalAgriculturalLibrary = "NATIONAL_AGRICULTURAL_LIBRARY",
  /** added for manifestation.parts.creators/person - they get a type from small-rye */
  Person = "PERSON",
  Perspective = "PERSPECTIVE",
  Reality = "REALITY",
  Style = "STYLE",
  Tempo = "TEMPO",
  TimePeriod = "TIME_PERIOD",
  Title = "TITLE",
  Topic = "TOPIC",
  /** Subject describing selected topics for children, and a rating. */
  TopicChildren = "TOPIC_CHILDREN",
}

export enum SuggestionTypeEnum {
  Composit = "COMPOSIT",
  Creator = "CREATOR",
  Subject = "SUBJECT",
  Title = "TITLE",
}

export enum WorkTypeEnum {
  Analysis = "ANALYSIS",
  Article = "ARTICLE",
  Bookdescription = "BOOKDESCRIPTION",
  Game = "GAME",
  Literature = "LITERATURE",
  Map = "MAP",
  Movie = "MOVIE",
  Music = "MUSIC",
  Other = "OTHER",
  Periodica = "PERIODICA",
  Portrait = "PORTRAIT",
  Review = "REVIEW",
  Sheetmusic = "SHEETMUSIC",
  Track = "TRACK",
}

export type CatalogueDetailsByIsbnQueryVariables = Exact<{
  cql: Scalars["String"]["input"]
  limit: Scalars["PaginationLimitScalar"]["input"]
}>

export type CatalogueDetailsByIsbnQuery = {
  __typename?: "Query"
  complexSearch: {
    __typename?: "ComplexSearchResponse"
    errorMessage?: string | null
    works: Array<{
      __typename?: "Work"
      titles: { __typename?: "WorkTitles"; full: Array<string> }
      creators: Array<
        { __typename?: "Corporation"; display: string } | { __typename?: "Person"; display: string }
      >
      manifestations: {
        __typename?: "Manifestations"
        all: Array<{
          __typename?: "Manifestation"
          identifiers: Array<{ __typename?: "Identifier"; type: IdentifierTypeEnum; value: string }>
        }>
      }
    }>
  }
}

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>["__apiType"]>
  private value: string
  public __meta__?: Record<string, any> | undefined

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value)
    this.value = value
    this.__meta__ = __meta__
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value
  }
}

export const CatalogueDetailsByIsbnDocument = new TypedDocumentString(`
    query catalogueDetailsByIsbn($cql: String!, $limit: PaginationLimitScalar!) {
  complexSearch(cql: $cql) {
    errorMessage
    works(offset: 0, limit: $limit) {
      titles {
        full
      }
      creators {
        display
      }
      manifestations {
        all {
          identifiers {
            type
            value
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  CatalogueDetailsByIsbnQuery,
  CatalogueDetailsByIsbnQueryVariables
>
