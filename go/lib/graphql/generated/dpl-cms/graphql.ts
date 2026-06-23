import { useQuery, useSuspenseQuery, UseQueryOptions, UseSuspenseQueryOptions } from '@tanstack/react-query';
import { fetcher } from '@/lib/graphql/fetchers/dpl-cms.fetcher';
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
  Email: { input: unknown; output: unknown; }
  Html: { input: unknown; output: unknown; }
  PhoneNumber: { input: unknown; output: unknown; }
  Time: { input: unknown; output: unknown; }
  TimeZone: { input: unknown; output: unknown; }
  Timestamp: { input: unknown; output: unknown; }
  UntypedStructuredData: { input: unknown; output: unknown; }
  UtcOffset: { input: unknown; output: unknown; }
};

export type Address = {
  __typename?: 'Address';
  additionalName?: Maybe<Scalars['String']['output']>;
  addressLine1?: Maybe<Scalars['String']['output']>;
  addressLine2?: Maybe<Scalars['String']['output']>;
  administrativeArea?: Maybe<Scalars['String']['output']>;
  country?: Maybe<AddressCountry>;
  dependentLocality?: Maybe<Scalars['String']['output']>;
  familyName?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  langcode?: Maybe<Scalars['String']['output']>;
  locality?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  sortingCode?: Maybe<Scalars['String']['output']>;
};

