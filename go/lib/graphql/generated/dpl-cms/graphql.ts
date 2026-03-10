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

/** Complex address data. */
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

/** Kommune. */
export type AddressCountry = {
  __typename?: 'AddressCountry';
  /** The code of the country. */
  code?: Maybe<Scalars['String']['output']>;
  /** The name of the country. */
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

/** Input for filter exposed with operator "between". */
export type BetweenFloatInput = {
  /** The maximum value of the range. */
  max?: InputMaybe<Scalars['Float']['input']>;
  /** The minimum value of the range. */
  min?: InputMaybe<Scalars['Float']['input']>;
};

/** Input for filter exposed with operator "between". */
export type BetweenStringInput = {
  /** The maximum value of the range. */
  max?: InputMaybe<Scalars['String']['input']>;
  /** The minimum value of the range. */
  min?: InputMaybe<Scalars['String']['input']>;
};

/** En CQL søgestreng. */
export type CqlSearch = {
  __typename?: 'CQLSearch';
  /** CQL søgestrengen. */
  value?: Maybe<Scalars['String']['output']>;
};

/** A color field. */
export type Color = {
  __typename?: 'Color';
  /** The color value in #HEX format. */
  color?: Maybe<Scalars['String']['output']>;
  /** The opacity value. */
  opacity?: Maybe<Scalars['Float']['output']>;
};

/** A Date range has a start and an end. */
export type DateRange = {
  __typename?: 'DateRange';
  /** The end of the date range. */
  end?: Maybe<DateTime>;
  /** The start of the date range. */
  start?: Maybe<DateTime>;
};

/** A DateTime object. */
export type DateTime = {
  __typename?: 'DateTime';
  /** A string that will have a value of format ±hh:mm */
  offset: Scalars['UtcOffset']['output'];
  /** RFC 3339 compliant time string. */
  time: Scalars['Time']['output'];
  /** Type represents date and time as number of milliseconds from start of the UNIX epoch. */
  timestamp: Scalars['Timestamp']['output'];
  /** A field whose value exists in the standard IANA Time Zone Database. */
  timezone: Scalars['TimeZone']['output'];
};

export type DplTokens = {
  __typename?: 'DplTokens';
  adgangsplatformen?: Maybe<AdgangsplatformenTokens>;
};

/** A file object to represent an managed file. */
export type File = {
  __typename?: 'File';
  /** The description of the file. */
  description?: Maybe<Scalars['String']['output']>;
  /** Filens mime-type. */
  mime?: Maybe<Scalars['String']['output']>;
  /** Filens navn. */
  name?: Maybe<Scalars['String']['output']>;
  /** Filens størrelse i bytes. */
  size: Scalars['Int']['output'];
  /** The URL of the file. */
  url: Scalars['String']['output'];
};

/** Result for view go_categories display go_categories. */
export type GoCategoriesResult = View & {
  __typename?: 'GoCategoriesResult';
  /** Viewets beskrivelse. */
  description?: Maybe<Scalars['String']['output']>;
  /** The machine name of the display. */
  display: Scalars['String']['output'];
  /** The ID of the view. */
  id: Scalars['ID']['output'];
  /** The human friendly label of the view. */
  label?: Maybe<Scalars['String']['output']>;
  /** The language code of the view. */
  langcode?: Maybe<Scalars['String']['output']>;
  /** Information about the page in the view. */
  pageInfo: ViewPageInfo;
  /** The results of the view. */
  results: Array<NodeUnion>;
  /** The machine name of the view. */
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

/** A image object to represent an managed file. */
export type Image = {
  __typename?: 'Image';
  /** The alt text of the image. */
  alt?: Maybe<Scalars['String']['output']>;
  /** The height of the image. */
  height: Scalars['Int']['output'];
  /** The mime type of the image. */
  mime?: Maybe<Scalars['String']['output']>;
  /** The size of the image in bytes. */
  size: Scalars['Int']['output'];
  /** The title text of the image. */
  title?: Maybe<Scalars['String']['output']>;
  /** The URL of the image. */
  url: Scalars['String']['output'];
  /** The width of the image. */
  width: Scalars['Int']['output'];
};

/** Generic input for key-value pairs. */
export type KeyValueInput = {
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

/** A language definition provided by the CMS. */
export type Language = {
  __typename?: 'Language';
  /** The language direction. */
  direction?: Maybe<Scalars['String']['output']>;
  /** Sprogkoden. */
  id?: Maybe<Scalars['ID']['output']>;
  /** Navnet på sproget. */
  name?: Maybe<Scalars['String']['output']>;
};

/** A link. */
export type Link = {
  __typename?: 'Link';
  id?: Maybe<Scalars['String']['output']>;
  /** Whether the link is internal to this website. */
  internal: Scalars['Boolean']['output'];
  /** Linkets titel */
  title?: Maybe<Scalars['String']['output']>;
  /** Linkets URL */
  url?: Maybe<Scalars['String']['output']>;
};

/** Entity type media. */
export type MediaAudio = MediaInterface & {
  __typename?: 'MediaAudio';
  /** The time the media item was last edited. */
  changed: DateTime;
  /** The time the media item was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Audio file */
  mediaAudioFile: File;
  /** Name */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type media. */
export type MediaDocument = MediaInterface & {
  __typename?: 'MediaDocument';
  /** The time the media item was last edited. */
  changed: DateTime;
  /** The time the media item was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** File */
  mediaFile: File;
  /** Name */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type media. */
export type MediaImage = MediaInterface & {
  __typename?: 'MediaImage';
  /** Used for public credit and copyright information. Will usually be displayed along with the media. */
  byline?: Maybe<Scalars['String']['output']>;
  /** The time the media item was last edited. */
  changed: DateTime;
  /** The time the media item was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /**
   * You can set a focal point, by clicking on the preview on the image, moving the
   * white target.<br /><br />By setting a focal point, you tell the system which
   * part of the image to keep in focus when it gets cropped.<br /><br />Use the
   * "preview" function, to see how your image will be cropped across image styles.
   */
  mediaImage: Image;
  /** Name */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type media. */
export type MediaInterface = {
  /** The time the media item was last edited. */
  changed: DateTime;
  /** The time the media item was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type media. */
export type MediaUnion = MediaAudio | MediaDocument | MediaImage | MediaVideo | MediaVideotool;

/** Entity type media. */
export type MediaVideo = MediaInterface & {
  __typename?: 'MediaVideo';
  /** The time the media item was last edited. */
  changed: DateTime;
  /** The time the media item was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Remote video URL */
  mediaOembedVideo: Scalars['String']['output'];
  /** Name */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  thumbnail: Scalars['String']['output'];
};

/** Entity type media. */
export type MediaVideotool = MediaInterface & {
  __typename?: 'MediaVideotool';
  /** The time the media item was last edited. */
  changed: DateTime;
  /** The time the media item was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** VideoTool URL */
  mediaVideotool: Scalars['String']['output'];
  /** Name */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  thumbnail: Scalars['String']['output'];
};

/** The schema's entry-point for mutations. */
export type Mutation = {
  __typename?: 'Mutation';
  /** Placeholder for mutation extension. */
  _: Scalars['Boolean']['output'];
};

/** Use articles for news-worthy content, that does not get updated regularly. */
export type NodeArticle = NodeInterface & {
  __typename?: 'NodeArticle';
  /** Branch */
  branch?: Maybe<NodeUnion>;
  /**
   * Please provide a canonical URL if this content has been duplicated from other
   * websites. This helps signal to search engines that the preferred source of
   * this content is the specified canonical URL, preventing potential duplicate
   * content issues and ensuring proper attribution to the original source.
   */
  canonicalUrl?: Maybe<Link>;
  /** Categories */
  categories?: Maybe<TermUnion>;
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Override author */
  overrideAuthor?: Maybe<Scalars['String']['output']>;
  /** Paragraphs */
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publication date */
  publicationDate: DateTime;
  /**
   * By default, the author is set to the Drupal user that owns the content.<br
   * /><br />If you want to override this, with a manual text, you can check this.
   */
  showOverrideAuthor?: Maybe<Scalars['Boolean']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Subtitle */
  subtitle?: Maybe<Scalars['String']['output']>;
  /** Tags */
  tags?: Maybe<Array<TermUnion>>;
  /**
   * The teaser fields are used for the card of display.<br />If no image has been
   * selected, the text will be shown instead:<br /><br /><img
   * src="/themes/custom/novel/images/teaser-text-image.jpg" /><br /><br /><hr/>
   */
  teaserImage?: Maybe<MediaUnion>;
  /** Teaser text */
  teaserText?: Maybe<Scalars['String']['output']>;
  /** Title */
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/** Use Go articles for news-worthy content, that does not get updated regularly. */
export type NodeGoArticle = NodeInterface & {
  __typename?: 'NodeGoArticle';
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /** Image */
  goArticleImage?: Maybe<MediaUnion>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Override author */
  overrideAuthor?: Maybe<Scalars['String']['output']>;
  /** Paragraphs */
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publication date */
  publicationDate: DateTime;
  /**
   * By default, the author is set to the Drupal user that owns the content.<br
   * /><br />If you want to override this, with a manual text, you can check this.
   */
  showOverrideAuthor?: Maybe<Scalars['Boolean']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Subtitle */
  subtitle?: Maybe<Scalars['String']['output']>;
  /**
   * The teaser fields are used for the card of display.<br />If no image has been
   * selected, the text will be shown instead:<br /><br /><img
   * src="/themes/custom/novel/images/teaser-text-image.jpg" /><br /><br /><hr/>
   */
  teaserImage: MediaUnion;
  /** Teaser text */
  teaserText?: Maybe<Scalars['String']['output']>;
  /** Title */
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/**
 * GO category pages will be used for creating a "landingpage" for specific categories.
 * When creating and publishing a new category page, the category will automatically be added to the category menu.
 */
export type NodeGoCategory = NodeInterface & {
  __typename?: 'NodeGoCategory';
  /** The category image will be shown in the category menu as part of this category's menu element. */
  categoryMenuImage: MediaUnion;
  /** The category sound will be able to be played in the category menu as part of this category's menu element. */
  categoryMenuSound?: Maybe<MediaUnion>;
  /** The category title will be shown in the category menu as part of this category's menu element. */
  categoryMenuTitle: Scalars['String']['output'];
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /** Category menu color */
  goColor?: Maybe<Scalars['String']['output']>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Paragraphs */
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publication date */
  publicationDate: DateTime;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/**
 * GO pages will be used for various types of content, which does not belong to
 * either an article page or an category page. Some examples could be the
 * frontpage, info pages, etc.
 */
export type NodeGoPage = NodeInterface & {
  __typename?: 'NodeGoPage';
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Paragraphs */
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publication date */
  publicationDate: DateTime;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/** Entity type node. */
export type NodeInterface = {
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/**
 * Pages can be used for various types of content, either temporary or permanent. A
 * page can be simple, containing text about, for example, loan rules, or it can
 * serve as a structural unit designed to display other pages in a section for
 * communication or navigation.
 */
export type NodePage = NodeInterface & {
  __typename?: 'NodePage';
  /** Branch */
  branch?: Maybe<NodeUnion>;
  /**
   * TODO: A text about how the structure tree works.<br><br />"If you want to make
   * this page central, you need to save it first, and then <a
   * href="/admin/structure/taxonomy/manage/breadcrumb_structure/add"
   * target="_blank">add it as a reference in the content structure tree</a>
   */
  breadcrumbParent?: Maybe<TermUnion>;
  /**
   * Please provide a canonical URL if this content has been duplicated from other
   * websites. This helps signal to search engines that the preferred source of
   * this content is the specified canonical URL, preventing potential duplicate
   * content issues and ensuring proper attribution to the original source.
   */
  canonicalUrl?: Maybe<Link>;
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /**
   * By default, titles and subtitles are not displayed on pages. If you wish to
   * have it displayed, you can enable this setting.
   */
  displayTitles?: Maybe<Scalars['Boolean']['output']>;
  /**
   * The title that is shown at the top of the page.<br /><br /><strong>If this is
   * empty, the standard page title will be used instead.</strong>
   */
  heroTitle?: Maybe<Scalars['String']['output']>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Language */
  langcode: Language;
  /** Paragraphs */
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publication date */
  publicationDate: DateTime;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Subtitle */
  subtitle?: Maybe<Scalars['String']['output']>;
  /**
   * The teaser fields are used for the card of display.<br />If no image has been
   * selected, the text will be shown instead:<br /><br /><img
   * src="/themes/custom/novel/images/teaser-text-image.jpg" /><br /><br /><hr/>
   */
  teaserImage?: Maybe<MediaUnion>;
  /** Teaser text */
  teaserText?: Maybe<Scalars['String']['output']>;
  /** Title */
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/** Entity type node. */
export type NodeUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

/** Entity type paragraph. */
export type ParagraphAccordion = ParagraphInterface & {
  __typename?: 'ParagraphAccordion';
  /** Accordion description */
  accordionDescription?: Maybe<Text>;
  /** Accordion title */
  accordionTitle: Text;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Banner's purpose is to link internally or externally and can be used with or without a background image. */
export type ParagraphBanner = ParagraphInterface & {
  __typename?: 'ParagraphBanner';
  /** Banner description */
  bannerDescription?: Maybe<Scalars['String']['output']>;
  /** Banner Image */
  bannerImage?: Maybe<MediaUnion>;
  /** Banner Link */
  bannerLink: Link;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Underlined title */
  underlinedTitle?: Maybe<Text>;
};

/** Automatically display all content that is referencing your chosen breadcrumb item. */
export type ParagraphBreadcrumbChildren = ParagraphInterface & {
  __typename?: 'ParagraphBreadcrumbChildren';
  /**
   * Choose a parent in the breadcrumb structure, from which the children will be
   * displayed. <br><br />Only one level of children will be shown.
   */
  breadcrumbTarget?: Maybe<TermUnion>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Show subtitles */
  showSubtitles?: Maybe<Scalars['Boolean']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** A rule for selecting a matching campaign */
export type ParagraphCampaignRule = ParagraphInterface & {
  __typename?: 'ParagraphCampaignRule';
  /** Facet */
  campaignRuleFacet: Scalars['String']['output'];
  /** Term */
  campaignRuleTerm: Scalars['String']['output'];
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphCardGridAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphCardGridAutomatic';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** If nothing is selected, all will be chosen. */
  filterBranches?: Maybe<Array<NodeUnion>>;
  /** Filter by categories */
  filterCategories?: Maybe<Array<TermUnion>>;
  /** Condition type */
  filterCondType: Scalars['String']['output'];
  /** If nothing is selected, all will be chosen. */
  filterContentTypes?: Maybe<Array<Scalars['String']['output']>>;
  /** Filter by tags */
  filterTags?: Maybe<Array<TermUnion>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** More link */
  moreLink?: Maybe<Link>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title?: Maybe<Scalars['String']['output']>;
};

/** Entity type paragraph. */
export type ParagraphCardGridManual = ParagraphInterface & {
  __typename?: 'ParagraphCardGridManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Content */
  gridContent?: Maybe<Array<ParagraphCardGridManualGridContentUnion>>;
  gridContentUuids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** More link */
  moreLink?: Maybe<Link>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title?: Maybe<Scalars['String']['output']>;
};

/** Content */
export type ParagraphCardGridManualGridContentUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

/** Entity type paragraph. */
export type ParagraphContentSlider = ParagraphInterface & {
  __typename?: 'ParagraphContentSlider';
  /** Contents */
  contentReferences?: Maybe<Array<ParagraphContentSliderContentReferencesUnion>>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** deprecated */
  title?: Maybe<Scalars['String']['output']>;
  /** Title */
  underlinedTitle?: Maybe<Text>;
};

/** Entity type paragraph. */
export type ParagraphContentSliderAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphContentSliderAutomatic';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** If nothing is selected, all will be chosen. */
  filterBranches?: Maybe<Array<NodeUnion>>;
  /** Filter by categories */
  filterCategories?: Maybe<Array<TermUnion>>;
  /** Condition type */
  filterCondType: Scalars['String']['output'];
  /** If nothing is selected, all will be chosen. */
  filterContentTypes?: Maybe<Array<Scalars['String']['output']>>;
  /** Filter by tags */
  filterTags?: Maybe<Array<TermUnion>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** deprecated */
  title?: Maybe<Scalars['String']['output']>;
  /** Title */
  underlinedTitle?: Maybe<Text>;
};

/** Contents */
export type ParagraphContentSliderContentReferencesUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

/** A combination of ticket category name and price for an event.  */
export type ParagraphEventTicketCategory = ParagraphInterface & {
  __typename?: 'ParagraphEventTicketCategory';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Name */
  ticketCategoryName: Scalars['String']['output'];
};

/** Links with icons. Designed for jpg, jpeg, png, pdf, mp3, mov, mp4, mpeg files */
export type ParagraphFiles = ParagraphInterface & {
  __typename?: 'ParagraphFiles';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Files */
  files?: Maybe<Array<MediaUnion>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** This paragraph displays a generated a list of events, based on specified filters for tags, categories and branches.  */
export type ParagraphFilteredEventList = ParagraphInterface & {
  __typename?: 'ParagraphFilteredEventList';
  /** This field is no longer in use, and will be deleted in the future. */
  amountOfEvents?: Maybe<Scalars['Int']['output']>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** If nothing is selected, all will be chosen. */
  filterBranches?: Maybe<Array<NodeUnion>>;
  /** Add a category you want to include */
  filterCategories?: Maybe<Array<TermUnion>>;
  /** Condition type */
  filterCondType: Scalars['String']['output'];
  /** Add a tag you want to include */
  filterTags?: Maybe<Array<TermUnion>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /**
   * Select the amount of events you want to display. <br /><br />If the amount
   * displayed is less than what you put here, it is likely because there are not
   * enough results based on your selected filters.
   */
  maxItemAmount: Scalars['String']['output'];
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title?: Maybe<Scalars['String']['output']>;
};

/** This paragraph is used for displaying 1-2 images on GO content types such as GO Article, GO Page and GO Category. */
export type ParagraphGoImages = ParagraphInterface & {
  __typename?: 'ParagraphGoImages';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Images */
  goImages: Array<MediaUnion>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/**
 * This link paragraph is used for links in GO, as it requires additional fields
 * such as aria-label and ‘Open link in new window.’ These fields could not be
 * exported in GraphQL when using a Linkit widget.
 */
export type ParagraphGoLink = ParagraphInterface & {
  __typename?: 'ParagraphGoLink';
  /** Aria Label */
  ariaLabel?: Maybe<Scalars['String']['output']>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Link */
  link: Link;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Open link in a new window */
  targetBlank?: Maybe<Scalars['Boolean']['output']>;
};

/** Entity type paragraph. */
export type ParagraphGoLinkbox = ParagraphInterface & {
  __typename?: 'ParagraphGoLinkbox';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Color */
  goColor?: Maybe<Scalars['String']['output']>;
  /** Description */
  goDescription: Scalars['String']['output'];
  /** Image */
  goImage?: Maybe<MediaUnion>;
  /** Link */
  goLinkParagraph: ParagraphUnion;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
};

/** This paragraph is used for displaying a range of materials based on a CQL search string.  */
export type ParagraphGoMaterialSliderAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphGoMaterialSliderAutomatic';
  /**
   * This field is for inserting a CQL string based on a search. <br /><br />Please
   * be aware, that it is necessary to copy the exact CQL string, including the
   * quotations. i.e: ( 'harry potter')<br /><br />A valid CQL search string can be
   * generated, by performing a query through the advanced search, and copying the
   * CQL string from there.
   */
  cqlSearch?: Maybe<CqlSearch>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Amount of materials */
  sliderAmountOfMaterials: Scalars['Int']['output'];
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
};

/**
 * This paragraph is used for displaying a range of materials. The materials can be
 * chosen by manually searching for available materials.
 */
export type ParagraphGoMaterialSliderManual = ParagraphInterface & {
  __typename?: 'ParagraphGoMaterialSliderManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /**
   * Here you can choose which materials to display. If you need to link to a
   * specific type, select it from the dropdown and the system will display that,
   * if it is available.<br />Example work ID: work-of:870970-basis:136336282
   */
  materialSliderWorkIds: Array<WorkId>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
};

/**
 * This GO-specific text field uses CKEditor 5 with the GO Text Body format,
 * supporting structured content with headings (H2, H3), bold, italic, underline,
 * lists, and advanced link features like target attributes and Linkit integration.
 */
export type ParagraphGoTextBody = ParagraphInterface & {
  __typename?: 'ParagraphGoTextBody';
  /** Body */
  body: Text;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Enter the URL for the video you want to include. */
export type ParagraphGoVideo = ParagraphInterface & {
  __typename?: 'ParagraphGoVideo';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Embed video */
  embedVideo: MediaUnion;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
};

/**
 * This paragraph is used for displaying a VideoTool video and display a set of
 * related books. The related books is automatically chosen based on a CQL search
 */
export type ParagraphGoVideoBundleAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphGoVideoBundleAutomatic';
  /**
   * This field is for inserting a CQL string based on a search. <br /><br />Please
   * be aware, that it is necessary to copy the exact CQL string, including the
   * quotations. i.e: ( 'harry potter')<br /><br />A valid CQL search string can be
   * generated, by performing a query through the advanced search, and copying the
   * CQL string from there.
   */
  cqlSearch?: Maybe<CqlSearch>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Embed video */
  embedVideo: MediaUnion;
  /** Title */
  goVideoTitle: Scalars['String']['output'];
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** The amount of related materials that should be shown. */
  videoAmountOfMaterials: Scalars['Int']['output'];
};

/**
 * This paragraph is used for displaying a VideoTool video and display a set of
 * related or recommended materials. The materials can be selected manually.
 */
export type ParagraphGoVideoBundleManual = ParagraphInterface & {
  __typename?: 'ParagraphGoVideoBundleManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Embed video */
  embedVideo: MediaUnion;
  /** Title */
  goVideoTitle: Scalars['String']['output'];
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /**
   * Here you can choose which materials to display. If you need to link to a
   * specific type, select it from the dropdown and the system will display that,
   * if it is available.<br />Example work ID: work-of:870970-basis:136336282
   */
  videoBundleWorkIds?: Maybe<Array<WorkId>>;
};

/** A hero section with an image, informative text, category, and a "call to action" link. */
export type ParagraphHero = ParagraphInterface & {
  __typename?: 'ParagraphHero';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Hero categories */
  heroCategories?: Maybe<TermUnion>;
  /** Hero content type */
  heroContentType?: Maybe<Scalars['String']['output']>;
  /** Hero date */
  heroDate?: Maybe<DateTime>;
  /** Hero description */
  heroDescription?: Maybe<Text>;
  /** Hero image */
  heroImage?: Maybe<MediaUnion>;
  /** Hero link */
  heroLink?: Maybe<Link>;
  /** Hero title */
  heroTitle: Scalars['String']['output'];
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphInterface = {
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Enables website visitors to choose their preferred language. */
export type ParagraphLanguageSelector = ParagraphInterface & {
  __typename?: 'ParagraphLanguageSelector';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Language icon */
  languageIcon: Image;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Links with icons. Designed for internal/external links and links to search results.  */
export type ParagraphLinks = ParagraphInterface & {
  __typename?: 'ParagraphLinks';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Link */
  link: Array<Link>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** This paragraph will show a list of events that are manually selected. */
export type ParagraphManualEventList = ParagraphInterface & {
  __typename?: 'ParagraphManualEventList';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Events */
  events?: Maybe<Array<UnsupportedType>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title?: Maybe<Scalars['String']['output']>;
};

/** A grid representation of recommended materials, based on a CQL string and filters. */
export type ParagraphMaterialGridAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphMaterialGridAutomatic';
  /** @deprecated Use materialAmount instead */
  amountOfMaterials: Scalars['Int']['output'];
  /**
   * This field is for inserting a CQL string based on a search. <br /><br />Please
   * be aware, that it is necessary to copy the exact CQL string, including the
   * quotations. i.e: ( 'harry potter')<br /><br />A valid CQL search string can be
   * generated, by performing a query through the advanced search, and copying the
   * CQL string from there.
   */
  cqlSearch?: Maybe<CqlSearch>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Amount of materials */
  materialAmount: Scalars['Int']['output'];
  /** This is the optional description for the material grid. <br />Leave blank if you do not want a description. */
  materialGridDescription?: Maybe<Scalars['String']['output']>;
  /** The title for the material grid. Leave this blank if you do not want a title.  */
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** A grid representation of recommended materials, based on a link search string.  */
export type ParagraphMaterialGridLinkAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphMaterialGridLinkAutomatic';
  /** @deprecated Use materialAmount instead */
  amountOfMaterials: Scalars['Int']['output'];
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Amount of materials */
  materialAmount: Scalars['Int']['output'];
  /** This is the optional description for the material grid. <br />Leave blank if you do not want a description. */
  materialGridDescription?: Maybe<Scalars['String']['output']>;
  /**
   * This field is for inserting a link string based on a search, e.g.:
   * /><br />Please be aware that it is necessary to copy the exact link string.<br
   * /><br />A valid link search string can be generated, by performing a query
   * through the advanced search and copying the link string from there.
   */
  materialGridLink: Scalars['String']['output'];
  /** The title for the material grid. Leave this blank if you do not want a title.  */
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** A grid displaying a list of recommended materials selected manually. */
export type ParagraphMaterialGridManual = ParagraphInterface & {
  __typename?: 'ParagraphMaterialGridManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** This is the optional description for the material grid. <br />Leave blank if you do not want a description. */
  materialGridDescription?: Maybe<Scalars['String']['output']>;
  /** The title for the material grid. Leave this blank if you do not want a title.  */
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  /**
   * Example work ID: work-of:870970-basis:136336282.<br /><br />If you need to
   * link to a specific type, select it from the dropdown and the system will
   * display that, if it is available. <strong>Supports a maximum of 32
   * items.</strong>
   */
  materialGridWorkIds?: Maybe<Array<WorkId>>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** This field will be deleted in the future. Please use another work id field. */
  workId?: Maybe<Array<WorkId>>;
};

/** Entity type paragraph. */
export type ParagraphMedias = ParagraphInterface & {
  __typename?: 'ParagraphMedias';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Medias */
  medias: Array<MediaUnion>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphNavGridManual = ParagraphInterface & {
  __typename?: 'ParagraphNavGridManual';
  contentReferenceUuids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Contents */
  contentReferences?: Maybe<Array<ParagraphNavGridManualContentReferencesUnion>>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Show subtitles */
  showSubtitles?: Maybe<Scalars['Boolean']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Title */
  title?: Maybe<Scalars['String']['output']>;
};

/** Contents */
export type ParagraphNavGridManualContentReferencesUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

/** Entity type paragraph. */
export type ParagraphNavSpotsManual = ParagraphInterface & {
  __typename?: 'ParagraphNavSpotsManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Content */
  navSpotsContent?: Maybe<Array<ParagraphNavSpotsManualNavSpotsContentUnion>>;
  navSpotsContentUuids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Content */
export type ParagraphNavSpotsManualNavSpotsContentUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

/**
 * This is a paragraph for displaying the opening hours for the branch it is applied to.
 *
 * Opening hours are created under the settings of a branch.
 */
export type ParagraphOpeningHours = ParagraphInterface & {
  __typename?: 'ParagraphOpeningHours';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** This paragraph is used to recommend a material.  */
export type ParagraphRecommendation = ParagraphInterface & {
  __typename?: 'ParagraphRecommendation';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /**
   * This determines whether the image should be positioned to the left or right.
   * <br />If left untoggled (default behaviour) the image is positioned to the
   * left, if toggled on, the image will be positioned to the right.
   */
  imagePositionRight?: Maybe<Scalars['Boolean']['output']>;
  /** The paragraphs entity language code. */
  langcode: Language;
  /**
   * This is the description for a recommendation. <br /><br />If you add a
   * description, the title of the the material will not be automatically
   */
  recommendationDescription?: Maybe<Scalars['String']['output']>;
  /**
   * The title of the recommended material.<br /><br />If you add a title, the
   * description for the material will not be automatically generated.
   */
  recommendationTitle?: Maybe<Text>;
  /**
   * This is the work ID used to retrieve the material information. Example:
   * work-of:870970-basis:136336282.<br />Currently this is retrieved by performing
   * a search for a material manually, and copying this value from the URL.<br />If
   * you need to link to a specific type, select it from the dropdown and the
   * system will display that, if it is available.
   */
  recommendationWorkId?: Maybe<WorkId>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** This is paragraph that will display links without icons.  */
export type ParagraphSimpleLinks = ParagraphInterface & {
  __typename?: 'ParagraphSimpleLinks';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Link */
  link: Array<Link>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** A basic, formatted body of text. */
export type ParagraphTextBody = ParagraphInterface & {
  __typename?: 'ParagraphTextBody';
  /** Body */
  body: Text;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphUnion = ParagraphAccordion | ParagraphBanner | ParagraphBreadcrumbChildren | ParagraphCampaignRule | ParagraphCardGridAutomatic | ParagraphCardGridManual | ParagraphContentSlider | ParagraphContentSliderAutomatic | ParagraphEventTicketCategory | ParagraphFiles | ParagraphFilteredEventList | ParagraphGoImages | ParagraphGoLink | ParagraphGoLinkbox | ParagraphGoMaterialSliderAutomatic | ParagraphGoMaterialSliderManual | ParagraphGoTextBody | ParagraphGoVideo | ParagraphGoVideoBundleAutomatic | ParagraphGoVideoBundleManual | ParagraphHero | ParagraphLanguageSelector | ParagraphLinks | ParagraphManualEventList | ParagraphMaterialGridAutomatic | ParagraphMaterialGridLinkAutomatic | ParagraphMaterialGridManual | ParagraphMedias | ParagraphNavGridManual | ParagraphNavSpotsManual | ParagraphOpeningHours | ParagraphRecommendation | ParagraphSimpleLinks | ParagraphTextBody | ParagraphUserRegistrationItem | ParagraphUserRegistrationLinklist | ParagraphUserRegistrationSection | ParagraphVideo | ParagraphWebform;

/** The "User registration item" paragraph type is used to display relevant information about the user registration process. */
export type ParagraphUserRegistrationItem = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationItem';
  /** Anchor */
  anchor?: Maybe<Scalars['String']['output']>;
  /** Body */
  body: Text;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Enable this option to display a button at the top of the page for easier navigation. */
  displayInNavigation?: Maybe<Scalars['Boolean']['output']>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Specify how a linked document should be opened when clicked by a user. */
  linkTarget: Scalars['String']['output'];
  /** If the navigation button title is left blank, it will automatically default to the paragraph title. */
  navigationTitle?: Maybe<Scalars['String']['output']>;
  /** Registration Link */
  registrationLink?: Maybe<Link>;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/**
 * This paragraph determines the placement of shortcuts to individual User
 * Registration Section paragraphs. It allows administrators to specify where these
 * shortcuts should appear.
 */
export type ParagraphUserRegistrationLinklist = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationLinklist';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** The "User registration section" paragraph type is used to display "User registration item" paragraphs. */
export type ParagraphUserRegistrationSection = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationSection';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Enter the URL for the video you want to include. */
export type ParagraphVideo = ParagraphInterface & {
  __typename?: 'ParagraphVideo';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Embed video */
  embedVideo: MediaUnion;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** Paragraph used for embedding a webform. */
export type ParagraphWebform = ParagraphInterface & {
  __typename?: 'ParagraphWebform';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Published */
  status: Scalars['Boolean']['output'];
};

/** The schema's entry-point for queries. */
export type Query = { go: { cacheTags: string[] } } & {
  __typename?: 'Query';
  dplTokens?: Maybe<DplTokens>;
  /** Query for view go_categories display go_categories. */
  goCategories?: Maybe<GoCategoriesResult>;
  goConfiguration?: Maybe<GoConfiguration>;
  /** Schema information. */
  info: SchemaInformation;
  /** Load a Node entity by id. */
  node?: Maybe<NodeUnion>;
  /** Load a Paragraph entity by id. */
  paragraph?: Maybe<ParagraphUnion>;
  /** Load a content preview. */
  preview?: Maybe<NodeUnion>;
  /** Load a Route by path. */
  route?: Maybe<RouteUnion>;
};


/** The schema's entry-point for queries. */
export type QueryGoCategoriesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
};


/** The schema's entry-point for queries. */
export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
  langcode?: InputMaybe<Scalars['String']['input']>;
  revision?: InputMaybe<Scalars['ID']['input']>;
};


/** The schema's entry-point for queries. */
export type QueryParagraphArgs = {
  id: Scalars['ID']['input'];
  langcode?: InputMaybe<Scalars['String']['input']>;
  revision?: InputMaybe<Scalars['ID']['input']>;
};


/** The schema's entry-point for queries. */
export type QueryPreviewArgs = {
  id: Scalars['ID']['input'];
  langcode?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};


/** The schema's entry-point for queries. */
export type QueryRouteArgs = {
  langcode?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  revision?: InputMaybe<Scalars['ID']['input']>;
};

/** Routes represent incoming requests that resolve to content. */
export type Route = {
  /** Whether this route is internal or external. */
  internal: Scalars['Boolean']['output'];
  /** URL of this route. */
  url: Scalars['String']['output'];
};

/** A list of possible entities that can be returned by URL. */
export type RouteEntityUnion = NodeGoArticle | NodeGoCategory | NodeGoPage | NodePage;

/** Route outside of this website. */
export type RouteExternal = Route & {
  __typename?: 'RouteExternal';
  /** Whether this route is internal or external. */
  internal: Scalars['Boolean']['output'];
  /** URL of this route. */
  url: Scalars['String']['output'];
};

/** Route within this website. */
export type RouteInternal = Route & {
  __typename?: 'RouteInternal';
  /** Breadcrumb links for this route. */
  breadcrumbs?: Maybe<Array<Link>>;
  /** Content assigned to this route. */
  entity?: Maybe<RouteEntityUnion>;
  /** Whether this route is internal or external. */
  internal: Scalars['Boolean']['output'];
  /** URL of this route. */
  url: Scalars['String']['output'];
};

/** Redirect to another URL with status. */
export type RouteRedirect = Route & {
  __typename?: 'RouteRedirect';
  /** Whether this route is internal or external. */
  internal: Scalars['Boolean']['output'];
  /** Utility prop. Always true for redirects. */
  redirect: Scalars['Boolean']['output'];
  /** Suggested status for redirect. Eg 301. */
  status: Scalars['Int']['output'];
  /** URL of this route. */
  url: Scalars['String']['output'];
};

/** Route types that can exist in the system. */
export type RouteUnion = RouteExternal | RouteInternal | RouteRedirect;

/** Schema information provided by the system. */
export type SchemaInformation = {
  __typename?: 'SchemaInformation';
  /** The schema description. */
  description?: Maybe<Scalars['String']['output']>;
  /** The internal path to the front page. */
  home?: Maybe<Scalars['String']['output']>;
  /** List of languages available. */
  languages: Array<Language>;
  /** The site name. */
  name?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  /** The schema version. */
  version?: Maybe<Scalars['String']['output']>;
};

/** Various FBI profiles configured by the local library. */
export type SearchProfiles = {
  __typename?: 'SearchProfiles';
  /**
   * This is meant to be a fallback profile if no other profile is specified.
   * But is not being used in the current implementation.
   */
  default?: Maybe<Scalars['String']['output']>;
  /** This is the profile is using materials from other libraries as well. */
  global?: Maybe<Scalars['String']['output']>;
  /** This is the profile used for searching works in the library's catalog. */
  local?: Maybe<Scalars['String']['output']>;
};

/** Sort direction. */
export type SortDirection =
  /** Stigende */
  | 'ASC'
  /** Faldende */
  | 'DESC';

/** The schema's entry-point for subscriptions. */
export type Subscription = {
  __typename?: 'Subscription';
  /** Placeholder for subscription extension. */
  _: Scalars['Boolean']['output'];
};

/** Entity type taxonomy_term. */
export type TermBreadcrumbStructure = TermInterface & {
  __typename?: 'TermBreadcrumbStructure';
  /** Datoen hvor termen senest blev redigeret. */
  changed: DateTime;
  /** The title that is shown above the list of referenced content. Will not be shown, if there are no children displayed. */
  childrenTitle?: Maybe<Scalars['String']['output']>;
  /** Content */
  content: NodeUnion;
  /** Beskrivelse */
  description: Text;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Should a list of contents that reference this breadcrumb, be shown automatically on this page? */
  showChildren?: Maybe<Scalars['Boolean']['output']>;
  /** If this is checked, the children teasers will be expanded with possible subtitle descriptions. */
  showChildrenSubtitles?: Maybe<Scalars['Boolean']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** Entity type taxonomy_term. */
export type TermCategories = TermInterface & {
  __typename?: 'TermCategories';
  /** Datoen hvor termen senest blev redigeret. */
  changed: DateTime;
  /** Beskrivelse */
  description: Text;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** Entity type taxonomy_term. */
export type TermInterface = {
  /** Datoen hvor termen senest blev redigeret. */
  changed: DateTime;
  /** Beskrivelse */
  description: Text;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** Kategorier af åbningstider, f.eks. "Åbent" eller "Telefontid" */
export type TermOpeningHoursCategories = TermInterface & {
  __typename?: 'TermOpeningHoursCategories';
  /** Datoen hvor termen senest blev redigeret. */
  changed: DateTime;
  /** Beskrivelse */
  description: Text;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** Screens to display content on */
export type TermScreenName = TermInterface & {
  __typename?: 'TermScreenName';
  /** Datoen hvor termen senest blev redigeret. */
  changed: DateTime;
  /** Beskrivelse */
  description: Text;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** Entity type taxonomy_term. */
export type TermTags = TermInterface & {
  __typename?: 'TermTags';
  /** Datoen hvor termen senest blev redigeret. */
  changed: DateTime;
  /** Beskrivelse */
  description: Text;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** Entity type taxonomy_term. */
export type TermUnion = TermBreadcrumbStructure | TermCategories | TermOpeningHoursCategories | TermScreenName | TermTags | TermWebformEmailCategories;

/** List of email categories used for sending webform submissions. Each category is associated with an email address. */
export type TermWebformEmailCategories = TermInterface & {
  __typename?: 'TermWebformEmailCategories';
  /** Datoen hvor termen senest blev redigeret. */
  changed: DateTime;
  /** Beskrivelse */
  description: Text;
  /** Add which email to send form submissions of this category to. */
  email: Scalars['Email']['output'];
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Name */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Published */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** A processed text format defined by the CMS. */
export type Text = {
  __typename?: 'Text';
  /** The text format used to process the text value. */
  format?: Maybe<Scalars['String']['output']>;
  /** The processed text value. */
  processed?: Maybe<Scalars['Html']['output']>;
  /** The raw text value. */
  value?: Maybe<Scalars['String']['output']>;
};

/** A processed text format with summary defined by the CMS. */
export type TextSummary = {
  __typename?: 'TextSummary';
  /** The text format used to process the text value. */
  format?: Maybe<Scalars['String']['output']>;
  /** The processed text value. */
  processed?: Maybe<Scalars['Html']['output']>;
  /** The processed text summary. */
  summary?: Maybe<Scalars['Html']['output']>;
  /** The raw text value. */
  value?: Maybe<Scalars['String']['output']>;
};

/** Available translations for content. */
export type Translation = {
  __typename?: 'Translation';
  /** The language of the translation. */
  langcode: Language;
  /** The path to the translated content. */
  path?: Maybe<Scalars['String']['output']>;
  /** The title of the translation. */
  title?: Maybe<Scalars['String']['output']>;
};

export type UniloginConfigurationPrivate = {
  __typename?: 'UniloginConfigurationPrivate';
  clientSecret?: Maybe<Scalars['String']['output']>;
  pubHubRetailerKeyCode?: Maybe<Scalars['String']['output']>;
  webServicePassword?: Maybe<Scalars['String']['output']>;
  webServiceUsername?: Maybe<Scalars['String']['output']>;
};

export type UniloginConfigurationPublic = {
  __typename?: 'UniloginConfigurationPublic';
  municipalityId?: Maybe<Scalars['String']['output']>;
};

/**
 * Unsupported entity or field type in the schema.
 * This entity may not have been enabled in the schema yet and is being referenced via entity reference.
 */
export type UnsupportedType = {
  __typename?: 'UnsupportedType';
  /** Unsupported type, always TRUE. */
  unsupported?: Maybe<Scalars['Boolean']['output']>;
};

/** Views represent collections of curated data from the CMS. */
export type View = {
  /** Viewets beskrivelse. */
  description?: Maybe<Scalars['String']['output']>;
  /** The machine name of the display. */
  display: Scalars['String']['output'];
  /** The ID of the view. */
  id: Scalars['ID']['output'];
  /** The human friendly label of the view. */
  label?: Maybe<Scalars['String']['output']>;
  /** The language code of the view. */
  langcode?: Maybe<Scalars['String']['output']>;
  /** Information about the page in the view. */
  pageInfo: ViewPageInfo;
  /** The machine name of the view. */
  view: Scalars['String']['output'];
};

/** An exposed filter option for the view. */
export type ViewFilter = {
  __typename?: 'ViewFilter';
  /** The filter element attributes. */
  attributes: Scalars['UntypedStructuredData']['output'];
  /** The filter element description. */
  description?: Maybe<Scalars['String']['output']>;
  /** The filter identifier. */
  id: Scalars['ID']['output'];
  /** The filter element label. */
  label?: Maybe<Scalars['String']['output']>;
  /** Whether the filter allows multiple values. */
  multiple: Scalars['Boolean']['output'];
  /** The filter operator. */
  operator: Scalars['String']['output'];
  /** The filter element options if any are defined. */
  options?: Maybe<Scalars['UntypedStructuredData']['output']>;
  /** The filter plugin type. */
  plugin: Scalars['String']['output'];
  /** Whether the filter is required. */
  required: Scalars['Boolean']['output'];
  /** The filter element type. */
  type: Scalars['String']['output'];
  /** The value for the filter. Could be an array for multiple values. */
  value?: Maybe<Scalars['UntypedStructuredData']['output']>;
};

/** Information about the page in a view. */
export type ViewPageInfo = {
  __typename?: 'ViewPageInfo';
  /** Any result offset being used. */
  offset: Scalars['Int']['output'];
  /** The current page being returned. */
  page: Scalars['Int']['output'];
  /** How many results per page. */
  pageSize: Scalars['Int']['output'];
  /** How many results total. */
  total: Scalars['Int']['output'];
};

/** A reference to an embedded view */
export type ViewReference = {
  __typename?: 'ViewReference';
  /** The contextual filter values used. */
  contextualFilter?: Maybe<Array<Scalars['String']['output']>>;
  /** The machine name of the display. */
  display: Scalars['String']['output'];
  /** How many results per page. */
  pageSize?: Maybe<Scalars['Int']['output']>;
  /** The name of the query used to fetch the data, if the view is a GraphQL display. */
  query?: Maybe<Scalars['String']['output']>;
  /** The machine name of the view. */
  view: Scalars['String']['output'];
};

/** All available view result types. */
export type ViewResultUnion = GoCategoriesResult;

/** Et WorkID-felt. */
export type WorkId = {
  __typename?: 'WorkId';
  /** Materialetype (fx bog, film, lydbog) */
  material_type?: Maybe<Scalars['String']['output']>;
  /** Værk-ID */
  work_id?: Maybe<Scalars['String']['output']>;
};

export type ImageFragmentFragment = { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } };

export type MediaVideotoolFragmentFragment = { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string };

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
      > }
    | { __typename?: 'ParagraphGoLink' }
    | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
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
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
       }
    | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
       }
    | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
      > }
    | { __typename?: 'ParagraphGoLink' }
    | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
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
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
       }
    | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
       }
    | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
      > }
    | { __typename?: 'ParagraphGoLink' }
    | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool' }
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
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
       }
    | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
       }
    | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
        | { __typename?: 'MediaAudio' }
        | { __typename?: 'MediaDocument' }
        | { __typename?: 'MediaImage' }
        | { __typename?: 'MediaVideo' }
        | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
    | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
   };

export type GoVideoBundleAutomaticFragment = { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage' }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
   };

export type GoVideoBundleManualFragment = { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage' }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
  , videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null };

export type GoMaterialSliderAutomaticFragment = { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null };

export type GoMaterialSliderManualFragment = { __typename: 'ParagraphGoMaterialSliderManual', titleOptional: string, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> };

export type GoLinkboxFragment = { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
    | { __typename?: 'MediaAudio' }
    | { __typename?: 'MediaDocument' }
    | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
    | { __typename?: 'MediaVideo' }
    | { __typename?: 'MediaVideotool' }
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
              > }
            | { __typename?: 'ParagraphGoLink' }
            | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
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
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
               }
            | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
               }
            | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
              > }
            | { __typename?: 'ParagraphGoLink' }
            | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
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
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
               }
            | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
               }
            | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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


export type GetDplCmsPrivateConfigurationQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', private?: { __typename?: 'GoConfigurationPrivate', unilogin?: { __typename?: 'UniloginConfigurationPrivate', clientSecret?: string | null, pubHubRetailerKeyCode?: string | null, webServicePassword?: string | null, webServiceUsername?: string | null } | null } | null } | null };

export type GetDplCmsPublicConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDplCmsPublicConfigurationQuery = { go: { cacheTags: string[] } } & { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', public?: { __typename?: 'GoConfigurationPublic', libraryInfo?: { __typename?: 'GoLibraryInfo', name?: string | null } | null, loginUrls?: { __typename?: 'GoLoginUrls', adgangsplatformen?: string | null } | null, logoutUrls?: { __typename?: 'GoLogoutUrls', adgangsplatformen?: string | null } | null, unilogin?: { __typename?: 'UniloginConfigurationPublic', municipalityId?: string | null } | null } | null } | null };

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
              > }
            | { __typename?: 'ParagraphGoLink' }
            | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool' }
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
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
               }
            | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
               }
            | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
                | { __typename?: 'MediaAudio' }
                | { __typename?: 'MediaDocument' }
                | { __typename?: 'MediaImage' }
                | { __typename?: 'MediaVideo' }
                | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
          > }
        | { __typename?: 'ParagraphGoLink' }
        | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
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
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
           }
        | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
           }
        | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
          > }
        | { __typename?: 'ParagraphGoLink' }
        | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
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
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
           }
        | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
           }
        | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
          > }
        | { __typename?: 'ParagraphGoLink' }
        | { __typename: 'ParagraphGoLinkbox', title: string, goColor?: string | null, goDescription: string, goImage?:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage', name: string, byline?: string | null, mediaImage: { __typename?: 'Image', url: string, alt?: string | null, height: number, width: number, mime?: string | null, size: number, title?: string | null } }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool' }
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
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
           }
        | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch?: { __typename?: 'CQLSearch', value?: string | null } | null, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
           }
        | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo:
            | { __typename?: 'MediaAudio' }
            | { __typename?: 'MediaDocument' }
            | { __typename?: 'MediaImage' }
            | { __typename?: 'MediaVideo' }
            | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }
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
    queryKey: ['getArticleByPathSuspense', variables],
    queryFn: fetcher<GetArticleByPathQuery, GetArticleByPathQueryVariables>(GetArticleByPathDocument, variables),
    ...options
  }
    )};