export type AddressCountry = {
  __typename?: 'AddressCountry';
  code?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type AdgangsplatformenLibraryToken = {
  __typename?: 'AdgangsplatformenLibraryToken';
  expire?: Maybe<DateTime>;
  token?: Maybe<Scalars['String']['output']>;
};

export type AdgangsplatformenTokens = {
  __typename?: 'AdgangsplatformenTokens';
  library?: Maybe<AdgangsplatformenLibraryToken>;
  user?: Maybe<AdgangsplatformenUserToken>;
};

export type AdgangsplatformenUserToken = {
  __typename?: 'AdgangsplatformenUserToken';
  expire?: Maybe<DateTime>;
  token?: Maybe<Scalars['String']['output']>;
};

export type AppCategory = {
  __typename?: 'AppCategory';
  elements: Array<AppContentElement>;
  icon: Scalars['String']['output'];
  title: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type AppContentElement = {
  __typename?: 'AppContentElement';
  uuid: Scalars['String']['output'];
};

export type AppType =
  | 'BIBLO'
  | 'BIBLOGO'
  | 'MYBIBLO';

export type BetweenFloatInput = {
  max?: InputMaybe<Scalars['Float']['input']>;
  min?: InputMaybe<Scalars['Float']['input']>;
};

export type BetweenStringInput = {
  max?: InputMaybe<Scalars['String']['input']>;
  min?: InputMaybe<Scalars['String']['input']>;
};

export type Branch = {
  __typename?: 'Branch';
  address?: Maybe<BranchAddress>;
  availabilityContext: BranchAvailabilityContext;
  email?: Maybe<Scalars['String']['output']>;
  isilId: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type BranchAddress = {
  __typename?: 'BranchAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

export type BranchAvailabilityContext = {
  __typename?: 'BranchAvailabilityContext';
  availability: Scalars['Boolean']['output'];
  reservations: Scalars['Boolean']['output'];
  search: Scalars['Boolean']['output'];
};

export type CqlSearch = {
  __typename?: 'CQLSearch';
  value?: Maybe<Scalars['String']['output']>;
};

export type Color = {
  __typename?: 'Color';
  color?: Maybe<Scalars['String']['output']>;
  opacity?: Maybe<Scalars['Float']['output']>;
};

export type DateRange = {
  __typename?: 'DateRange';
  end?: Maybe<DateTime>;
  start?: Maybe<DateTime>;
};

export type DateTime = {
  __typename?: 'DateTime';
  offset: Scalars['UtcOffset']['output'];
  time: Scalars['Time']['output'];
  timestamp: Scalars['Timestamp']['output'];
  timezone: Scalars['TimeZone']['output'];
};

export type DplTokens = {
  __typename?: 'DplTokens';
  adgangsplatformen?: Maybe<AdgangsplatformenTokens>;
};

export type Error = {
  __typename?: 'Error';
  message: Scalars['String']['output'];
};

export type File = {
  __typename?: 'File';
  description?: Maybe<Scalars['String']['output']>;
  mime?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type GoCategoriesResult = View & {
  __typename?: 'GoCategoriesResult';
  description?: Maybe<Scalars['String']['output']>;
  display: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  langcode?: Maybe<Scalars['String']['output']>;
  pageInfo: ViewPageInfo;
  results: Array<NodeUnion>;
  view: Scalars['String']['output'];
};

export type GoConfiguration = {
  __typename?: 'GoConfiguration';
  private?: Maybe<GoConfigurationPrivate>;
  public?: Maybe<GoConfigurationPublic>;
};

export type GoConfigurationPrivate = {
  __typename?: 'GoConfigurationPrivate';
  unilogin?: Maybe<UniloginConfigurationPrivate>;
};

export type GoConfigurationPublic = {
  __typename?: 'GoConfigurationPublic';
  libraryInfo?: Maybe<GoLibraryInfo>;
  loginUrls?: Maybe<GoLoginUrls>;
  logoutUrls?: Maybe<GoLogoutUrls>;
  mapp?: Maybe<MappTracking>;
  searchProfiles?: Maybe<SearchProfiles>;
  unilogin?: Maybe<UniloginConfigurationPublic>;
};

export type GoLibraryInfo = {
  __typename?: 'GoLibraryInfo';
  cmsUrl: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type GoLoginUrls = {
  __typename?: 'GoLoginUrls';
  adgangsplatformen?: Maybe<Scalars['String']['output']>;
};

export type GoLogoutUrls = {
  __typename?: 'GoLogoutUrls';
  adgangsplatformen?: Maybe<Scalars['String']['output']>;
};

export type Image = {
  __typename?: 'Image';
  alt?: Maybe<Scalars['String']['output']>;
  height: Scalars['Int']['output'];
  mime?: Maybe<Scalars['String']['output']>;
  size: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  width: Scalars['Int']['output'];
};

export type ImportResponse = {
  __typename?: 'ImportResponse';
  message: Scalars['String']['output'];
  status: ImportStatus;
};

export type ImportStatus =
  | 'failure'
  | 'success';

export type InterestPeriod = {
  __typename?: 'InterestPeriod';
  label: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type InterestPeriods = {
  __typename?: 'InterestPeriods';
  all: Array<InterestPeriod>;
  default: InterestPeriod;
};

export type KeyValueInput = {
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Language = {
  __typename?: 'Language';
  direction?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Link = {
  __typename?: 'Link';
  id?: Maybe<Scalars['String']['output']>;
  internal: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type MappTracking = {
  __typename?: 'MappTracking';
  domain?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
};

export type MediaAudio = MediaInterface & {
  __typename?: 'MediaAudio';
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  mediaAudioFile: File;
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
};

export type MediaDocument = MediaInterface & {
  __typename?: 'MediaDocument';
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  mediaFile: File;
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
};

export type MediaImage = MediaInterface & {
  __typename?: 'MediaImage';
  byline?: Maybe<Scalars['String']['output']>;
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  mediaImage: Image;
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
};

export type MediaInterface = {
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
};

export type MediaUnion = MediaAudio | MediaDocument | MediaImage | MediaVideo | MediaVideotool | MediaVideotoolVertical;

export type MediaVideo = MediaInterface & {
  __typename?: 'MediaVideo';
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  mediaOembedVideo: Scalars['String']['output'];
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  thumbnail: Scalars['String']['output'];
};

export type MediaVideotool = MediaInterface & {
  __typename?: 'MediaVideotool';
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  mediaVideotool: Scalars['String']['output'];
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  streamingUrl?: Maybe<Scalars['String']['output']>;
  thumbnail: Scalars['String']['output'];
};

export type MediaVideotoolVertical = MediaInterface & {
  __typename?: 'MediaVideotoolVertical';
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  mediaVideotoolVertical: Scalars['String']['output'];
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  streamingUrl?: Maybe<Scalars['String']['output']>;
  thumbnail: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _: Scalars['Boolean']['output'];
  import: ImportResponse;
};


export type MutationImportArgs = {
  callbackUrl: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
};

export type NewContentResponse = {
  __typename?: 'NewContentResponse';
  errors: Array<Error>;
  uuids: Array<Scalars['String']['output']>;
  youngest: Scalars['Time']['output'];
};

export type NodeArticle = NodeInterface & {
  __typename?: 'NodeArticle';
  branch?: Maybe<NodeUnion>;
  canonicalUrl?: Maybe<Link>;
  categories?: Maybe<TermUnion>;
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  overrideAuthor?: Maybe<Scalars['String']['output']>;
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  path?: Maybe<Scalars['String']['output']>;
  promote: Scalars['Boolean']['output'];
  publicationDate: DateTime;
  showOverrideAuthor?: Maybe<Scalars['Boolean']['output']>;
  status: Scalars['Boolean']['output'];
  sticky: Scalars['Boolean']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<TermUnion>>;
  teaserImage?: Maybe<MediaUnion>;
  teaserText?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NodeGoArticle = NodeInterface & {
  __typename?: 'NodeGoArticle';
  changed: DateTime;
  created: DateTime;
  goArticleImage?: Maybe<MediaUnion>;
  id: Scalars['ID']['output'];
  langcode: Language;
  overrideAuthor?: Maybe<Scalars['String']['output']>;
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  path?: Maybe<Scalars['String']['output']>;
  promote: Scalars['Boolean']['output'];
  publicationDate: DateTime;
  showOverrideAuthor?: Maybe<Scalars['Boolean']['output']>;
  status: Scalars['Boolean']['output'];
  sticky: Scalars['Boolean']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  teaserImage: MediaUnion;
  teaserText?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NodeGoCategory = NodeInterface & {
  __typename?: 'NodeGoCategory';
  categoryMenuImage: MediaUnion;
  categoryMenuSound?: Maybe<MediaUnion>;
  categoryMenuTitle: Scalars['String']['output'];
  changed: DateTime;
  created: DateTime;
  goColor?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  langcode: Language;
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  path?: Maybe<Scalars['String']['output']>;
  promote: Scalars['Boolean']['output'];
  publicationDate: DateTime;
  status: Scalars['Boolean']['output'];
  sticky: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NodeGoPage = NodeInterface & {
  __typename?: 'NodeGoPage';
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  path?: Maybe<Scalars['String']['output']>;
  promote: Scalars['Boolean']['output'];
  publicationDate: DateTime;
  status: Scalars['Boolean']['output'];
  sticky: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NodeInterface = {
  changed: DateTime;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  path?: Maybe<Scalars['String']['output']>;
  promote: Scalars['Boolean']['output'];
  status: Scalars['Boolean']['output'];
  sticky: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NodePage = NodeInterface & {
  __typename?: 'NodePage';
  branch?: Maybe<NodeUnion>;
  breadcrumbParent?: Maybe<TermUnion>;
  canonicalUrl?: Maybe<Link>;
  changed: DateTime;
  created: DateTime;
  displayTitles?: Maybe<Scalars['Boolean']['output']>;
  heroTitle?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  langcode: Language;
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  path?: Maybe<Scalars['String']['output']>;
  promote: Scalars['Boolean']['output'];
  publicationDate: DateTime;
  status: Scalars['Boolean']['output'];
  sticky: Scalars['Boolean']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  teaserImage?: Maybe<MediaUnion>;
  teaserText?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NodeUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

export type ParagraphAccordion = ParagraphInterface & {
  __typename?: 'ParagraphAccordion';
  accordionDescription?: Maybe<Text>;
  accordionTitle: Text;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphBanner = ParagraphInterface & {
  __typename?: 'ParagraphBanner';
  bannerDescription?: Maybe<Scalars['String']['output']>;
  bannerImage?: Maybe<MediaUnion>;
  bannerLink: Link;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  underlinedTitle?: Maybe<Text>;
};

export type ParagraphBreadcrumbChildren = ParagraphInterface & {
  __typename?: 'ParagraphBreadcrumbChildren';
  breadcrumbTarget?: Maybe<TermUnion>;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  showSubtitles?: Maybe<Scalars['Boolean']['output']>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphCampaignRule = ParagraphInterface & {
  __typename?: 'ParagraphCampaignRule';
  campaignRuleFacet: Scalars['String']['output'];
  campaignRuleTerm: Scalars['String']['output'];
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphCardGridAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphCardGridAutomatic';
  created: DateTime;
  filterBranches?: Maybe<Array<NodeUnion>>;
  filterCategories?: Maybe<Array<TermUnion>>;
  filterCondType: Scalars['String']['output'];
  filterContentTypes?: Maybe<Array<Scalars['String']['output']>>;
  filterTags?: Maybe<Array<TermUnion>>;
  id: Scalars['ID']['output'];
  langcode: Language;
  moreLink?: Maybe<Link>;
  status: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type ParagraphCardGridManual = ParagraphInterface & {
  __typename?: 'ParagraphCardGridManual';
  created: DateTime;
  gridContent?: Maybe<Array<ParagraphCardGridManualGridContentUnion>>;
  gridContentUuids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id: Scalars['ID']['output'];
  langcode: Language;
  moreLink?: Maybe<Link>;
  status: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type ParagraphCardGridManualGridContentUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

export type ParagraphContentSlider = ParagraphInterface & {
  __typename?: 'ParagraphContentSlider';
  contentReferences?: Maybe<Array<ParagraphContentSliderContentReferencesUnion>>;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
  underlinedTitle?: Maybe<Text>;
};

export type ParagraphContentSliderAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphContentSliderAutomatic';
  created: DateTime;
  filterBranches?: Maybe<Array<NodeUnion>>;
  filterCategories?: Maybe<Array<TermUnion>>;
  filterCondType: Scalars['String']['output'];
  filterContentTypes?: Maybe<Array<Scalars['String']['output']>>;
  filterTags?: Maybe<Array<TermUnion>>;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
  underlinedTitle?: Maybe<Text>;
};

export type ParagraphContentSliderContentReferencesUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

export type ParagraphEventTicketCategory = ParagraphInterface & {
  __typename?: 'ParagraphEventTicketCategory';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  ticketCategoryName: Scalars['String']['output'];
};

export type ParagraphFiles = ParagraphInterface & {
  __typename?: 'ParagraphFiles';
  created: DateTime;
  files?: Maybe<Array<MediaUnion>>;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphFilteredEventList = ParagraphInterface & {
  __typename?: 'ParagraphFilteredEventList';
  amountOfEvents?: Maybe<Scalars['Int']['output']>;
  created: DateTime;
  filterBranches?: Maybe<Array<NodeUnion>>;
  filterCategories?: Maybe<Array<TermUnion>>;
  filterCondType: Scalars['String']['output'];
  filterTags?: Maybe<Array<TermUnion>>;
  id: Scalars['ID']['output'];
  langcode: Language;
  maxItemAmount: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type ParagraphGoImages = ParagraphInterface & {
  __typename?: 'ParagraphGoImages';
  created: DateTime;
  goImages: Array<MediaUnion>;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphGoLink = ParagraphInterface & {
  __typename?: 'ParagraphGoLink';
  ariaLabel?: Maybe<Scalars['String']['output']>;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  link: Link;
  status: Scalars['Boolean']['output'];
  targetBlank?: Maybe<Scalars['Boolean']['output']>;
};

export type ParagraphGoLinkbox = ParagraphInterface & {
  __typename?: 'ParagraphGoLinkbox';
  created: DateTime;
  goColor?: Maybe<Scalars['String']['output']>;
  goDescription: Scalars['String']['output'];
  goImage?: Maybe<MediaUnion>;
  goLinkParagraph: ParagraphUnion;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type ParagraphGoMaterialSliderAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphGoMaterialSliderAutomatic';
  cqlSearch?: Maybe<CqlSearch>;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  sliderAmountOfMaterials: Scalars['Int']['output'];
  status: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type ParagraphGoMaterialSliderManual = ParagraphInterface & {
  __typename?: 'ParagraphGoMaterialSliderManual';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  materialSliderWorkIds: Array<WorkId>;
  status: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type ParagraphGoTextBody = ParagraphInterface & {
  __typename?: 'ParagraphGoTextBody';
  body: Text;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphGoVideo = ParagraphInterface & {
  __typename?: 'ParagraphGoVideo';
  created: DateTime;
  embedVideo: MediaUnion;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type ParagraphGoVideoBundleAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphGoVideoBundleAutomatic';
  cqlSearch?: Maybe<CqlSearch>;
  created: DateTime;
  embedVideo: MediaUnion;
  goVideoTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  videoAmountOfMaterials: Scalars['Int']['output'];
};

export type ParagraphGoVideoBundleManual = ParagraphInterface & {
  __typename?: 'ParagraphGoVideoBundleManual';
  created: DateTime;
  embedVideo: MediaUnion;
  goVideoTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  videoBundleWorkIds?: Maybe<Array<WorkId>>;
};

export type ParagraphGoVideoBundleVerticalAuto = ParagraphInterface & {
  __typename?: 'ParagraphGoVideoBundleVerticalAuto';
  cqlSearch?: Maybe<CqlSearch>;
  created: DateTime;
  embedVideo: MediaUnion;
  goVideoTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  videoAmountOfMaterials: Scalars['Int']['output'];
};

export type ParagraphGoVideoBundleVerticalManual = ParagraphInterface & {
  __typename?: 'ParagraphGoVideoBundleVerticalManual';
  created: DateTime;
  embedVideo: MediaUnion;
  goVideoTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  videoBundleWorkIds?: Maybe<Array<WorkId>>;
};

export type ParagraphHero = ParagraphInterface & {
  __typename?: 'ParagraphHero';
  created: DateTime;
  heroCategories?: Maybe<TermUnion>;
  heroContentType?: Maybe<Scalars['String']['output']>;
  heroDate?: Maybe<DateTime>;
  heroDescription?: Maybe<Text>;
  heroImage?: Maybe<MediaUnion>;
  heroLink?: Maybe<Link>;
  heroTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphInterface = {
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphLanguageSelector = ParagraphInterface & {
  __typename?: 'ParagraphLanguageSelector';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  languageIcon: Image;
  status: Scalars['Boolean']['output'];
};

export type ParagraphLinks = ParagraphInterface & {
  __typename?: 'ParagraphLinks';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  link: Array<Link>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphManualEventList = ParagraphInterface & {
  __typename?: 'ParagraphManualEventList';
  created: DateTime;
  events?: Maybe<Array<UnsupportedType>>;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type ParagraphMaterialGridAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphMaterialGridAutomatic';
  /** @deprecated Use materialAmount instead */
  amountOfMaterials: Scalars['Int']['output'];
  cqlSearch?: Maybe<CqlSearch>;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  materialAmount: Scalars['Int']['output'];
  materialGridDescription?: Maybe<Scalars['String']['output']>;
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphMaterialGridLinkAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphMaterialGridLinkAutomatic';
  /** @deprecated Use materialAmount instead */
  amountOfMaterials: Scalars['Int']['output'];
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  materialAmount: Scalars['Int']['output'];
  materialGridDescription?: Maybe<Scalars['String']['output']>;
  materialGridLink: Scalars['String']['output'];
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphMaterialGridManual = ParagraphInterface & {
  __typename?: 'ParagraphMaterialGridManual';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  materialGridDescription?: Maybe<Scalars['String']['output']>;
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  materialGridWorkIds?: Maybe<Array<WorkId>>;
  status: Scalars['Boolean']['output'];
  workId?: Maybe<Array<WorkId>>;
};

export type ParagraphMedias = ParagraphInterface & {
  __typename?: 'ParagraphMedias';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  medias: Array<MediaUnion>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphNavGridManual = ParagraphInterface & {
  __typename?: 'ParagraphNavGridManual';
  contentReferenceUuids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  contentReferences?: Maybe<Array<ParagraphNavGridManualContentReferencesUnion>>;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  showSubtitles?: Maybe<Scalars['Boolean']['output']>;
  status: Scalars['Boolean']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type ParagraphNavGridManualContentReferencesUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

export type ParagraphNavSpotsManual = ParagraphInterface & {
  __typename?: 'ParagraphNavSpotsManual';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  navSpotsContent?: Maybe<Array<ParagraphNavSpotsManualNavSpotsContentUnion>>;
  navSpotsContentUuids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphNavSpotsManualNavSpotsContentUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

export type ParagraphOpeningHours = ParagraphInterface & {
  __typename?: 'ParagraphOpeningHours';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphRecommendation = ParagraphInterface & {
  __typename?: 'ParagraphRecommendation';
  created: DateTime;
  id: Scalars['ID']['output'];
  imagePositionRight?: Maybe<Scalars['Boolean']['output']>;
  langcode: Language;
  recommendationDescription?: Maybe<Scalars['String']['output']>;
  recommendationTitle?: Maybe<Text>;
  recommendationWorkId?: Maybe<WorkId>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphSimpleLinks = ParagraphInterface & {
  __typename?: 'ParagraphSimpleLinks';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  link: Array<Link>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphTextBody = ParagraphInterface & {
  __typename?: 'ParagraphTextBody';
  body: Text;
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphUnion = ParagraphAccordion | ParagraphBanner | ParagraphBreadcrumbChildren | ParagraphCampaignRule | ParagraphCardGridAutomatic | ParagraphCardGridManual | ParagraphContentSlider | ParagraphContentSliderAutomatic | ParagraphEventTicketCategory | ParagraphFiles | ParagraphFilteredEventList | ParagraphGoImages | ParagraphGoLink | ParagraphGoLinkbox | ParagraphGoMaterialSliderAutomatic | ParagraphGoMaterialSliderManual | ParagraphGoTextBody | ParagraphGoVideo | ParagraphGoVideoBundleAutomatic | ParagraphGoVideoBundleManual | ParagraphGoVideoBundleVerticalAuto | ParagraphGoVideoBundleVerticalManual | ParagraphHero | ParagraphLanguageSelector | ParagraphLinks | ParagraphManualEventList | ParagraphMaterialGridAutomatic | ParagraphMaterialGridLinkAutomatic | ParagraphMaterialGridManual | ParagraphMedias | ParagraphNavGridManual | ParagraphNavSpotsManual | ParagraphOpeningHours | ParagraphRecommendation | ParagraphSimpleLinks | ParagraphTextBody | ParagraphUserRegistrationItem | ParagraphUserRegistrationLinklist | ParagraphUserRegistrationSection | ParagraphVideo | ParagraphWebform;

export type ParagraphUserRegistrationItem = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationItem';
  anchor?: Maybe<Scalars['String']['output']>;
  body: Text;
  created: DateTime;
  displayInNavigation?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  langcode: Language;
  linkTarget: Scalars['String']['output'];
  navigationTitle?: Maybe<Scalars['String']['output']>;
  registrationLink?: Maybe<Link>;
  status: Scalars['Boolean']['output'];
};

export type ParagraphUserRegistrationLinklist = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationLinklist';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphUserRegistrationSection = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationSection';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphVideo = ParagraphInterface & {
  __typename?: 'ParagraphVideo';
  created: DateTime;
  embedVideo: MediaUnion;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type ParagraphWebform = ParagraphInterface & {
  __typename?: 'ParagraphWebform';
  created: DateTime;
  id: Scalars['ID']['output'];
  langcode: Language;
  status: Scalars['Boolean']['output'];
};

export type Query = { go: { cacheTags: string[] } } & {
  __typename?: 'Query';
  dplTokens?: Maybe<DplTokens>;
  getAppCategories: Array<AppCategory>;
  getBranches: Array<Branch>;
  goCategories?: Maybe<GoCategoriesResult>;
  goConfiguration?: Maybe<GoConfiguration>;
  info: SchemaInformation;
  newContent: NewContentResponse;
  node?: Maybe<NodeUnion>;
  paragraph?: Maybe<ParagraphUnion>;
  preview?: Maybe<NodeUnion>;
  reservationSettings: ReservationSettings;
  route?: Maybe<RouteUnion>;
};


export type QueryGetAppCategoriesArgs = {
  type: AppType;
  uuid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetBranchesArgs = {
  availabilityContexts?: InputMaybe<Array<Scalars['String']['input']>>;
  cmsConfigured?: InputMaybe<Scalars['Boolean']['input']>;
  isilId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGoCategoriesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNewContentArgs = {
  since: Scalars['Time']['input'];
  uuid: Scalars['String']['input'];
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
  langcode?: InputMaybe<Scalars['String']['input']>;
  revision?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryParagraphArgs = {
  id: Scalars['ID']['input'];
  langcode?: InputMaybe<Scalars['String']['input']>;
  revision?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryPreviewArgs = {
  id: Scalars['ID']['input'];
  langcode?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRouteArgs = {
  langcode?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  revision?: InputMaybe<Scalars['ID']['input']>;
};

export type ReservationSettings = {
  __typename?: 'ReservationSettings';
  allowRemoveReadyReservations: Scalars['Boolean']['output'];
  interestPeriods: InterestPeriods;
  smsNotificationsEnabled: Scalars['Boolean']['output'];
  urls: ReservationUrls;
};

export type ReservationUrls = {
  __typename?: 'ReservationUrls';
  pauseReservationInfo: Scalars['String']['output'];
  zeroHitsSearch: Scalars['String']['output'];
};

export type Route = {
  internal: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type RouteEntityUnion = NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

export type RouteExternal = Route & {
  __typename?: 'RouteExternal';
  internal: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type RouteInternal = Route & {
  __typename?: 'RouteInternal';
  breadcrumbs?: Maybe<Array<Link>>;
  entity?: Maybe<RouteEntityUnion>;
  internal: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type RouteRedirect = Route & {
  __typename?: 'RouteRedirect';
  internal: Scalars['Boolean']['output'];
  redirect: Scalars['Boolean']['output'];
  status: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type RouteUnion = RouteExternal | RouteInternal | RouteRedirect;

export type SchemaInformation = {
  __typename?: 'SchemaInformation';
  description?: Maybe<Scalars['String']['output']>;
  home?: Maybe<Scalars['String']['output']>;
  languages: Array<Language>;
  name?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

export type SearchProfiles = {
  __typename?: 'SearchProfiles';
  default?: Maybe<Scalars['String']['output']>;
  global?: Maybe<Scalars['String']['output']>;
  local?: Maybe<Scalars['String']['output']>;
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type Subscription = {
  __typename?: 'Subscription';
  _: Scalars['Boolean']['output'];
};

export type TermBreadcrumbStructure = TermInterface & {
  __typename?: 'TermBreadcrumbStructure';
  changed: DateTime;
  childrenTitle?: Maybe<Scalars['String']['output']>;
  content: NodeUnion;
  description: Text;
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  parent?: Maybe<TermUnion>;
  path?: Maybe<Scalars['String']['output']>;
  showChildren?: Maybe<Scalars['Boolean']['output']>;
  showChildrenSubtitles?: Maybe<Scalars['Boolean']['output']>;
  status: Scalars['Boolean']['output'];
  weight: Scalars['Int']['output'];
};

export type TermCategories = TermInterface & {
  __typename?: 'TermCategories';
  changed: DateTime;
  description: Text;
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  parent?: Maybe<TermUnion>;
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  weight: Scalars['Int']['output'];
};

export type TermInterface = {
  changed: DateTime;
  description: Text;
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  parent?: Maybe<TermUnion>;
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  weight: Scalars['Int']['output'];
};

export type TermOpeningHoursCategories = TermInterface & {
  __typename?: 'TermOpeningHoursCategories';
  changed: DateTime;
  description: Text;
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  parent?: Maybe<TermUnion>;
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  weight: Scalars['Int']['output'];
};

export type TermScreenName = TermInterface & {
  __typename?: 'TermScreenName';
  changed: DateTime;
  description: Text;
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  parent?: Maybe<TermUnion>;
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  weight: Scalars['Int']['output'];
};

export type TermTags = TermInterface & {
  __typename?: 'TermTags';
  changed: DateTime;
  description: Text;
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  parent?: Maybe<TermUnion>;
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  weight: Scalars['Int']['output'];
};

export type TermUnion = TermBreadcrumbStructure | TermCategories | TermOpeningHoursCategories | TermScreenName | TermTags | TermWebformEmailCategories;

export type TermWebformEmailCategories = TermInterface & {
  __typename?: 'TermWebformEmailCategories';
  changed: DateTime;
  description: Text;
  email: Scalars['Email']['output'];
  id: Scalars['ID']['output'];
  langcode: Language;
  name: Scalars['String']['output'];
  parent?: Maybe<TermUnion>;
  path?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  weight: Scalars['Int']['output'];
};

export type Text = {
  __typename?: 'Text';
  format?: Maybe<Scalars['String']['output']>;
  processed?: Maybe<Scalars['Html']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type TextSummary = {
  __typename?: 'TextSummary';
  format?: Maybe<Scalars['String']['output']>;
  processed?: Maybe<Scalars['Html']['output']>;
  summary?: Maybe<Scalars['Html']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type Translation = {
  __typename?: 'Translation';
  langcode: Language;
  path?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type UniloginConfigurationPrivate = {
  __typename?: 'UniloginConfigurationPrivate';
  clientSecret?: Maybe<Scalars['String']['output']>;
  pubHubRetailerKeyCode?: Maybe<Scalars['String']['output']>;
};

export type UniloginConfigurationPublic = {
  __typename?: 'UniloginConfigurationPublic';
  municipalityId?: Maybe<Scalars['String']['output']>;
};

export type UnsupportedType = {
  __typename?: 'UnsupportedType';
  unsupported?: Maybe<Scalars['Boolean']['output']>;
};

export type View = {
  description?: Maybe<Scalars['String']['output']>;
  display: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  langcode?: Maybe<Scalars['String']['output']>;
  pageInfo: ViewPageInfo;
  view: Scalars['String']['output'];
};

export type ViewFilter = {
  __typename?: 'ViewFilter';
  attributes: Scalars['UntypedStructuredData']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  multiple: Scalars['Boolean']['output'];
  operator: Scalars['String']['output'];
  options?: Maybe<Scalars['UntypedStructuredData']['output']>;
  plugin: Scalars['String']['output'];
  required: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
  value?: Maybe<Scalars['UntypedStructuredData']['output']>;
};

export type ViewPageInfo = {
  __typename?: 'ViewPageInfo';
  offset: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ViewReference = {
  __typename?: 'ViewReference';
  contextualFilter?: Maybe<Array<Scalars['String']['output']>>;
  display: Scalars['String']['output'];
  pageSize?: Maybe<Scalars['Int']['output']>;
  query?: Maybe<Scalars['String']['output']>;
  view: Scalars['String']['output'];
};

export type ViewResultUnion = GoCategoriesResult;

export type WorkId = {
  __typename?: 'WorkId';
  material_type?: Maybe<Scalars['String']['output']>;
  work_id?: Maybe<Scalars['String']['output']>;
};

export type ImageFragmentFragment = { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } };

export type MediaVideotoolFragmentFragment = { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string };

export type MediaVideotoolVerticalFragmentFragment = { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string };

export type NodeGoPageFragment = { __typename: 'NodeGoPage', paragraphs?: Array<
    | { __typename?: 'ParagraphAccordion' }
    | { __typename?: 'ParagraphBanner' }
    | { __typename?: 'ParagraphBreadcrumbChildren' }
    | { __typename?: 'ParagraphCampaignRule' }
    | { __typename?: 'ParagraphCardGridAutomatic' }
    | { __typename?: 'ParagraphCardGridManual' }
    | { __typename?: 'ParagraphContentSlider' }
    | { __typename?: 'ParagraphContentSliderAutomatic' }
    | { __typename?: 'ParagraphEventTicketCategory' }
    | { __typename?: 'ParagraphFiles' }
    | { __typename?: 'ParagraphFilteredEventList' }
    | { __typename: 'ParagraphGoImages', goImages: Array<
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical' }
      > }
    | { __typename?: 'ParagraphGoLink' }
    | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical' }
       | null, goLinkParagraph:
        | { __typename?: 'ParagraphAccordion' }
        | { __typename?: 'ParagraphBanner' }
        | { __typename?: 'ParagraphBreadcrumbChildren' }
        | { __typename?: 'ParagraphCampaignRule' }
        | { __typename?: 'ParagraphCardGridAutomatic' }
        | { __typename?: 'ParagraphCardGridManual' }
        | { __typename?: 'ParagraphContentSlider' }
        | { __typename?: 'ParagraphContentSliderAutomatic' }
        | { __typename?: 'ParagraphEventTicketCategory' }
        | { __typename?: 'ParagraphFiles' }
        | { __typename?: 'ParagraphFilteredEventList' }
        | { __typename?: 'ParagraphGoImages' }
        | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
        | { __typename?: 'ParagraphGoLinkbox' }
        | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
        | { __typename?: 'ParagraphGoMaterialSliderManual' }
        | { __typename?: 'ParagraphGoTextBody' }
        | { __typename?: 'ParagraphGoVideo' }
        | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
        | { __typename?: 'ParagraphGoVideoBundleManual' }
        | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
        | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
        | { __typename?: 'ParagraphHero' }
        | { __typename?: 'ParagraphLanguageSelector' }
        | { __typename?: 'ParagraphLinks' }
        | { __typename?: 'ParagraphManualEventList' }
        | { __typename?: 'ParagraphMaterialGridAutomatic' }
        | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
        | { __typename?: 'ParagraphMaterialGridManual' }
        | { __typename?: 'ParagraphMedias' }
        | { __typename?: 'ParagraphNavGridManual' }
        | { __typename?: 'ParagraphNavSpotsManual' }
        | { __typename?: 'ParagraphOpeningHours' }
        | { __typename?: 'ParagraphRecommendation' }
        | { __typename?: 'ParagraphSimpleLinks' }
        | { __typename?: 'ParagraphTextBody' }
        | { __typename?: 'ParagraphUserRegistrationItem' }
        | { __typename?: 'ParagraphUserRegistrationLinklist' }
        | { __typename?: 'ParagraphUserRegistrationSection' }
        | { __typename?: 'ParagraphVideo' }
        | { __typename?: 'ParagraphWebform' }
       }
    | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
    | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
    | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
    | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
       }
    | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
       }
    | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
      , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
    | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
       }
    | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
      , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
    | { __typename?: 'ParagraphHero' }
    | { __typename?: 'ParagraphLanguageSelector' }
    | { __typename?: 'ParagraphLinks' }
    | { __typename?: 'ParagraphManualEventList' }
    | { __typename?: 'ParagraphMaterialGridAutomatic' }
    | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
    | { __typename?: 'ParagraphMaterialGridManual' }
    | { __typename?: 'ParagraphMedias' }
    | { __typename?: 'ParagraphNavGridManual' }
    | { __typename?: 'ParagraphNavSpotsManual' }
    | { __typename?: 'ParagraphOpeningHours' }
    | { __typename?: 'ParagraphRecommendation' }
    | { __typename?: 'ParagraphSimpleLinks' }
    | { __typename?: 'ParagraphTextBody' }
    | { __typename?: 'ParagraphUserRegistrationItem' }
    | { __typename?: 'ParagraphUserRegistrationLinklist' }
    | { __typename?: 'ParagraphUserRegistrationSection' }
    | { __typename?: 'ParagraphVideo' }
    | { __typename?: 'ParagraphWebform' }
  > | null };

export type NodeGoArticleFragment = { __typename: 'NodeGoArticle', id: string, title: string, subtitle?: string | null, goArticleImage?:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool' }
    | { __typename?: 'MediaVideotoolVertical' }
   | null, publicationDate: { __typename?: 'DateTime', timestamp: unknown }, paragraphs?: Array<
    | { __typename?: 'ParagraphAccordion' }
    | { __typename?: 'ParagraphBanner' }
    | { __typename?: 'ParagraphBreadcrumbChildren' }
    | { __typename?: 'ParagraphCampaignRule' }
    | { __typename?: 'ParagraphCardGridAutomatic' }
    | { __typename?: 'ParagraphCardGridManual' }
    | { __typename?: 'ParagraphContentSlider' }
    | { __typename?: 'ParagraphContentSliderAutomatic' }
    | { __typename?: 'ParagraphEventTicketCategory' }
    | { __typename?: 'ParagraphFiles' }
    | { __typename?: 'ParagraphFilteredEventList' }
    | { __typename: 'ParagraphGoImages', goImages: Array<
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical' }
      > }
    | { __typename?: 'ParagraphGoLink' }
    | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical' }
       | null, goLinkParagraph:
        | { __typename?: 'ParagraphAccordion' }
        | { __typename?: 'ParagraphBanner' }
        | { __typename?: 'ParagraphBreadcrumbChildren' }
        | { __typename?: 'ParagraphCampaignRule' }
        | { __typename?: 'ParagraphCardGridAutomatic' }
        | { __typename?: 'ParagraphCardGridManual' }
        | { __typename?: 'ParagraphContentSlider' }
        | { __typename?: 'ParagraphContentSliderAutomatic' }
        | { __typename?: 'ParagraphEventTicketCategory' }
        | { __typename?: 'ParagraphFiles' }
        | { __typename?: 'ParagraphFilteredEventList' }
        | { __typename?: 'ParagraphGoImages' }
        | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
        | { __typename?: 'ParagraphGoLinkbox' }
        | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
        | { __typename?: 'ParagraphGoMaterialSliderManual' }
        | { __typename?: 'ParagraphGoTextBody' }
        | { __typename?: 'ParagraphGoVideo' }
        | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
        | { __typename?: 'ParagraphGoVideoBundleManual' }
        | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
        | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
        | { __typename?: 'ParagraphHero' }
        | { __typename?: 'ParagraphLanguageSelector' }
        | { __typename?: 'ParagraphLinks' }
        | { __typename?: 'ParagraphManualEventList' }
        | { __typename?: 'ParagraphMaterialGridAutomatic' }
        | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
        | { __typename?: 'ParagraphMaterialGridManual' }
        | { __typename?: 'ParagraphMedias' }
        | { __typename?: 'ParagraphNavGridManual' }
        | { __typename?: 'ParagraphNavSpotsManual' }
        | { __typename?: 'ParagraphOpeningHours' }
        | { __typename?: 'ParagraphRecommendation' }
        | { __typename?: 'ParagraphSimpleLinks' }
        | { __typename?: 'ParagraphTextBody' }
        | { __typename?: 'ParagraphUserRegistrationItem' }
        | { __typename?: 'ParagraphUserRegistrationLinklist' }
        | { __typename?: 'ParagraphUserRegistrationSection' }
        | { __typename?: 'ParagraphVideo' }
        | { __typename?: 'ParagraphWebform' }
       }
    | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
    | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
    | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
    | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
       }
    | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
       }
    | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
      , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
    | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
       }
    | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
      , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
    | { __typename?: 'ParagraphHero' }
    | { __typename?: 'ParagraphLanguageSelector' }
    | { __typename?: 'ParagraphLinks' }
    | { __typename?: 'ParagraphManualEventList' }
    | { __typename?: 'ParagraphMaterialGridAutomatic' }
    | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
    | { __typename?: 'ParagraphMaterialGridManual' }
    | { __typename?: 'ParagraphMedias' }
    | { __typename?: 'ParagraphNavGridManual' }
    | { __typename?: 'ParagraphNavSpotsManual' }
    | { __typename?: 'ParagraphOpeningHours' }
    | { __typename?: 'ParagraphRecommendation' }
    | { __typename?: 'ParagraphSimpleLinks' }
    | { __typename?: 'ParagraphTextBody' }
    | { __typename?: 'ParagraphUserRegistrationItem' }
    | { __typename?: 'ParagraphUserRegistrationLinklist' }
    | { __typename?: 'ParagraphUserRegistrationSection' }
    | { __typename?: 'ParagraphVideo' }
    | { __typename?: 'ParagraphWebform' }
  > | null };

export type NodeGoCategoryFragment = { __typename: 'NodeGoCategory', id: string, path?: string | null, title: string, paragraphs?: Array<
    | { __typename?: 'ParagraphAccordion' }
    | { __typename?: 'ParagraphBanner' }
    | { __typename?: 'ParagraphBreadcrumbChildren' }
    | { __typename?: 'ParagraphCampaignRule' }
    | { __typename?: 'ParagraphCardGridAutomatic' }
    | { __typename?: 'ParagraphCardGridManual' }
    | { __typename?: 'ParagraphContentSlider' }
    | { __typename?: 'ParagraphContentSliderAutomatic' }
    | { __typename?: 'ParagraphEventTicketCategory' }
    | { __typename?: 'ParagraphFiles' }
    | { __typename?: 'ParagraphFilteredEventList' }
    | { __typename: 'ParagraphGoImages', goImages: Array<
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical' }
      > }
    | { __typename?: 'ParagraphGoLink' }
    | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical' }
       | null, goLinkParagraph:
        | { __typename?: 'ParagraphAccordion' }
        | { __typename?: 'ParagraphBanner' }
        | { __typename?: 'ParagraphBreadcrumbChildren' }
        | { __typename?: 'ParagraphCampaignRule' }
        | { __typename?: 'ParagraphCardGridAutomatic' }
        | { __typename?: 'ParagraphCardGridManual' }
        | { __typename?: 'ParagraphContentSlider' }
        | { __typename?: 'ParagraphContentSliderAutomatic' }
        | { __typename?: 'ParagraphEventTicketCategory' }
        | { __typename?: 'ParagraphFiles' }
        | { __typename?: 'ParagraphFilteredEventList' }
        | { __typename?: 'ParagraphGoImages' }
        | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
        | { __typename?: 'ParagraphGoLinkbox' }
        | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
        | { __typename?: 'ParagraphGoMaterialSliderManual' }
        | { __typename?: 'ParagraphGoTextBody' }
        | { __typename?: 'ParagraphGoVideo' }
        | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
        | { __typename?: 'ParagraphGoVideoBundleManual' }
        | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
        | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
        | { __typename?: 'ParagraphHero' }
        | { __typename?: 'ParagraphLanguageSelector' }
        | { __typename?: 'ParagraphLinks' }
        | { __typename?: 'ParagraphManualEventList' }
        | { __typename?: 'ParagraphMaterialGridAutomatic' }
        | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
        | { __typename?: 'ParagraphMaterialGridManual' }
        | { __typename?: 'ParagraphMedias' }
        | { __typename?: 'ParagraphNavGridManual' }
        | { __typename?: 'ParagraphNavSpotsManual' }
        | { __typename?: 'ParagraphOpeningHours' }
        | { __typename?: 'ParagraphRecommendation' }
        | { __typename?: 'ParagraphSimpleLinks' }
        | { __typename?: 'ParagraphTextBody' }
        | { __typename?: 'ParagraphUserRegistrationItem' }
        | { __typename?: 'ParagraphUserRegistrationLinklist' }
        | { __typename?: 'ParagraphUserRegistrationSection' }
        | { __typename?: 'ParagraphVideo' }
        | { __typename?: 'ParagraphWebform' }
       }
    | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
    | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
    | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
    | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
       }
    | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
       }
    | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
        | { __typename?: 'MediaVideotoolVertical' }
      , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
    | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
       }
    | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
      , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
    | { __typename?: 'ParagraphHero' }
    | { __typename?: 'ParagraphLanguageSelector' }
    | { __typename?: 'ParagraphLinks' }
    | { __typename?: 'ParagraphManualEventList' }
    | { __typename?: 'ParagraphMaterialGridAutomatic' }
    | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
    | { __typename?: 'ParagraphMaterialGridManual' }
    | { __typename?: 'ParagraphMedias' }
    | { __typename?: 'ParagraphNavGridManual' }
    | { __typename?: 'ParagraphNavSpotsManual' }
    | { __typename?: 'ParagraphOpeningHours' }
    | { __typename?: 'ParagraphRecommendation' }
    | { __typename?: 'ParagraphSimpleLinks' }
    | { __typename?: 'ParagraphTextBody' }
    | { __typename?: 'ParagraphUserRegistrationItem' }
    | { __typename?: 'ParagraphUserRegistrationLinklist' }
    | { __typename?: 'ParagraphUserRegistrationSection' }
    | { __typename?: 'ParagraphVideo' }
    | { __typename?: 'ParagraphWebform' }
  > | null };

export type GoVideoFragment = { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage' }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
    | { __typename?: 'MediaVideotoolVertical' }
   };

export type GoVideoBundleAutomaticFragment = { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage' }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
    | { __typename?: 'MediaVideotoolVertical' }
   };

export type GoVideoBundleManualFragment = { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage' }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
    | { __typename?: 'MediaVideotoolVertical' }
  , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null };

export type GoVideoBundleVerticalManualFragment = { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage' }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool' }
    | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
  , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null };

export type GoVideoBundleVerticalAutomaticFragment = { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage' }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool' }
    | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
   };

export type GoMaterialSliderAutomaticFragment = { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null };

export type GoMaterialSliderManualFragment = { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> };

export type GoLinkboxFragment = { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool' }
    | { __typename?: 'MediaVideotoolVertical' }
   | null, goLinkParagraph:
    | { __typename?: 'ParagraphAccordion' }
    | { __typename?: 'ParagraphBanner' }
    | { __typename?: 'ParagraphBreadcrumbChildren' }
    | { __typename?: 'ParagraphCampaignRule' }
    | { __typename?: 'ParagraphCardGridAutomatic' }
    | { __typename?: 'ParagraphCardGridManual' }
    | { __typename?: 'ParagraphContentSlider' }
    | { __typename?: 'ParagraphContentSliderAutomatic' }
    | { __typename?: 'ParagraphEventTicketCategory' }
    | { __typename?: 'ParagraphFiles' }
    | { __typename?: 'ParagraphFilteredEventList' }
    | { __typename?: 'ParagraphGoImages' }
    | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
    | { __typename?: 'ParagraphGoLinkbox' }
    | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
    | { __typename?: 'ParagraphGoMaterialSliderManual' }
    | { __typename?: 'ParagraphGoTextBody' }
    | { __typename?: 'ParagraphGoVideo' }
    | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
    | { __typename?: 'ParagraphGoVideoBundleManual' }
    | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
    | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
    | { __typename?: 'ParagraphHero' }
    | { __typename?: 'ParagraphLanguageSelector' }
    | { __typename?: 'ParagraphLinks' }
    | { __typename?: 'ParagraphManualEventList' }
    | { __typename?: 'ParagraphMaterialGridAutomatic' }
    | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
    | { __typename?: 'ParagraphMaterialGridManual' }
    | { __typename?: 'ParagraphMedias' }
    | { __typename?: 'ParagraphNavGridManual' }
    | { __typename?: 'ParagraphNavSpotsManual' }
    | { __typename?: 'ParagraphOpeningHours' }
    | { __typename?: 'ParagraphRecommendation' }
    | { __typename?: 'ParagraphSimpleLinks' }
    | { __typename?: 'ParagraphTextBody' }
    | { __typename?: 'ParagraphUserRegistrationItem' }
    | { __typename?: 'ParagraphUserRegistrationLinklist' }
    | { __typename?: 'ParagraphUserRegistrationSection' }
    | { __typename?: 'ParagraphVideo' }
    | { __typename?: 'ParagraphWebform' }
   };

export type GoTextBodyFragment = { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } };

export type GoImagesFragment = { __typename: 'ParagraphGoImages', goImages: Array<
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool' }
    | { __typename?: 'MediaVideotoolVertical' }
  > };

export type RouteRedirectFragment = { __typename: 'RouteRedirect', url: string };

export type GetArticleByPathQueryVariables = Exact<{
  path: Scalars['String']['input'];
}>;


export type GetArticleByPathQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', route?:
    | { __typename: 'RouteExternal' }
    | { __typename: 'RouteInternal', url: string, entity?:
        | { __typename: 'NodeGoArticle', id: string, title: string, subtitle?: string | null, goArticleImage?:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical' }
           | null, publicationDate: { __typename?: 'DateTime', timestamp: unknown }, paragraphs?: Array<
            | { __typename?: 'ParagraphAccordion' }
            | { __typename?: 'ParagraphBanner' }
            | { __typename?: 'ParagraphBreadcrumbChildren' }
            | { __typename?: 'ParagraphCampaignRule' }
            | { __typename?: 'ParagraphCardGridAutomatic' }
            | { __typename?: 'ParagraphCardGridManual' }
            | { __typename?: 'ParagraphContentSlider' }
            | { __typename?: 'ParagraphContentSliderAutomatic' }
            | { __typename?: 'ParagraphEventTicketCategory' }
            | { __typename?: 'ParagraphFiles' }
            | { __typename?: 'ParagraphFilteredEventList' }
            | { __typename: 'ParagraphGoImages', goImages: Array<
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical' }
              > }
            | { __typename?: 'ParagraphGoLink' }
            | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical' }
               | null, goLinkParagraph:
                | { __typename?: 'ParagraphAccordion' }
                | { __typename?: 'ParagraphBanner' }
                | { __typename?: 'ParagraphBreadcrumbChildren' }
                | { __typename?: 'ParagraphCampaignRule' }
                | { __typename?: 'ParagraphCardGridAutomatic' }
                | { __typename?: 'ParagraphCardGridManual' }
                | { __typename?: 'ParagraphContentSlider' }
                | { __typename?: 'ParagraphContentSliderAutomatic' }
                | { __typename?: 'ParagraphEventTicketCategory' }
                | { __typename?: 'ParagraphFiles' }
                | { __typename?: 'ParagraphFilteredEventList' }
                | { __typename?: 'ParagraphGoImages' }
                | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
                | { __typename?: 'ParagraphGoLinkbox' }
                | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
                | { __typename?: 'ParagraphGoMaterialSliderManual' }
                | { __typename?: 'ParagraphGoTextBody' }
                | { __typename?: 'ParagraphGoVideo' }
                | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
                | { __typename?: 'ParagraphGoVideoBundleManual' }
                | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
                | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
                | { __typename?: 'ParagraphHero' }
                | { __typename?: 'ParagraphLanguageSelector' }
                | { __typename?: 'ParagraphLinks' }
                | { __typename?: 'ParagraphManualEventList' }
                | { __typename?: 'ParagraphMaterialGridAutomatic' }
                | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
                | { __typename?: 'ParagraphMaterialGridManual' }
                | { __typename?: 'ParagraphMedias' }
                | { __typename?: 'ParagraphNavGridManual' }
                | { __typename?: 'ParagraphNavSpotsManual' }
                | { __typename?: 'ParagraphOpeningHours' }
                | { __typename?: 'ParagraphRecommendation' }
                | { __typename?: 'ParagraphSimpleLinks' }
                | { __typename?: 'ParagraphTextBody' }
                | { __typename?: 'ParagraphUserRegistrationItem' }
                | { __typename?: 'ParagraphUserRegistrationLinklist' }
                | { __typename?: 'ParagraphUserRegistrationSection' }
                | { __typename?: 'ParagraphVideo' }
                | { __typename?: 'ParagraphWebform' }
               }
            | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
            | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
            | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
            | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
               }
            | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
               }
            | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
              , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
            | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
               }
            | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
              , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
            | { __typename?: 'ParagraphHero' }
            | { __typename?: 'ParagraphLanguageSelector' }
            | { __typename?: 'ParagraphLinks' }
            | { __typename?: 'ParagraphManualEventList' }
            | { __typename?: 'ParagraphMaterialGridAutomatic' }
            | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
            | { __typename?: 'ParagraphMaterialGridManual' }
            | { __typename?: 'ParagraphMedias' }
            | { __typename?: 'ParagraphNavGridManual' }
            | { __typename?: 'ParagraphNavSpotsManual' }
            | { __typename?: 'ParagraphOpeningHours' }
            | { __typename?: 'ParagraphRecommendation' }
            | { __typename?: 'ParagraphSimpleLinks' }
            | { __typename?: 'ParagraphTextBody' }
            | { __typename?: 'ParagraphUserRegistrationItem' }
            | { __typename?: 'ParagraphUserRegistrationLinklist' }
            | { __typename?: 'ParagraphUserRegistrationSection' }
            | { __typename?: 'ParagraphVideo' }
            | { __typename?: 'ParagraphWebform' }
          > | null }
        | { __typename?: 'NodeGoCategory' }
        | { __typename?: 'NodeGoPage' }
        | { __typename?: 'NodePage' }
       | null }
    | { __typename: 'RouteRedirect', url: string }
   | null };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', goCategories?: { __typename?: 'GoCategoriesResult', results: Array<
      | { __typename?: 'NodeArticle' }
      | { __typename?: 'NodeGoArticle' }
      | { __typename?: 'NodeGoCategory', id: string, path?: string | null, categoryMenuTitle: string, categoryMenuImage:
          | { __typename?: 'MediaAudio' }
          | { __typename?: 'MediaDocument' }
          | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
          | { __typename?: 'MediaVideo' }
          | { __typename?: 'MediaVideotool' }
          | { __typename?: 'MediaVideotoolVertical' }
        , changed: { __typename?: 'DateTime', timestamp: unknown } }
      | { __typename?: 'NodeGoPage' }
      | { __typename?: 'NodePage' }
    > } | null };

export type GetCategoryPageByPathQueryVariables = Exact<{
  path: Scalars['String']['input'];
}>;


export type GetCategoryPageByPathQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', route?:
    | { __typename: 'RouteExternal' }
    | { __typename: 'RouteInternal', url: string, entity?:
        | { __typename?: 'NodeGoArticle' }
        | { __typename: 'NodeGoCategory', id: string, path?: string | null, title: string, paragraphs?: Array<
            | { __typename?: 'ParagraphAccordion' }
            | { __typename?: 'ParagraphBanner' }
            | { __typename?: 'ParagraphBreadcrumbChildren' }
            | { __typename?: 'ParagraphCampaignRule' }
            | { __typename?: 'ParagraphCardGridAutomatic' }
            | { __typename?: 'ParagraphCardGridManual' }
            | { __typename?: 'ParagraphContentSlider' }
            | { __typename?: 'ParagraphContentSliderAutomatic' }
            | { __typename?: 'ParagraphEventTicketCategory' }
            | { __typename?: 'ParagraphFiles' }
            | { __typename?: 'ParagraphFilteredEventList' }
            | { __typename: 'ParagraphGoImages', goImages: Array<
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical' }
              > }
            | { __typename?: 'ParagraphGoLink' }
            | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical' }
               | null, goLinkParagraph:
                | { __typename?: 'ParagraphAccordion' }
                | { __typename?: 'ParagraphBanner' }
                | { __typename?: 'ParagraphBreadcrumbChildren' }
                | { __typename?: 'ParagraphCampaignRule' }
                | { __typename?: 'ParagraphCardGridAutomatic' }
                | { __typename?: 'ParagraphCardGridManual' }
                | { __typename?: 'ParagraphContentSlider' }
                | { __typename?: 'ParagraphContentSliderAutomatic' }
                | { __typename?: 'ParagraphEventTicketCategory' }
                | { __typename?: 'ParagraphFiles' }
                | { __typename?: 'ParagraphFilteredEventList' }
                | { __typename?: 'ParagraphGoImages' }
                | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
                | { __typename?: 'ParagraphGoLinkbox' }
                | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
                | { __typename?: 'ParagraphGoMaterialSliderManual' }
                | { __typename?: 'ParagraphGoTextBody' }
                | { __typename?: 'ParagraphGoVideo' }
                | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
                | { __typename?: 'ParagraphGoVideoBundleManual' }
                | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
                | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
                | { __typename?: 'ParagraphHero' }
                | { __typename?: 'ParagraphLanguageSelector' }
                | { __typename?: 'ParagraphLinks' }
                | { __typename?: 'ParagraphManualEventList' }
                | { __typename?: 'ParagraphMaterialGridAutomatic' }
                | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
                | { __typename?: 'ParagraphMaterialGridManual' }
                | { __typename?: 'ParagraphMedias' }
                | { __typename?: 'ParagraphNavGridManual' }
                | { __typename?: 'ParagraphNavSpotsManual' }
                | { __typename?: 'ParagraphOpeningHours' }
                | { __typename?: 'ParagraphRecommendation' }
                | { __typename?: 'ParagraphSimpleLinks' }
                | { __typename?: 'ParagraphTextBody' }
                | { __typename?: 'ParagraphUserRegistrationItem' }
                | { __typename?: 'ParagraphUserRegistrationLinklist' }
                | { __typename?: 'ParagraphUserRegistrationSection' }
                | { __typename?: 'ParagraphVideo' }
                | { __typename?: 'ParagraphWebform' }
               }
            | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
            | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
            | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
            | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
               }
            | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
               }
            | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
              , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
            | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
               }
            | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
              , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
            | { __typename?: 'ParagraphHero' }
            | { __typename?: 'ParagraphLanguageSelector' }
            | { __typename?: 'ParagraphLinks' }
            | { __typename?: 'ParagraphManualEventList' }
            | { __typename?: 'ParagraphMaterialGridAutomatic' }
            | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
            | { __typename?: 'ParagraphMaterialGridManual' }
            | { __typename?: 'ParagraphMedias' }
            | { __typename?: 'ParagraphNavGridManual' }
            | { __typename?: 'ParagraphNavSpotsManual' }
            | { __typename?: 'ParagraphOpeningHours' }
            | { __typename?: 'ParagraphRecommendation' }
            | { __typename?: 'ParagraphSimpleLinks' }
            | { __typename?: 'ParagraphTextBody' }
            | { __typename?: 'ParagraphUserRegistrationItem' }
            | { __typename?: 'ParagraphUserRegistrationLinklist' }
            | { __typename?: 'ParagraphUserRegistrationSection' }
            | { __typename?: 'ParagraphVideo' }
            | { __typename?: 'ParagraphWebform' }
          > | null }
        | { __typename?: 'NodeGoPage' }
        | { __typename?: 'NodePage' }
       | null }
    | { __typename: 'RouteRedirect', url: string }
   | null };

export type GetDplCmsPrivateConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDplCmsPrivateConfigurationQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', private?: { __typename?: 'GoConfigurationPrivate', unilogin?: { __typename?: 'UniloginConfigurationPrivate', clientSecret?: string | null, pubHubRetailerKeyCode?: string | null } | null } | null } | null };

export type GetDplCmsPublicConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDplCmsPublicConfigurationQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', public?: { __typename?: 'GoConfigurationPublic', libraryInfo?: { __typename?: 'GoLibraryInfo', name?: string | null } | null, loginUrls?: { __typename?: 'GoLoginUrls', adgangsplatformen?: string | null } | null, logoutUrls?: { __typename?: 'GoLogoutUrls', adgangsplatformen?: string | null } | null, mapp?: { __typename?: 'MappTracking', domain?: string | null, id?: string | null } | null, unilogin?: { __typename?: 'UniloginConfigurationPublic', municipalityId?: string | null } | null } | null } | null };

export type GetPageByPathQueryVariables = Exact<{
  path: Scalars['String']['input'];
}>;


export type GetPageByPathQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', route?:
    | { __typename: 'RouteExternal' }
    | { __typename: 'RouteInternal', url: string, entity?:
        | { __typename?: 'NodeGoArticle' }
        | { __typename?: 'NodeGoCategory' }
        | { __typename: 'NodeGoPage', paragraphs?: Array<
            | { __typename?: 'ParagraphAccordion' }
            | { __typename?: 'ParagraphBanner' }
            | { __typename?: 'ParagraphBreadcrumbChildren' }
            | { __typename?: 'ParagraphCampaignRule' }
            | { __typename?: 'ParagraphCardGridAutomatic' }
            | { __typename?: 'ParagraphCardGridManual' }
            | { __typename?: 'ParagraphContentSlider' }
            | { __typename?: 'ParagraphContentSliderAutomatic' }
            | { __typename?: 'ParagraphEventTicketCategory' }
            | { __typename?: 'ParagraphFiles' }
            | { __typename?: 'ParagraphFilteredEventList' }
            | { __typename: 'ParagraphGoImages', goImages: Array<
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical' }
              > }
            | { __typename?: 'ParagraphGoLink' }
            | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical' }
               | null, goLinkParagraph:
                | { __typename?: 'ParagraphAccordion' }
                | { __typename?: 'ParagraphBanner' }
                | { __typename?: 'ParagraphBreadcrumbChildren' }
                | { __typename?: 'ParagraphCampaignRule' }
                | { __typename?: 'ParagraphCardGridAutomatic' }
                | { __typename?: 'ParagraphCardGridManual' }
                | { __typename?: 'ParagraphContentSlider' }
                | { __typename?: 'ParagraphContentSliderAutomatic' }
                | { __typename?: 'ParagraphEventTicketCategory' }
                | { __typename?: 'ParagraphFiles' }
                | { __typename?: 'ParagraphFilteredEventList' }
                | { __typename?: 'ParagraphGoImages' }
                | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
                | { __typename?: 'ParagraphGoLinkbox' }
                | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
                | { __typename?: 'ParagraphGoMaterialSliderManual' }
                | { __typename?: 'ParagraphGoTextBody' }
                | { __typename?: 'ParagraphGoVideo' }
                | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
                | { __typename?: 'ParagraphGoVideoBundleManual' }
                | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
                | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
                | { __typename?: 'ParagraphHero' }
                | { __typename?: 'ParagraphLanguageSelector' }
                | { __typename?: 'ParagraphLinks' }
                | { __typename?: 'ParagraphManualEventList' }
                | { __typename?: 'ParagraphMaterialGridAutomatic' }
                | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
                | { __typename?: 'ParagraphMaterialGridManual' }
                | { __typename?: 'ParagraphMedias' }
                | { __typename?: 'ParagraphNavGridManual' }
                | { __typename?: 'ParagraphNavSpotsManual' }
                | { __typename?: 'ParagraphOpeningHours' }
                | { __typename?: 'ParagraphRecommendation' }
                | { __typename?: 'ParagraphSimpleLinks' }
                | { __typename?: 'ParagraphTextBody' }
                | { __typename?: 'ParagraphUserRegistrationItem' }
                | { __typename?: 'ParagraphUserRegistrationLinklist' }
                | { __typename?: 'ParagraphUserRegistrationSection' }
                | { __typename?: 'ParagraphVideo' }
                | { __typename?: 'ParagraphWebform' }
               }
            | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
            | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
            | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
            | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
               }
            | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
               }
            | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
                | { __typename?: 'MediaVideotoolVertical' }
              , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
            | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
               }
            | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
                | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
              , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
            | { __typename?: 'ParagraphHero' }
            | { __typename?: 'ParagraphLanguageSelector' }
            | { __typename?: 'ParagraphLinks' }
            | { __typename?: 'ParagraphManualEventList' }
            | { __typename?: 'ParagraphMaterialGridAutomatic' }
            | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
            | { __typename?: 'ParagraphMaterialGridManual' }
            | { __typename?: 'ParagraphMedias' }
            | { __typename?: 'ParagraphNavGridManual' }
            | { __typename?: 'ParagraphNavSpotsManual' }
            | { __typename?: 'ParagraphOpeningHours' }
            | { __typename?: 'ParagraphRecommendation' }
            | { __typename?: 'ParagraphSimpleLinks' }
            | { __typename?: 'ParagraphTextBody' }
            | { __typename?: 'ParagraphUserRegistrationItem' }
            | { __typename?: 'ParagraphUserRegistrationLinklist' }
            | { __typename?: 'ParagraphUserRegistrationSection' }
            | { __typename?: 'ParagraphVideo' }
            | { __typename?: 'ParagraphWebform' }
          > | null }
        | { __typename?: 'NodePage' }
       | null }
    | { __typename: 'RouteRedirect', url: string }
   | null };

export type GetPreviewPageByIddQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  token: Scalars['String']['input'];
}>;


export type GetPreviewPageByIddQuery = { go: { cacheTags: string[] } } & { __typename: 'Query', preview?:
    | { __typename: 'NodeArticle' }
    | { __typename: 'NodeGoArticle', id: string, title: string, subtitle?: string | null, goArticleImage?:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
        | { __typename?: 'MediaVideotoolVertical' }
       | null, publicationDate: { __typename?: 'DateTime', timestamp: unknown }, paragraphs?: Array<
        | { __typename?: 'ParagraphAccordion' }
        | { __typename?: 'ParagraphBanner' }
        | { __typename?: 'ParagraphBreadcrumbChildren' }
        | { __typename?: 'ParagraphCampaignRule' }
        | { __typename?: 'ParagraphCardGridAutomatic' }
        | { __typename?: 'ParagraphCardGridManual' }
        | { __typename?: 'ParagraphContentSlider' }
        | { __typename?: 'ParagraphContentSliderAutomatic' }
        | { __typename?: 'ParagraphEventTicketCategory' }
        | { __typename?: 'ParagraphFiles' }
        | { __typename?: 'ParagraphFilteredEventList' }
        | { __typename: 'ParagraphGoImages', goImages: Array<
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical' }
          > }
        | { __typename?: 'ParagraphGoLink' }
        | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical' }
           | null, goLinkParagraph:
            | { __typename?: 'ParagraphAccordion' }
            | { __typename?: 'ParagraphBanner' }
            | { __typename?: 'ParagraphBreadcrumbChildren' }
            | { __typename?: 'ParagraphCampaignRule' }
            | { __typename?: 'ParagraphCardGridAutomatic' }
            | { __typename?: 'ParagraphCardGridManual' }
            | { __typename?: 'ParagraphContentSlider' }
            | { __typename?: 'ParagraphContentSliderAutomatic' }
            | { __typename?: 'ParagraphEventTicketCategory' }
            | { __typename?: 'ParagraphFiles' }
            | { __typename?: 'ParagraphFilteredEventList' }
            | { __typename?: 'ParagraphGoImages' }
            | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
            | { __typename?: 'ParagraphGoLinkbox' }
            | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
            | { __typename?: 'ParagraphGoMaterialSliderManual' }
            | { __typename?: 'ParagraphGoTextBody' }
            | { __typename?: 'ParagraphGoVideo' }
            | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
            | { __typename?: 'ParagraphGoVideoBundleManual' }
            | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
            | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
            | { __typename?: 'ParagraphHero' }
            | { __typename?: 'ParagraphLanguageSelector' }
            | { __typename?: 'ParagraphLinks' }
            | { __typename?: 'ParagraphManualEventList' }
            | { __typename?: 'ParagraphMaterialGridAutomatic' }
            | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
            | { __typename?: 'ParagraphMaterialGridManual' }
            | { __typename?: 'ParagraphMedias' }
            | { __typename?: 'ParagraphNavGridManual' }
            | { __typename?: 'ParagraphNavSpotsManual' }
            | { __typename?: 'ParagraphOpeningHours' }
            | { __typename?: 'ParagraphRecommendation' }
            | { __typename?: 'ParagraphSimpleLinks' }
            | { __typename?: 'ParagraphTextBody' }
            | { __typename?: 'ParagraphUserRegistrationItem' }
            | { __typename?: 'ParagraphUserRegistrationLinklist' }
            | { __typename?: 'ParagraphUserRegistrationSection' }
            | { __typename?: 'ParagraphVideo' }
            | { __typename?: 'ParagraphWebform' }
           }
        | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
        | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
        | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
        | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
           }
        | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
           }
        | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
          , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
        | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
           }
        | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
          , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
        | { __typename?: 'ParagraphHero' }
        | { __typename?: 'ParagraphLanguageSelector' }
        | { __typename?: 'ParagraphLinks' }
        | { __typename?: 'ParagraphManualEventList' }
        | { __typename?: 'ParagraphMaterialGridAutomatic' }
        | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
        | { __typename?: 'ParagraphMaterialGridManual' }
        | { __typename?: 'ParagraphMedias' }
        | { __typename?: 'ParagraphNavGridManual' }
        | { __typename?: 'ParagraphNavSpotsManual' }
        | { __typename?: 'ParagraphOpeningHours' }
        | { __typename?: 'ParagraphRecommendation' }
        | { __typename?: 'ParagraphSimpleLinks' }
        | { __typename?: 'ParagraphTextBody' }
        | { __typename?: 'ParagraphUserRegistrationItem' }
        | { __typename?: 'ParagraphUserRegistrationLinklist' }
        | { __typename?: 'ParagraphUserRegistrationSection' }
        | { __typename?: 'ParagraphVideo' }
        | { __typename?: 'ParagraphWebform' }
      > | null }
    | { __typename: 'NodeGoCategory', id: string, path?: string | null, title: string, paragraphs?: Array<
        | { __typename?: 'ParagraphAccordion' }
        | { __typename?: 'ParagraphBanner' }
        | { __typename?: 'ParagraphBreadcrumbChildren' }
        | { __typename?: 'ParagraphCampaignRule' }
        | { __typename?: 'ParagraphCardGridAutomatic' }
        | { __typename?: 'ParagraphCardGridManual' }
        | { __typename?: 'ParagraphContentSlider' }
        | { __typename?: 'ParagraphContentSliderAutomatic' }
        | { __typename?: 'ParagraphEventTicketCategory' }
        | { __typename?: 'ParagraphFiles' }
        | { __typename?: 'ParagraphFilteredEventList' }
        | { __typename: 'ParagraphGoImages', goImages: Array<
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical' }
          > }
        | { __typename?: 'ParagraphGoLink' }
        | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical' }
           | null, goLinkParagraph:
            | { __typename?: 'ParagraphAccordion' }
            | { __typename?: 'ParagraphBanner' }
            | { __typename?: 'ParagraphBreadcrumbChildren' }
            | { __typename?: 'ParagraphCampaignRule' }
            | { __typename?: 'ParagraphCardGridAutomatic' }
            | { __typename?: 'ParagraphCardGridManual' }
            | { __typename?: 'ParagraphContentSlider' }
            | { __typename?: 'ParagraphContentSliderAutomatic' }
            | { __typename?: 'ParagraphEventTicketCategory' }
            | { __typename?: 'ParagraphFiles' }
            | { __typename?: 'ParagraphFilteredEventList' }
            | { __typename?: 'ParagraphGoImages' }
            | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
            | { __typename?: 'ParagraphGoLinkbox' }
            | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
            | { __typename?: 'ParagraphGoMaterialSliderManual' }
            | { __typename?: 'ParagraphGoTextBody' }
            | { __typename?: 'ParagraphGoVideo' }
            | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
            | { __typename?: 'ParagraphGoVideoBundleManual' }
            | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
            | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
            | { __typename?: 'ParagraphHero' }
            | { __typename?: 'ParagraphLanguageSelector' }
            | { __typename?: 'ParagraphLinks' }
            | { __typename?: 'ParagraphManualEventList' }
            | { __typename?: 'ParagraphMaterialGridAutomatic' }
            | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
            | { __typename?: 'ParagraphMaterialGridManual' }
            | { __typename?: 'ParagraphMedias' }
            | { __typename?: 'ParagraphNavGridManual' }
            | { __typename?: 'ParagraphNavSpotsManual' }
            | { __typename?: 'ParagraphOpeningHours' }
            | { __typename?: 'ParagraphRecommendation' }
            | { __typename?: 'ParagraphSimpleLinks' }
            | { __typename?: 'ParagraphTextBody' }
            | { __typename?: 'ParagraphUserRegistrationItem' }
            | { __typename?: 'ParagraphUserRegistrationLinklist' }
            | { __typename?: 'ParagraphUserRegistrationSection' }
            | { __typename?: 'ParagraphVideo' }
            | { __typename?: 'ParagraphWebform' }
           }
        | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
        | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
        | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
        | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
           }
        | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
           }
        | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
          , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
        | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
           }
        | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
          , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
        | { __typename?: 'ParagraphHero' }
        | { __typename?: 'ParagraphLanguageSelector' }
        | { __typename?: 'ParagraphLinks' }
        | { __typename?: 'ParagraphManualEventList' }
        | { __typename?: 'ParagraphMaterialGridAutomatic' }
        | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
        | { __typename?: 'ParagraphMaterialGridManual' }
        | { __typename?: 'ParagraphMedias' }
        | { __typename?: 'ParagraphNavGridManual' }
        | { __typename?: 'ParagraphNavSpotsManual' }
        | { __typename?: 'ParagraphOpeningHours' }
        | { __typename?: 'ParagraphRecommendation' }
        | { __typename?: 'ParagraphSimpleLinks' }
        | { __typename?: 'ParagraphTextBody' }
        | { __typename?: 'ParagraphUserRegistrationItem' }
        | { __typename?: 'ParagraphUserRegistrationLinklist' }
        | { __typename?: 'ParagraphUserRegistrationSection' }
        | { __typename?: 'ParagraphVideo' }
        | { __typename?: 'ParagraphWebform' }
      > | null }
    | { __typename: 'NodeGoPage', paragraphs?: Array<
        | { __typename?: 'ParagraphAccordion' }
        | { __typename?: 'ParagraphBanner' }
        | { __typename?: 'ParagraphBreadcrumbChildren' }
        | { __typename?: 'ParagraphCampaignRule' }
        | { __typename?: 'ParagraphCardGridAutomatic' }
        | { __typename?: 'ParagraphCardGridManual' }
        | { __typename?: 'ParagraphContentSlider' }
        | { __typename?: 'ParagraphContentSliderAutomatic' }
        | { __typename?: 'ParagraphEventTicketCategory' }
        | { __typename?: 'ParagraphFiles' }
        | { __typename?: 'ParagraphFilteredEventList' }
        | { __typename: 'ParagraphGoImages', goImages: Array<
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical' }
          > }
        | { __typename?: 'ParagraphGoLink' }
        | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical' }
           | null, goLinkParagraph:
            | { __typename?: 'ParagraphAccordion' }
            | { __typename?: 'ParagraphBanner' }
            | { __typename?: 'ParagraphBreadcrumbChildren' }
            | { __typename?: 'ParagraphCampaignRule' }
            | { __typename?: 'ParagraphCardGridAutomatic' }
            | { __typename?: 'ParagraphCardGridManual' }
            | { __typename?: 'ParagraphContentSlider' }
            | { __typename?: 'ParagraphContentSliderAutomatic' }
            | { __typename?: 'ParagraphEventTicketCategory' }
            | { __typename?: 'ParagraphFiles' }
            | { __typename?: 'ParagraphFilteredEventList' }
            | { __typename?: 'ParagraphGoImages' }
            | { __typename?: 'ParagraphGoLink', targetBlank?: boolean | null, ariaLabel?: string | null, link: { __typename?: 'Link', title?: string | null, url?: string | null } }
            | { __typename?: 'ParagraphGoLinkbox' }
            | { __typename?: 'ParagraphGoMaterialSliderAutomatic' }
            | { __typename?: 'ParagraphGoMaterialSliderManual' }
            | { __typename?: 'ParagraphGoTextBody' }
            | { __typename?: 'ParagraphGoVideo' }
            | { __typename?: 'ParagraphGoVideoBundleAutomatic' }
            | { __typename?: 'ParagraphGoVideoBundleManual' }
            | { __typename?: 'ParagraphGoVideoBundleVerticalAuto' }
            | { __typename?: 'ParagraphGoVideoBundleVerticalManual' }
            | { __typename?: 'ParagraphHero' }
            | { __typename?: 'ParagraphLanguageSelector' }
            | { __typename?: 'ParagraphLinks' }
            | { __typename?: 'ParagraphManualEventList' }
            | { __typename?: 'ParagraphMaterialGridAutomatic' }
            | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
            | { __typename?: 'ParagraphMaterialGridManual' }
            | { __typename?: 'ParagraphMedias' }
            | { __typename?: 'ParagraphNavGridManual' }
            | { __typename?: 'ParagraphNavSpotsManual' }
            | { __typename?: 'ParagraphOpeningHours' }
            | { __typename?: 'ParagraphRecommendation' }
            | { __typename?: 'ParagraphSimpleLinks' }
            | { __typename?: 'ParagraphTextBody' }
            | { __typename?: 'ParagraphUserRegistrationItem' }
            | { __typename?: 'ParagraphUserRegistrationLinklist' }
            | { __typename?: 'ParagraphUserRegistrationSection' }
            | { __typename?: 'ParagraphVideo' }
            | { __typename?: 'ParagraphWebform' }
           }
        | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null }
        | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> }
        | { __typename: 'ParagraphGoTextBody', body: { __typename?: 'Text', processed?: unknown | null } }
        | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
           }
        | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
           }
        | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string, thumbnail: string }
            | { __typename?: 'MediaVideotoolVertical' }
          , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
        | { __typename: 'ParagraphGoVideoBundleVerticalAuto', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
           }
        | { __typename: 'ParagraphGoVideoBundleVerticalManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
            | { __typename?: 'MediaVideotoolVertical', id: string, name: string, mediaVideotoolVertical: string, thumbnail: string }
          , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null }
        | { __typename?: 'ParagraphHero' }
        | { __typename?: 'ParagraphLanguageSelector' }
        | { __typename?: 'ParagraphLinks' }
        | { __typename?: 'ParagraphManualEventList' }
        | { __typename?: 'ParagraphMaterialGridAutomatic' }
        | { __typename?: 'ParagraphMaterialGridLinkAutomatic' }
        | { __typename?: 'ParagraphMaterialGridManual' }
        | { __typename?: 'ParagraphMedias' }
        | { __typename?: 'ParagraphNavGridManual' }
        | { __typename?: 'ParagraphNavSpotsManual' }
        | { __typename?: 'ParagraphOpeningHours' }
        | { __typename?: 'ParagraphRecommendation' }
        | { __typename?: 'ParagraphSimpleLinks' }
        | { __typename?: 'ParagraphTextBody' }
        | { __typename?: 'ParagraphUserRegistrationItem' }
        | { __typename?: 'ParagraphUserRegistrationLinklist' }
        | { __typename?: 'ParagraphUserRegistrationSection' }
        | { __typename?: 'ParagraphVideo' }
        | { __typename?: 'ParagraphWebform' }
      > | null }
    | { __typename: 'NodePage' }
   | null };

export type GetAdgangsplatformenLibraryTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdgangsplatformenLibraryTokenQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', dplTokens?: { __typename?: 'DplTokens', adgangsplatformen?: { __typename?: 'AdgangsplatformenTokens', library?: { __typename?: 'AdgangsplatformenLibraryToken', token?: string | null, expire?: { __typename?: 'DateTime', timestamp: unknown } | null } | null } | null } | null };

export type GetAdgangsplatformenUserTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdgangsplatformenUserTokenQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', dplTokens?: { __typename?: 'DplTokens', adgangsplatformen?: { __typename?: 'AdgangsplatformenTokens', user?: { __typename?: 'AdgangsplatformenUserToken', token?: string | null, expire?: { __typename?: 'DateTime', timestamp: unknown } | null } | null } | null } | null };

export type GetLoginUrlsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLoginUrlsQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', public?: { __typename?: 'GoConfigurationPublic', loginUrls?: { __typename?: 'GoLoginUrls', adgangsplatformen?: string | null } | null } | null } | null };

export type GetLogoutUrlsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLogoutUrlsQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', public?: { __typename?: 'GoConfigurationPublic', logoutUrls?: { __typename?: 'GoLogoutUrls', adgangsplatformen?: string | null } | null } | null } | null };


export const MediaVideotoolFragmentFragmentDoc = `
    fragment mediaVideotoolFragment on MediaVideotool {
  id
  name
  mediaVideotool
  thumbnail
}
    `;
export const GoVideoFragmentDoc = `
    fragment goVideo on ParagraphGoVideo {
  __typename
  id
  created {
    timestamp
  }
  title
  embedVideo {
    ...mediaVideotoolFragment
  }
}
    `;
export const GoVideoBundleAutomaticFragmentDoc = `
    fragment goVideoBundleAutomatic on ParagraphGoVideoBundleAutomatic {
  __typename
  cqlSearch {
    value
  }
  goVideoTitle
  embedVideo {
    ...mediaVideotoolFragment
  }
  videoAmountOfMaterials
  id
}
    `;
export const GoVideoBundleManualFragmentDoc = `
    fragment goVideoBundleManual on ParagraphGoVideoBundleManual {
  __typename
  id
  goVideoTitle
  embedVideo {
    ...mediaVideotoolFragment
  }
  videoBundleWorkIds {
    material_type
    work_id
  }
}
    `;
export const MediaVideotoolVerticalFragmentFragmentDoc = `
    fragment mediaVideotoolVerticalFragment on MediaVideotoolVertical {
  id
  name
  mediaVideotoolVertical
  thumbnail
}
    `;
export const GoVideoBundleVerticalManualFragmentDoc = `
    fragment goVideoBundleVerticalManual on ParagraphGoVideoBundleVerticalManual {
  __typename
  id
  goVideoTitle
  embedVideo {
    ...mediaVideotoolVerticalFragment
  }
  videoBundleWorkIds {
    material_type
    work_id
  }
}
    `;
export const GoVideoBundleVerticalAutomaticFragmentDoc = `
    fragment goVideoBundleVerticalAutomatic on ParagraphGoVideoBundleVerticalAuto {
  __typename
  cqlSearch {
    value
  }
  goVideoTitle
  embedVideo {
    ...mediaVideotoolVerticalFragment
  }
  videoAmountOfMaterials
  id
}
    `;
export const GoMaterialSliderAutomaticFragmentDoc = `
    fragment goMaterialSliderAutomatic on ParagraphGoMaterialSliderAutomatic {
  __typename
  cqlSearch {
    value
  }
  titleOptional: title
  sliderAmountOfMaterials
}
    `;
export const GoMaterialSliderManualFragmentDoc = `
    fragment goMaterialSliderManual on ParagraphGoMaterialSliderManual {
  __typename
  titleOptional: title
  materialSliderWorkIds {
    material_type
    work_id
  }
}
    `;
export const ImageFragmentFragmentDoc = `
    fragment imageFragment on MediaImage {
  name
  mediaImage {
    url
    alt
    height
    width
    mime
    size
    title
  }
  byline
}
    `;
export const GoLinkboxFragmentDoc = `
    fragment goLinkbox on ParagraphGoLinkbox {
  __typename
  title
  goImage {
    ...imageFragment
  }
  goColor
  goDescription
  goLinkParagraph {
    ... on ParagraphGoLink {
      link {
        title
        url
      }
      targetBlank
      ariaLabel
    }
  }
}
    `;
export const GoTextBodyFragmentDoc = `
    fragment goTextBody on ParagraphGoTextBody {
  __typename
  body {
    processed
  }
}
    `;
export const GoImagesFragmentDoc = `
    fragment goImages on ParagraphGoImages {
  __typename
  goImages {
    ...imageFragment
  }
}
    `;
export const NodeGoPageFragmentDoc = `
    fragment nodeGoPage on NodeGoPage {
  __typename
  paragraphs {
    ...goVideo
    ...goVideoBundleAutomatic
    ...goVideoBundleManual
    ...goVideoBundleVerticalManual
    ...goVideoBundleVerticalAutomatic
    ...goMaterialSliderAutomatic
    ...goMaterialSliderManual
    ...goLinkbox
    ...goTextBody
    ...goImages
  }
}
    `;
export const NodeGoArticleFragmentDoc = `
    fragment nodeGoArticle on NodeGoArticle {
  __typename
  id
  title
  subtitle
  goArticleImage {
    ...imageFragment
  }
  publicationDate {
    timestamp
  }
  paragraphs {
    ...goVideo
    ...goVideoBundleAutomatic
    ...goVideoBundleManual
    ...goVideoBundleVerticalManual
    ...goVideoBundleVerticalAutomatic
    ...goMaterialSliderAutomatic
    ...goMaterialSliderManual
    ...goLinkbox
    ...goTextBody
    ...goImages
  }
}
    `;
export const NodeGoCategoryFragmentDoc = `
    fragment nodeGoCategory on NodeGoCategory {
  __typename
  id
  path
  title
  paragraphs {
    ...goVideo
    ...goVideoBundleAutomatic
    ...goVideoBundleManual
    ...goVideoBundleVerticalManual
    ...goVideoBundleVerticalAutomatic
    ...goMaterialSliderAutomatic
    ...goMaterialSliderManual
    ...goLinkbox
    ...goTextBody
    ...goImages
  }
}
    `;
export const RouteRedirectFragmentDoc = `
    fragment routeRedirect on RouteRedirect {
  __typename
  url
}
    `;
export const GetArticleByPathDocument = `
    query getArticleByPath($path: String!) {
  route(path: $path) {
    __typename
    ...routeRedirect
    ... on RouteInternal {
      url
      entity {
        ... on NodeGoArticle {
          __typename
          id
          title
          subtitle
          goArticleImage {
            ...imageFragment
          }
          publicationDate {
            timestamp
          }
          paragraphs {
            ...goVideo
            ...goVideoBundleAutomatic
            ...goVideoBundleManual
            ...goVideoBundleVerticalManual
            ...goVideoBundleVerticalAutomatic
            ...goMaterialSliderAutomatic
            ...goMaterialSliderManual
            ...goLinkbox
            ...goTextBody
            ...goImages
          }
        }
      }
    }
  }
}
    ${RouteRedirectFragmentDoc}
${ImageFragmentFragmentDoc}
${GoVideoFragmentDoc}
${MediaVideotoolFragmentFragmentDoc}
${GoVideoBundleAutomaticFragmentDoc}
${GoVideoBundleManualFragmentDoc}
${GoVideoBundleVerticalManualFragmentDoc}
${MediaVideotoolVerticalFragmentFragmentDoc}
${GoVideoBundleVerticalAutomaticFragmentDoc}
${GoMaterialSliderAutomaticFragmentDoc}
${GoMaterialSliderManualFragmentDoc}
${GoLinkboxFragmentDoc}
${GoTextBodyFragmentDoc}
${GoImagesFragmentDoc}`;

export const useGetArticleByPathQuery = <
      TData = GetArticleByPathQuery,
      TError = unknown
    >(
      variables: GetArticleByPathQueryVariables,
      options?: Omit<UseQueryOptions<GetArticleByPathQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetArticleByPathQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetArticleByPathQuery, TError, TData>(
      {
    queryKey: ['getArticleByPath', variables],
    queryFn: fetcher<GetArticleByPathQuery, GetArticleByPathQueryVariables>(GetArticleByPathDocument, variables),
    ...options
  }
    )};

useGetArticleByPathQuery.getKey = (variables: GetArticleByPathQueryVariables) => ['getArticleByPath', variables];

export const useSuspenseGetArticleByPathQuery = <
      TData = GetArticleByPathQuery,
      TError = unknown
    >(
      variables: GetArticleByPathQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetArticleByPathQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetArticleByPathQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetArticleByPathQuery, TError, TData>(
      {
    queryKey: ['getArticleByPath', variables],
    queryFn: fetcher<GetArticleByPathQuery, GetArticleByPathQueryVariables>(GetArticleByPathDocument, variables),
    ...options
  }
    )};

useSuspenseGetArticleByPathQuery.getKey = (variables: GetArticleByPathQueryVariables) => ['getArticleByPath', variables];


useGetArticleByPathQuery.fetcher = (variables: GetArticleByPathQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetArticleByPathQuery, GetArticleByPathQueryVariables>(GetArticleByPathDocument, variables, options);

export const GetCategoriesDocument = `
    query getCategories {
  goCategories {
    results {
      ... on NodeGoCategory {
        id
        path
        categoryMenuTitle
        categoryMenuImage {
          ... on MediaImage {
            name
            mediaImage {
              url
              alt
              height
              width
              mime
              size
              title
            }
            byline
          }
        }
        changed {
          timestamp
        }
      }
    }
  }
}
    `;

export const useGetCategoriesQuery = <
      TData = GetCategoriesQuery,
      TError = unknown
    >(
      variables?: GetCategoriesQueryVariables,
      options?: Omit<UseQueryOptions<GetCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCategoriesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getCategories'] : ['getCategories', variables],
    queryFn: fetcher<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, variables),
    ...options
  }
    )};

useGetCategoriesQuery.getKey = (variables?: GetCategoriesQueryVariables) => variables === undefined ? ['getCategories'] : ['getCategories', variables];

export const useSuspenseGetCategoriesQuery = <
      TData = GetCategoriesQuery,
      TError = unknown
    >(
      variables?: GetCategoriesQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetCategoriesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getCategories'] : ['getCategories', variables],
    queryFn: fetcher<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, variables),
    ...options
  }
    )};

useSuspenseGetCategoriesQuery.getKey = (variables?: GetCategoriesQueryVariables) => variables === undefined ? ['getCategories'] : ['getCategories', variables];


useGetCategoriesQuery.fetcher = (variables?: GetCategoriesQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, variables, options);

export const GetCategoryPageByPathDocument = `
    query getCategoryPageByPath($path: String!) {
  route(path: $path) {
    __typename
    ...routeRedirect
    ... on RouteInternal {
      url
      entity {
        ...nodeGoCategory
      }
    }
  }
}
    ${RouteRedirectFragmentDoc}
${NodeGoCategoryFragmentDoc}
${GoVideoFragmentDoc}
${MediaVideotoolFragmentFragmentDoc}
${GoVideoBundleAutomaticFragmentDoc}
${GoVideoBundleManualFragmentDoc}
${GoVideoBundleVerticalManualFragmentDoc}
${MediaVideotoolVerticalFragmentFragmentDoc}
${GoVideoBundleVerticalAutomaticFragmentDoc}
${GoMaterialSliderAutomaticFragmentDoc}
${GoMaterialSliderManualFragmentDoc}
${GoLinkboxFragmentDoc}
${ImageFragmentFragmentDoc}
${GoTextBodyFragmentDoc}
${GoImagesFragmentDoc}`;