useSuspenseGetArticleByPathQuery.getKey = (variables: GetArticleByPathQueryVariables) => ['getArticleByPathSuspense', variables];


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
    queryKey: variables === undefined ? ['getCategoriesSuspense'] : ['getCategoriesSuspense', variables],
    queryFn: fetcher<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, variables),
    ...options
  }
    )};

useSuspenseGetCategoriesQuery.getKey = (variables?: GetCategoriesQueryVariables) => variables === undefined ? ['getCategoriesSuspense'] : ['getCategoriesSuspense', variables];


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
    queryKey: ['getCategoryPageByPathSuspense', variables],
    queryFn: fetcher<GetCategoryPageByPathQuery, GetCategoryPageByPathQueryVariables>(GetCategoryPageByPathDocument, variables),
    ...options
  }
    )};

useSuspenseGetCategoryPageByPathQuery.getKey = (variables: GetCategoryPageByPathQueryVariables) => ['getCategoryPageByPathSuspense', variables];


useGetCategoryPageByPathQuery.fetcher = (variables: GetCategoryPageByPathQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetCategoryPageByPathQuery, GetCategoryPageByPathQueryVariables>(GetCategoryPageByPathDocument, variables, options);

export const GetDplCmsPrivateConfigurationDocument = `
    query getDplCmsPrivateConfiguration {
  goConfiguration {
    private {
      unilogin {
        clientSecret
        pubHubRetailerKeyCode
        webServicePassword
        webServiceUsername
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
    queryKey: variables === undefined ? ['getDplCmsPrivateConfigurationSuspense'] : ['getDplCmsPrivateConfigurationSuspense', variables],
    queryFn: fetcher<GetDplCmsPrivateConfigurationQuery, GetDplCmsPrivateConfigurationQueryVariables>(GetDplCmsPrivateConfigurationDocument, variables),
    ...options
  }
    )};

useSuspenseGetDplCmsPrivateConfigurationQuery.getKey = (variables?: GetDplCmsPrivateConfigurationQueryVariables) => variables === undefined ? ['getDplCmsPrivateConfigurationSuspense'] : ['getDplCmsPrivateConfigurationSuspense', variables];


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
    queryKey: variables === undefined ? ['getDplCmsPublicConfigurationSuspense'] : ['getDplCmsPublicConfigurationSuspense', variables],
    queryFn: fetcher<GetDplCmsPublicConfigurationQuery, GetDplCmsPublicConfigurationQueryVariables>(GetDplCmsPublicConfigurationDocument, variables),
    ...options
  }
    )};

useSuspenseGetDplCmsPublicConfigurationQuery.getKey = (variables?: GetDplCmsPublicConfigurationQueryVariables) => variables === undefined ? ['getDplCmsPublicConfigurationSuspense'] : ['getDplCmsPublicConfigurationSuspense', variables];


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
    queryKey: ['getPageByPathSuspense', variables],
    queryFn: fetcher<GetPageByPathQuery, GetPageByPathQueryVariables>(GetPageByPathDocument, variables),
    ...options
  }
    )};

useSuspenseGetPageByPathQuery.getKey = (variables: GetPageByPathQueryVariables) => ['getPageByPathSuspense', variables];


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
    queryKey: ['getPreviewPageByIddSuspense', variables],
    queryFn: fetcher<GetPreviewPageByIddQuery, GetPreviewPageByIddQueryVariables>(GetPreviewPageByIddDocument, variables),
    ...options
  }
    )};

useSuspenseGetPreviewPageByIddQuery.getKey = (variables: GetPreviewPageByIddQueryVariables) => ['getPreviewPageByIddSuspense', variables];


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
    queryKey: variables === undefined ? ['getAdgangsplatformenLibraryTokenSuspense'] : ['getAdgangsplatformenLibraryTokenSuspense', variables],
    queryFn: fetcher<GetAdgangsplatformenLibraryTokenQuery, GetAdgangsplatformenLibraryTokenQueryVariables>(GetAdgangsplatformenLibraryTokenDocument, variables),
    ...options
  }
    )};

useSuspenseGetAdgangsplatformenLibraryTokenQuery.getKey = (variables?: GetAdgangsplatformenLibraryTokenQueryVariables) => variables === undefined ? ['getAdgangsplatformenLibraryTokenSuspense'] : ['getAdgangsplatformenLibraryTokenSuspense', variables];


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
    queryKey: variables === undefined ? ['getAdgangsplatformenUserTokenSuspense'] : ['getAdgangsplatformenUserTokenSuspense', variables],
    queryFn: fetcher<GetAdgangsplatformenUserTokenQuery, GetAdgangsplatformenUserTokenQueryVariables>(GetAdgangsplatformenUserTokenDocument, variables),
    ...options
  }
    )};

useSuspenseGetAdgangsplatformenUserTokenQuery.getKey = (variables?: GetAdgangsplatformenUserTokenQueryVariables) => variables === undefined ? ['getAdgangsplatformenUserTokenSuspense'] : ['getAdgangsplatformenUserTokenSuspense', variables];


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
    queryKey: variables === undefined ? ['getLoginUrlsSuspense'] : ['getLoginUrlsSuspense', variables],
    queryFn: fetcher<GetLoginUrlsQuery, GetLoginUrlsQueryVariables>(GetLoginUrlsDocument, variables),
    ...options
  }
    )};

useSuspenseGetLoginUrlsQuery.getKey = (variables?: GetLoginUrlsQueryVariables) => variables === undefined ? ['getLoginUrlsSuspense'] : ['getLoginUrlsSuspense', variables];


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
    queryKey: variables === undefined ? ['getLogoutUrlsSuspense'] : ['getLogoutUrlsSuspense', variables],
    queryFn: fetcher<GetLogoutUrlsQuery, GetLogoutUrlsQueryVariables>(GetLogoutUrlsDocument, variables),
    ...options
  }
    )};

useSuspenseGetLogoutUrlsQuery.getKey = (variables?: GetLogoutUrlsQueryVariables) => variables === undefined ? ['getLogoutUrlsSuspense'] : ['getLogoutUrlsSuspense', variables];


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
    nodeGoPage: 'nodeGoPage',
    nodeGoArticle: 'nodeGoArticle',
    nodeGoCategory: 'nodeGoCategory',
    goVideo: 'goVideo',
    goVideoBundleAutomatic: 'goVideoBundleAutomatic',
    goVideoBundleManual: 'goVideoBundleManual',
    goMaterialSliderAutomatic: 'goMaterialSliderAutomatic',
    goMaterialSliderManual: 'goMaterialSliderManual',
    goLinkbox: 'goLinkbox',
    goTextBody: 'goTextBody',
    goImages: 'goImages',
    routeRedirect: 'routeRedirect'
  }
}