export const useGetCategoryPageByPathQuery = <
      TData = GetCategoryPageByPathQuery,
      TError = unknown
    >(
      variables: GetCategoryPageByPathQueryVariables,
      options?: Omit<UseQueryOptions<GetCategoryPageByPathQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCategoryPageByPathQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCategoryPageByPathQuery, TError, TData>(
      {
    queryKey: ['getCategoryPageByPath', variables],
    queryFn: fetcher<GetCategoryPageByPathQuery, GetCategoryPageByPathQueryVariables>(GetCategoryPageByPathDocument, variables),
    ...options
  }
    )};

useGetCategoryPageByPathQuery.getKey = (variables: GetCategoryPageByPathQueryVariables) => ['getCategoryPageByPath', variables];

export const useSuspenseGetCategoryPageByPathQuery = <
      TData = GetCategoryPageByPathQuery,
      TError = unknown
    >(
      variables: GetCategoryPageByPathQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetCategoryPageByPathQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetCategoryPageByPathQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetCategoryPageByPathQuery, TError, TData>(
      {
    queryKey: ['getCategoryPageByPath', variables],
    queryFn: fetcher<GetCategoryPageByPathQuery, GetCategoryPageByPathQueryVariables>(GetCategoryPageByPathDocument, variables),
    ...options
  }
    )};

useSuspenseGetCategoryPageByPathQuery.getKey = (variables: GetCategoryPageByPathQueryVariables) => ['getCategoryPageByPath', variables];


useGetCategoryPageByPathQuery.fetcher = (variables: GetCategoryPageByPathQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetCategoryPageByPathQuery, GetCategoryPageByPathQueryVariables>(GetCategoryPageByPathDocument, variables, options);

export const GetDplCmsPrivateConfigurationDocument = `
    query getDplCmsPrivateConfiguration {
  goConfiguration {
    private {
      unilogin {
        clientSecret
        pubHubRetailerKeyCode
      }
    }
  }
}
    `;

export const useGetDplCmsPrivateConfigurationQuery = <
      TData = GetDplCmsPrivateConfigurationQuery,
      TError = unknown
    >(
      variables?: GetDplCmsPrivateConfigurationQueryVariables,
      options?: Omit<UseQueryOptions<GetDplCmsPrivateConfigurationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetDplCmsPrivateConfigurationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetDplCmsPrivateConfigurationQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getDplCmsPrivateConfiguration'] : ['getDplCmsPrivateConfiguration', variables],
    queryFn: fetcher<GetDplCmsPrivateConfigurationQuery, GetDplCmsPrivateConfigurationQueryVariables>(GetDplCmsPrivateConfigurationDocument, variables),
    ...options
  }
    )};

useGetDplCmsPrivateConfigurationQuery.getKey = (variables?: GetDplCmsPrivateConfigurationQueryVariables) => variables === undefined ? ['getDplCmsPrivateConfiguration'] : ['getDplCmsPrivateConfiguration', variables];

export const useSuspenseGetDplCmsPrivateConfigurationQuery = <
      TData = GetDplCmsPrivateConfigurationQuery,
      TError = unknown
    >(
      variables?: GetDplCmsPrivateConfigurationQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetDplCmsPrivateConfigurationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetDplCmsPrivateConfigurationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetDplCmsPrivateConfigurationQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getDplCmsPrivateConfiguration'] : ['getDplCmsPrivateConfiguration', variables],
    queryFn: fetcher<GetDplCmsPrivateConfigurationQuery, GetDplCmsPrivateConfigurationQueryVariables>(GetDplCmsPrivateConfigurationDocument, variables),
    ...options
  }
    )};

useSuspenseGetDplCmsPrivateConfigurationQuery.getKey = (variables?: GetDplCmsPrivateConfigurationQueryVariables) => variables === undefined ? ['getDplCmsPrivateConfiguration'] : ['getDplCmsPrivateConfiguration', variables];


useGetDplCmsPrivateConfigurationQuery.fetcher = (variables?: GetDplCmsPrivateConfigurationQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetDplCmsPrivateConfigurationQuery, GetDplCmsPrivateConfigurationQueryVariables>(GetDplCmsPrivateConfigurationDocument, variables, options);

export const GetDplCmsPublicConfigurationDocument = `
    query getDplCmsPublicConfiguration {
  goConfiguration {
    public {
      libraryInfo {
        name
      }
      loginUrls {
        adgangsplatformen
      }
      logoutUrls {
        adgangsplatformen
      }
      mapp {
        domain
        id
      }
      unilogin {
        municipalityId
      }
    }
  }
}
    `;

export const useGetDplCmsPublicConfigurationQuery = <
      TData = GetDplCmsPublicConfigurationQuery,
      TError = unknown
    >(
      variables?: GetDplCmsPublicConfigurationQueryVariables,
      options?: Omit<UseQueryOptions<GetDplCmsPublicConfigurationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetDplCmsPublicConfigurationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetDplCmsPublicConfigurationQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getDplCmsPublicConfiguration'] : ['getDplCmsPublicConfiguration', variables],
    queryFn: fetcher<GetDplCmsPublicConfigurationQuery, GetDplCmsPublicConfigurationQueryVariables>(GetDplCmsPublicConfigurationDocument, variables),
    ...options
  }
    )};

useGetDplCmsPublicConfigurationQuery.getKey = (variables?: GetDplCmsPublicConfigurationQueryVariables) => variables === undefined ? ['getDplCmsPublicConfiguration'] : ['getDplCmsPublicConfiguration', variables];

export const useSuspenseGetDplCmsPublicConfigurationQuery = <
      TData = GetDplCmsPublicConfigurationQuery,
      TError = unknown
    >(
      variables?: GetDplCmsPublicConfigurationQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetDplCmsPublicConfigurationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetDplCmsPublicConfigurationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetDplCmsPublicConfigurationQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getDplCmsPublicConfiguration'] : ['getDplCmsPublicConfiguration', variables],
    queryFn: fetcher<GetDplCmsPublicConfigurationQuery, GetDplCmsPublicConfigurationQueryVariables>(GetDplCmsPublicConfigurationDocument, variables),
    ...options
  }
    )};

useSuspenseGetDplCmsPublicConfigurationQuery.getKey = (variables?: GetDplCmsPublicConfigurationQueryVariables) => variables === undefined ? ['getDplCmsPublicConfiguration'] : ['getDplCmsPublicConfiguration', variables];


useGetDplCmsPublicConfigurationQuery.fetcher = (variables?: GetDplCmsPublicConfigurationQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetDplCmsPublicConfigurationQuery, GetDplCmsPublicConfigurationQueryVariables>(GetDplCmsPublicConfigurationDocument, variables, options);

export const GetPageByPathDocument = `
    query getPageByPath($path: String!) {
  route(path: $path) {
    __typename
    ...routeRedirect
    ... on RouteInternal {
      url
      entity {
        ... on NodeGoPage {
          __typename
          paragraphs {
            ...goVideo
            ...goVideoBundleAutomatic
            ...goVideoBundleManual
            ...goVideoBundleVerticalManual
            ...goVideoBundleVerticalAutomatic
            ...goMaterialSliderAutomatic
            ...goMaterialSliderManual
            ...goLinkbox
            ...goTextBody
            ...goImages
          }
        }
      }
    }
  }
}
    ${RouteRedirectFragmentDoc}
${GoVideoFragmentDoc}
${MediaVideotoolFragmentFragmentDoc}
${GoVideoBundleAutomaticFragmentDoc}
${GoVideoBundleManualFragmentDoc}
${GoVideoBundleVerticalManualFragmentDoc}
${MediaVideotoolVerticalFragmentFragmentDoc}
${GoVideoBundleVerticalAutomaticFragmentDoc}
${GoMaterialSliderAutomaticFragmentDoc}
${GoMaterialSliderManualFragmentDoc}
${GoLinkboxFragmentDoc}
${ImageFragmentFragmentDoc}
${GoTextBodyFragmentDoc}
${GoImagesFragmentDoc}`;

export const useGetPageByPathQuery = <
      TData = GetPageByPathQuery,
      TError = unknown
    >(
      variables: GetPageByPathQueryVariables,
      options?: Omit<UseQueryOptions<GetPageByPathQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPageByPathQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPageByPathQuery, TError, TData>(
      {
    queryKey: ['getPageByPath', variables],
    queryFn: fetcher<GetPageByPathQuery, GetPageByPathQueryVariables>(GetPageByPathDocument, variables),
    ...options
  }
    )};

useGetPageByPathQuery.getKey = (variables: GetPageByPathQueryVariables) => ['getPageByPath', variables];

export const useSuspenseGetPageByPathQuery = <
      TData = GetPageByPathQuery,
      TError = unknown
    >(
      variables: GetPageByPathQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetPageByPathQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetPageByPathQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetPageByPathQuery, TError, TData>(
      {
    queryKey: ['getPageByPath', variables],
    queryFn: fetcher<GetPageByPathQuery, GetPageByPathQueryVariables>(GetPageByPathDocument, variables),
    ...options
  }
    )};

useSuspenseGetPageByPathQuery.getKey = (variables: GetPageByPathQueryVariables) => ['getPageByPath', variables];


useGetPageByPathQuery.fetcher = (variables: GetPageByPathQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetPageByPathQuery, GetPageByPathQueryVariables>(GetPageByPathDocument, variables, options);

export const GetPreviewPageByIddDocument = `
    query getPreviewPageByIdd($id: ID!, $token: String!) {
  __typename
  preview(id: $id, token: $token) {
    __typename
    ...nodeGoPage
    ...nodeGoArticle
    ...nodeGoCategory
  }
}
    ${NodeGoPageFragmentDoc}
${GoVideoFragmentDoc}
${MediaVideotoolFragmentFragmentDoc}
${GoVideoBundleAutomaticFragmentDoc}
${GoVideoBundleManualFragmentDoc}
${GoVideoBundleVerticalManualFragmentDoc}
${MediaVideotoolVerticalFragmentFragmentDoc}
${GoVideoBundleVerticalAutomaticFragmentDoc}
${GoMaterialSliderAutomaticFragmentDoc}
${GoMaterialSliderManualFragmentDoc}
${GoLinkboxFragmentDoc}
${ImageFragmentFragmentDoc}
${GoTextBodyFragmentDoc}
${GoImagesFragmentDoc}
${NodeGoArticleFragmentDoc}
${NodeGoCategoryFragmentDoc}`;

export const useGetPreviewPageByIddQuery = <
      TData = GetPreviewPageByIddQuery,
      TError = unknown
    >(
      variables: GetPreviewPageByIddQueryVariables,
      options?: Omit<UseQueryOptions<GetPreviewPageByIddQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPreviewPageByIddQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPreviewPageByIddQuery, TError, TData>(
      {
    queryKey: ['getPreviewPageByIdd', variables],
    queryFn: fetcher<GetPreviewPageByIddQuery, GetPreviewPageByIddQueryVariables>(GetPreviewPageByIddDocument, variables),
    ...options
  }
    )};

useGetPreviewPageByIddQuery.getKey = (variables: GetPreviewPageByIddQueryVariables) => ['getPreviewPageByIdd', variables];

export const useSuspenseGetPreviewPageByIddQuery = <
      TData = GetPreviewPageByIddQuery,
      TError = unknown
    >(
      variables: GetPreviewPageByIddQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetPreviewPageByIddQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetPreviewPageByIddQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetPreviewPageByIddQuery, TError, TData>(
      {
    queryKey: ['getPreviewPageByIdd', variables],
    queryFn: fetcher<GetPreviewPageByIddQuery, GetPreviewPageByIddQueryVariables>(GetPreviewPageByIddDocument, variables),
    ...options
  }
    )};

useSuspenseGetPreviewPageByIddQuery.getKey = (variables: GetPreviewPageByIddQueryVariables) => ['getPreviewPageByIdd', variables];


useGetPreviewPageByIddQuery.fetcher = (variables: GetPreviewPageByIddQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetPreviewPageByIddQuery, GetPreviewPageByIddQueryVariables>(GetPreviewPageByIddDocument, variables, options);

export const GetAdgangsplatformenLibraryTokenDocument = `
    query getAdgangsplatformenLibraryToken {
  dplTokens {
    adgangsplatformen {
      library {
        token
        expire {
          timestamp
        }
      }
    }
  }
}
    `;

export const useGetAdgangsplatformenLibraryTokenQuery = <
      TData = GetAdgangsplatformenLibraryTokenQuery,
      TError = unknown
    >(
      variables?: GetAdgangsplatformenLibraryTokenQueryVariables,
      options?: Omit<UseQueryOptions<GetAdgangsplatformenLibraryTokenQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetAdgangsplatformenLibraryTokenQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetAdgangsplatformenLibraryTokenQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getAdgangsplatformenLibraryToken'] : ['getAdgangsplatformenLibraryToken', variables],
    queryFn: fetcher<GetAdgangsplatformenLibraryTokenQuery, GetAdgangsplatformenLibraryTokenQueryVariables>(GetAdgangsplatformenLibraryTokenDocument, variables),
    ...options
  }
    )};

useGetAdgangsplatformenLibraryTokenQuery.getKey = (variables?: GetAdgangsplatformenLibraryTokenQueryVariables) => variables === undefined ? ['getAdgangsplatformenLibraryToken'] : ['getAdgangsplatformenLibraryToken', variables];

export const useSuspenseGetAdgangsplatformenLibraryTokenQuery = <
      TData = GetAdgangsplatformenLibraryTokenQuery,
      TError = unknown
    >(
      variables?: GetAdgangsplatformenLibraryTokenQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetAdgangsplatformenLibraryTokenQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetAdgangsplatformenLibraryTokenQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetAdgangsplatformenLibraryTokenQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getAdgangsplatformenLibraryToken'] : ['getAdgangsplatformenLibraryToken', variables],
    queryFn: fetcher<GetAdgangsplatformenLibraryTokenQuery, GetAdgangsplatformenLibraryTokenQueryVariables>(GetAdgangsplatformenLibraryTokenDocument, variables),
    ...options
  }
    )};

useSuspenseGetAdgangsplatformenLibraryTokenQuery.getKey = (variables?: GetAdgangsplatformenLibraryTokenQueryVariables) => variables === undefined ? ['getAdgangsplatformenLibraryToken'] : ['getAdgangsplatformenLibraryToken', variables];


useGetAdgangsplatformenLibraryTokenQuery.fetcher = (variables?: GetAdgangsplatformenLibraryTokenQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetAdgangsplatformenLibraryTokenQuery, GetAdgangsplatformenLibraryTokenQueryVariables>(GetAdgangsplatformenLibraryTokenDocument, variables, options);

export const GetAdgangsplatformenUserTokenDocument = `
    query getAdgangsplatformenUserToken {
  dplTokens {
    adgangsplatformen {
      user {
        expire {
          timestamp
        }
        token
      }
    }
  }
}
    `;

export const useGetAdgangsplatformenUserTokenQuery = <
      TData = GetAdgangsplatformenUserTokenQuery,
      TError = unknown
    >(
      variables?: GetAdgangsplatformenUserTokenQueryVariables,
      options?: Omit<UseQueryOptions<GetAdgangsplatformenUserTokenQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetAdgangsplatformenUserTokenQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetAdgangsplatformenUserTokenQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getAdgangsplatformenUserToken'] : ['getAdgangsplatformenUserToken', variables],
    queryFn: fetcher<GetAdgangsplatformenUserTokenQuery, GetAdgangsplatformenUserTokenQueryVariables>(GetAdgangsplatformenUserTokenDocument, variables),
    ...options
  }
    )};

useGetAdgangsplatformenUserTokenQuery.getKey = (variables?: GetAdgangsplatformenUserTokenQueryVariables) => variables === undefined ? ['getAdgangsplatformenUserToken'] : ['getAdgangsplatformenUserToken', variables];

export const useSuspenseGetAdgangsplatformenUserTokenQuery = <
      TData = GetAdgangsplatformenUserTokenQuery,
      TError = unknown
    >(
      variables?: GetAdgangsplatformenUserTokenQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetAdgangsplatformenUserTokenQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetAdgangsplatformenUserTokenQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetAdgangsplatformenUserTokenQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getAdgangsplatformenUserToken'] : ['getAdgangsplatformenUserToken', variables],
    queryFn: fetcher<GetAdgangsplatformenUserTokenQuery, GetAdgangsplatformenUserTokenQueryVariables>(GetAdgangsplatformenUserTokenDocument, variables),
    ...options
  }
    )};

useSuspenseGetAdgangsplatformenUserTokenQuery.getKey = (variables?: GetAdgangsplatformenUserTokenQueryVariables) => variables === undefined ? ['getAdgangsplatformenUserToken'] : ['getAdgangsplatformenUserToken', variables];


useGetAdgangsplatformenUserTokenQuery.fetcher = (variables?: GetAdgangsplatformenUserTokenQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetAdgangsplatformenUserTokenQuery, GetAdgangsplatformenUserTokenQueryVariables>(GetAdgangsplatformenUserTokenDocument, variables, options);

export const GetLoginUrlsDocument = `
    query getLoginUrls {
  goConfiguration {
    public {
      loginUrls {
        adgangsplatformen
      }
    }
  }
}
    `;

export const useGetLoginUrlsQuery = <
      TData = GetLoginUrlsQuery,
      TError = unknown
    >(
      variables?: GetLoginUrlsQueryVariables,
      options?: Omit<UseQueryOptions<GetLoginUrlsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetLoginUrlsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetLoginUrlsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getLoginUrls'] : ['getLoginUrls', variables],
    queryFn: fetcher<GetLoginUrlsQuery, GetLoginUrlsQueryVariables>(GetLoginUrlsDocument, variables),
    ...options
  }
    )};

useGetLoginUrlsQuery.getKey = (variables?: GetLoginUrlsQueryVariables) => variables === undefined ? ['getLoginUrls'] : ['getLoginUrls', variables];

export const useSuspenseGetLoginUrlsQuery = <
      TData = GetLoginUrlsQuery,
      TError = unknown
    >(
      variables?: GetLoginUrlsQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetLoginUrlsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetLoginUrlsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetLoginUrlsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getLoginUrls'] : ['getLoginUrls', variables],
    queryFn: fetcher<GetLoginUrlsQuery, GetLoginUrlsQueryVariables>(GetLoginUrlsDocument, variables),
    ...options
  }
    )};

useSuspenseGetLoginUrlsQuery.getKey = (variables?: GetLoginUrlsQueryVariables) => variables === undefined ? ['getLoginUrls'] : ['getLoginUrls', variables];


useGetLoginUrlsQuery.fetcher = (variables?: GetLoginUrlsQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetLoginUrlsQuery, GetLoginUrlsQueryVariables>(GetLoginUrlsDocument, variables, options);

export const GetLogoutUrlsDocument = `
    query getLogoutUrls {
  goConfiguration {
    public {
      logoutUrls {
        adgangsplatformen
      }
    }
  }
}
    `;

export const useGetLogoutUrlsQuery = <
      TData = GetLogoutUrlsQuery,
      TError = unknown
    >(
      variables?: GetLogoutUrlsQueryVariables,
      options?: Omit<UseQueryOptions<GetLogoutUrlsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetLogoutUrlsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetLogoutUrlsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getLogoutUrls'] : ['getLogoutUrls', variables],
    queryFn: fetcher<GetLogoutUrlsQuery, GetLogoutUrlsQueryVariables>(GetLogoutUrlsDocument, variables),
    ...options
  }
    )};

useGetLogoutUrlsQuery.getKey = (variables?: GetLogoutUrlsQueryVariables) => variables === undefined ? ['getLogoutUrls'] : ['getLogoutUrls', variables];

export const useSuspenseGetLogoutUrlsQuery = <
      TData = GetLogoutUrlsQuery,
      TError = unknown
    >(
      variables?: GetLogoutUrlsQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetLogoutUrlsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetLogoutUrlsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetLogoutUrlsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getLogoutUrls'] : ['getLogoutUrls', variables],
    queryFn: fetcher<GetLogoutUrlsQuery, GetLogoutUrlsQueryVariables>(GetLogoutUrlsDocument, variables),
    ...options
  }
    )};

useSuspenseGetLogoutUrlsQuery.getKey = (variables?: GetLogoutUrlsQueryVariables) => variables === undefined ? ['getLogoutUrls'] : ['getLogoutUrls', variables];


useGetLogoutUrlsQuery.fetcher = (variables?: GetLogoutUrlsQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetLogoutUrlsQuery, GetLogoutUrlsQueryVariables>(GetLogoutUrlsDocument, variables, options);

export const operationNames = {
  Query: {
    getArticleByPath: 'getArticleByPath',
    getCategories: 'getCategories',
    getCategoryPageByPath: 'getCategoryPageByPath',
    getDplCmsPrivateConfiguration: 'getDplCmsPrivateConfiguration',
    getDplCmsPublicConfiguration: 'getDplCmsPublicConfiguration',
    getPageByPath: 'getPageByPath',
    getPreviewPageByIdd: 'getPreviewPageByIdd',
    getAdgangsplatformenLibraryToken: 'getAdgangsplatformenLibraryToken',
    getAdgangsplatformenUserToken: 'getAdgangsplatformenUserToken',
    getLoginUrls: 'getLoginUrls',
    getLogoutUrls: 'getLogoutUrls'
  },
  Fragment: {
    imageFragment: 'imageFragment',
    mediaVideotoolFragment: 'mediaVideotoolFragment',
    mediaVideotoolVerticalFragment: 'mediaVideotoolVerticalFragment',
    nodeGoPage: 'nodeGoPage',
    nodeGoArticle: 'nodeGoArticle',
    nodeGoCategory: 'nodeGoCategory',
    goVideo: 'goVideo',
    goVideoBundleAutomatic: 'goVideoBundleAutomatic',
    goVideoBundleManual: 'goVideoBundleManual',
    goVideoBundleVerticalManual: 'goVideoBundleVerticalManual',
    goVideoBundleVerticalAutomatic: 'goVideoBundleVerticalAutomatic',
    goMaterialSliderAutomatic: 'goMaterialSliderAutomatic',
    goMaterialSliderManual: 'goMaterialSliderManual',
    goLinkbox: 'goLinkbox',
    goTextBody: 'goTextBody',
    goImages: 'goImages',
    routeRedirect: 'routeRedirect'
  }
}