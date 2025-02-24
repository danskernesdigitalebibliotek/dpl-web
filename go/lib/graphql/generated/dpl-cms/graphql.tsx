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
  token?: Maybe<Scalars['String']['output']>;
};

export type AdgangsplatformenTokens = {
  __typename?: 'AdgangsplatformenTokens';
  library?: Maybe<AdgangsplatformenLibraryToken>;
  user?: Maybe<AdgangsplatformenUserToken>;
};

export type AdgangsplatformenUserToken = {
  __typename?: 'AdgangsplatformenUserToken';
  expire?: Maybe<Scalars['Int']['output']>;
  token?: Maybe<Scalars['String']['output']>;
};

/** A CQL search string. */
export type CqlSearch = {
  __typename?: 'CQLSearch';
  /** The CQL search string. */
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

/** DPL Configuration. */
export type DplConfiguration = {
  __typename?: 'DplConfiguration';
  unilogin?: Maybe<UniloginConfiguration>;
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

export type GoConfiguration = {
  __typename?: 'GoConfiguration';
  loginUrls?: Maybe<GoLoginUrls>;
  logoutUrls?: Maybe<GoLogoutUrls>;
  unilogin?: Maybe<UniloginConfiguration>;
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
  /** Sprogets navn. */
  name?: Maybe<Scalars['String']['output']>;
};

/** A link. */
export type Link = {
  __typename?: 'Link';
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
  /** Sprog */
  langcode: Language;
  /** Audio file */
  mediaAudioFile: File;
  /** Navn */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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
  /** Sprog */
  langcode: Language;
  /** Fil */
  mediaFile: File;
  /** Navn */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Entity type media. */
export type MediaImage = MediaInterface & {
  __typename?: 'MediaImage';
  /** Bruges til fotokreditering og info om copyright. Vises som regel ved siden af billedet. */
  byline?: Maybe<Scalars['String']['output']>;
  /** The time the media item was last edited. */
  changed: DateTime;
  /** The time the media item was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Sprog */
  langcode: Language;
  /**
   * Du kan indstille et fokuspunkt ved at klikke på forhåndsvisningen af
   * billedet og flytte det hvide mål.<br /><br />Ved at indstille et fokuspunkt
   * fortæller du systemet, hvilken del af billedet der skal være i fokus, når
   * det beskæres.<br /><br />Brug funktionen "forhåndsvisning" til at se,
   * hvordan dit billede vil blive beskåret på tværs af billedstil.
   */
  mediaImage: Image;
  /** Navn */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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
  /** Sprog */
  langcode: Language;
  /** Navn */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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
  /** Sprog */
  langcode: Language;
  /** URL til video */
  mediaOembedVideo: Scalars['String']['output'];
  /** Navn */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
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
  /** Sprog */
  langcode: Language;
  /** VideoTool URL */
  mediaVideotool: Scalars['String']['output'];
  /** Navn */
  name: Scalars['String']['output'];
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** The schema's entry-point for mutations. */
export type Mutation = {
  __typename?: 'Mutation';
  /** Placeholder for mutation extension. */
  _: Scalars['Boolean']['output'];
};

/** Brug artikler til nyhedspræget indhold med en begrænset levetid. */
export type NodeArticle = NodeInterface & {
  __typename?: 'NodeArticle';
  /** Bibliotek */
  branch?: Maybe<NodeUnion>;
  /**
   * Oplys en canonical URL hvis indholdet i artiklen er kopieret fra en anden
   * hjemmeside (fx kopieret fra et andet biblioteks hjemmeside). Dette hjælper
   * med at signalere til søgemaskiner at kilden til indholdet er den
   * specificerede side, og sikrer at den originale kilde krediteres.
   */
  canonicalUrl?: Maybe<Link>;
  /** Kategorier */
  categories?: Maybe<TermUnion>;
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Sprog */
  langcode: Language;
  /** Overskriv forfatter */
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
   * Som standard er forfatteren sat til den Drupal-bruger, der ejer indholdet.<br
   * /><br />Hvis du ønsker at tilsidesætte dette med din egen tekst, kan du
   */
  showOverrideAuthor?: Maybe<Scalars['Boolean']['output']>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Manchet */
  subtitle?: Maybe<Scalars['String']['output']>;
  /** Tags */
  tags?: Maybe<Array<TermUnion>>;
  /**
   * Teaserfelterne bruges til cards som blikfang for indholdet. Hvis der ikke er
   * valgt et teaserbillede, vil teksten vises i stedet.
   */
  teaserImage?: Maybe<MediaUnion>;
  /** Teasertekst */
  teaserText?: Maybe<Scalars['String']['output']>;
  /** Titel */
  title: Scalars['String']['output'];
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
  /** Sprog */
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
  /** Publiceret */
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
  /** Titel */
  title: Scalars['String']['output'];
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
  /** Sprog */
  langcode: Language;
  /** Paragraphs */
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publication date */
  publicationDate: DateTime;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Titel */
  title: Scalars['String']['output'];
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
  /** Sprog */
  langcode: Language;
  /** Paragraphs */
  paragraphs?: Maybe<Array<ParagraphUnion>>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publication date */
  publicationDate: DateTime;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Titel */
  title: Scalars['String']['output'];
};

/** Entity type node. */
export type NodeInterface = {
  /** Tidspunktet hvor indholdselementet sidst blev redigeret. */
  changed: DateTime;
  /** The date and time that the content was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Sprog */
  langcode: Language;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Forfremmet til forside */
  promote: Scalars['Boolean']['output'];
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Klæbrig */
  sticky: Scalars['Boolean']['output'];
  /** Titel */
  title: Scalars['String']['output'];
};

/** Entity type node. */
export type NodeUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage;

/** Entity type paragraph. */
export type ParagraphAccordion = ParagraphInterface & {
  __typename?: 'ParagraphAccordion';
  /** Accordion beskrivelse */
  accordionDescription?: Maybe<Text>;
  /** Accordion titel */
  accordionTitle: Text;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Underlined title */
  underlinedTitle?: Maybe<Text>;
};

/** Vis automatisk alt indhold, som refererer til dit valgte brødkrumme element. */
export type ParagraphBreadcrumbChildren = ParagraphInterface & {
  __typename?: 'ParagraphBreadcrumbChildren';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** En regel til at vælge en matchende kampagne */
export type ParagraphCampaignRule = ParagraphInterface & {
  __typename?: 'ParagraphCampaignRule';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphCardGridAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphCardGridAutomatic';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** If nothing is selected, all will be chosen. */
  filterBranches?: Maybe<Array<NodeUnion>>;
  /** Filter efter kategorier */
  filterCategories?: Maybe<Array<TermUnion>>;
  /** Condition type */
  filterCondType: Scalars['String']['output'];
  /** If nothing is selected, all will be chosen. */
  filterContentTypes?: Maybe<Array<Scalars['String']['output']>>;
  /** Filter efter tags */
  filterTags?: Maybe<Array<TermUnion>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** More link */
  moreLink?: Maybe<Link>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Titel */
  title?: Maybe<Scalars['String']['output']>;
};

/** Entity type paragraph. */
export type ParagraphCardGridManual = ParagraphInterface & {
  __typename?: 'ParagraphCardGridManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Indhold */
  gridContent?: Maybe<Array<ParagraphCardGridManualGridContentUnion>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** More link */
  moreLink?: Maybe<Link>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Overskrift */
  title?: Maybe<Scalars['String']['output']>;
};

/** Indhold */
export type ParagraphCardGridManualGridContentUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage;

/** Entity type paragraph. */
export type ParagraphContentSlider = ParagraphInterface & {
  __typename?: 'ParagraphContentSlider';
  /** Indhold */
  contentReferences?: Maybe<Array<ParagraphContentSliderContentReferencesUnion>>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** deprecated */
  title?: Maybe<Scalars['String']['output']>;
  /** Title */
  underlinedTitle?: Maybe<Text>;
};

/** Indhold */
export type ParagraphContentSliderContentReferencesUnion = NodeArticle | NodeGoArticle | NodeGoCategory | NodeGoPage;

/** En kombination af navn på billetkategori og pris på et arrangement.  */
export type ParagraphEventTicketCategory = ParagraphInterface & {
  __typename?: 'ParagraphEventTicketCategory';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Link med ikoner. Designet til jpg, jpeg, png, pdf, mp3, mov, mp4, og mpeg filer */
export type ParagraphFiles = ParagraphInterface & {
  __typename?: 'ParagraphFiles';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Denne paragraph viser en liste af arrangementer filtreret på kategori, tags og filialer. */
export type ParagraphFilteredEventList = ParagraphInterface & {
  __typename?: 'ParagraphFilteredEventList';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Tilføj enhver forgrening, du vil inkludere */
  filterBranches?: Maybe<Array<NodeUnion>>;
  /** Tilføj en kategori, du vil inkludere */
  filterCategories?: Maybe<Array<TermUnion>>;
  /** Condition type */
  filterCondType: Scalars['String']['output'];
  /** Tilføj et tag, du vil inkludere */
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Titel */
  title?: Maybe<Scalars['String']['output']>;
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
  /** Publiceret */
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
  /** Publiceret */
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
  cqlSearch: CqlSearch;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Amount of materials */
  sliderAmountOfMaterials: Scalars['Int']['output'];
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Title */
  title?: Maybe<Scalars['String']['output']>;
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Title */
  title?: Maybe<Scalars['String']['output']>;
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Title */
  title: Scalars['String']['output'];
  /** VideoTool URL. Example: https://media.videotool.dk/?vn=557_2023103014511477700668916683 */
  url?: Maybe<Scalars['String']['output']>;
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
  cqlSearch: CqlSearch;
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** VideoTool URL. Example: https://media.videotool.dk/?vn=557_2023103014511477700668916683 */
  url?: Maybe<Scalars['String']['output']>;
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** VideoTool URL. Example: https://media.videotool.dk/?vn=557_2023103014511477700668916683 */
  url?: Maybe<Scalars['String']['output']>;
  /**
   * Here you can choose which materials to display. If you need to link to a
   * specific type, select it from the dropdown and the system will display that,
   * if it is available.<br />Example work ID: work-of:870970-basis:136336282
   */
  videoBundleWorkIds?: Maybe<Array<WorkId>>;
};

/** En Hero til placering øverst på forsiden med et billede, informativ tekst, kategori og et link til fremhævet indhold. */
export type ParagraphHero = ParagraphInterface & {
  __typename?: 'ParagraphHero';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Giver besøgende på sitet mulighed for at vælge foretrukket sprog */
export type ParagraphLanguageSelector = ParagraphInterface & {
  __typename?: 'ParagraphLanguageSelector';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Links med ikoner. Designet til interne/eksterne links og links til søgeresultater ␣. */
export type ParagraphLinks = ParagraphInterface & {
  __typename?: 'ParagraphLinks';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Dette afsnit vil vise en liste over arrangementer, der er manuelt valgt. */
export type ParagraphManualEventList = ParagraphInterface & {
  __typename?: 'ParagraphManualEventList';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Arrangementer */
  events?: Maybe<Array<UnsupportedType>>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Titel */
  title?: Maybe<Scalars['String']['output']>;
};

/** En visning af fremhævede værker, baseret på en CQL søgestreng. */
export type ParagraphMaterialGridAutomatic = ParagraphInterface & {
  __typename?: 'ParagraphMaterialGridAutomatic';
  /**
   * Bestemmer mængden af materialer, der vil blive vist, baseret på
   * CQL-strengen. <br /><br />Obs: Hvis for eksempel en CQL-streng har 11
   * resultater, og en redaktør vælger 12. Listen vil vise 8 i stedet for 11, da
   * gitteret skal kunne øges med 4.
   */
  amountOfMaterials: Scalars['Int']['output'];
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** This is the optional description for the material grid. <br />Leave blank if you do not want a description. */
  materialGridDescription?: Maybe<Scalars['String']['output']>;
  /** Titel på materialekomponenten. Efterlad dette felt blankt, hvis du ikke vil give den en overskrift. */
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** En komponent som viser en liste af manuelt udvalgte værker. */
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
  /** Titel på materialekomponenten. Efterlad dette felt blankt, hvis du ikke vil give den en overskrift. */
  materialGridTitle?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphNavGridManual = ParagraphInterface & {
  __typename?: 'ParagraphNavGridManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphNavSpotsManual = ParagraphInterface & {
  __typename?: 'ParagraphNavSpotsManual';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Denne paragraph bruges til at anbefale et enkelt materiale. */
export type ParagraphRecommendation = ParagraphInterface & {
  __typename?: 'ParagraphRecommendation';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
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
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** En basal, formateret brødtekst */
export type ParagraphTextBody = ParagraphInterface & {
  __typename?: 'ParagraphTextBody';
  /** Brødtekst */
  body?: Maybe<Text>;
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Entity type paragraph. */
export type ParagraphUnion = ParagraphAccordion | ParagraphBanner | ParagraphBreadcrumbChildren | ParagraphCampaignRule | ParagraphCardGridAutomatic | ParagraphCardGridManual | ParagraphContentSlider | ParagraphContentSliderAutomatic | ParagraphEventTicketCategory | ParagraphFiles | ParagraphFilteredEventList | ParagraphGoLink | ParagraphGoLinkbox | ParagraphGoMaterialSliderAutomatic | ParagraphGoMaterialSliderManual | ParagraphGoVideo | ParagraphGoVideoBundleAutomatic | ParagraphGoVideoBundleManual | ParagraphHero | ParagraphLanguageSelector | ParagraphLinks | ParagraphManualEventList | ParagraphMaterialGridAutomatic | ParagraphMaterialGridManual | ParagraphMedias | ParagraphNavGridManual | ParagraphNavSpotsManual | ParagraphOpeningHours | ParagraphRecommendation | ParagraphSimpleLinks | ParagraphTextBody | ParagraphUserRegistrationItem | ParagraphUserRegistrationLinklist | ParagraphUserRegistrationSection | ParagraphVideo | ParagraphWebform;

/** "Brugerregistreringselement" anvendes til at vise relevant information om brugerregistreringsprocessen. */
export type ParagraphUserRegistrationItem = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationItem';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/**
 * Denne paragraph bestemmer placeringen af genveje til
 * "Brugeregistreingsparagraphs". Paragraphen tillader redaktører at specificere,
 * om disse genveje skal vises.
 */
export type ParagraphUserRegistrationLinklist = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationLinklist';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** "Brugerregistreringsparagraph" bruges til at vise "Brugerregistreringselementer". */
export type ParagraphUserRegistrationSection = ParagraphInterface & {
  __typename?: 'ParagraphUserRegistrationSection';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Indtast URL'en til den video, du vil indlejre. */
export type ParagraphVideo = ParagraphInterface & {
  __typename?: 'ParagraphVideo';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** Indlejr video */
  embedVideo?: Maybe<MediaUnion>;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** Paragraph brugt til indlejring af en webform. */
export type ParagraphWebform = ParagraphInterface & {
  __typename?: 'ParagraphWebform';
  /** The time that the Paragraph was created. */
  created: DateTime;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** The paragraphs entity language code. */
  langcode: Language;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
};

/** The schema's entry-point for queries. */
export type Query = {
  __typename?: 'Query';
  /** DPL Configuration */
  dplConfiguration?: Maybe<DplConfiguration>;
  dplTokens?: Maybe<DplTokens>;
  goConfiguration?: Maybe<GoConfiguration>;
  /** Schema information. */
  info: SchemaInformation;
  /** Load a Node entity by id. */
  node?: Maybe<NodeUnion>;
  /** Load a Route by path. */
  route?: Maybe<RouteUnion>;
};


/** The schema's entry-point for queries. */
export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
  langcode?: InputMaybe<Scalars['String']['input']>;
  revision?: InputMaybe<Scalars['ID']['input']>;
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
export type RouteEntityUnion = NodeGoArticle | NodeGoCategory | NodeGoPage;

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
  /** Titlen, der vises over listen af refereret indhold. Vil ikke blive vist, hvis der ikke vises nogen børn. */
  childrenTitle?: Maybe<Scalars['String']['output']>;
  /** Indhold der linkes til */
  content: NodeUnion;
  /** Beskrivelse */
  description: Text;
  /** The Universally Unique IDentifier (UUID). */
  id: Scalars['ID']['output'];
  /** Term sprogkode. */
  langcode: Language;
  /** Navn */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Vis en automatisk liste med indhold, som refererer til dette brødkrumme element, på denne side. */
  showChildren?: Maybe<Scalars['Boolean']['output']>;
  /** If this is checked, the children teasers will be expanded with possible subtitle descriptions. */
  showChildrenSubtitles?: Maybe<Scalars['Boolean']['output']>;
  /** Publiceret */
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
  /** Navn */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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
  /** Navn */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
  status: Scalars['Boolean']['output'];
  /** Vægten af denne term i forhold til andre termer. */
  weight: Scalars['Int']['output'];
};

/** This is for adding types of opening hours, e.g. "open" or "Telephone time" */
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
  /** Navn */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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
  /** Navn */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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
  /** Navn */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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
  /** Navn */
  name: Scalars['String']['output'];
  /** Denne terms overordnede termer. */
  parent?: Maybe<TermUnion>;
  /** Alternativ URL */
  path?: Maybe<Scalars['String']['output']>;
  /** Publiceret */
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

/** List of DPL-Go Unilogin configuration. */
export type UniloginConfiguration = {
  __typename?: 'UniloginConfiguration';
  unilogin_api_client_id?: Maybe<Scalars['String']['output']>;
  unilogin_api_client_secret?: Maybe<Scalars['String']['output']>;
  unilogin_api_url?: Maybe<Scalars['String']['output']>;
  unilogin_api_wellknown_url?: Maybe<Scalars['String']['output']>;
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

/** A WorkID field. */
export type WorkId = {
  __typename?: 'WorkId';
  /** The material type (e.g., bog, e-bog). */
  material_type?: Maybe<Scalars['String']['output']>;
  /** The WorkID value */
  work_id?: Maybe<Scalars['String']['output']>;
};

export type GetDplCmsConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDplCmsConfigurationQuery = { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', unilogin?: { __typename?: 'UniloginConfiguration', unilogin_api_client_id?: string | null, unilogin_api_client_secret?: string | null, unilogin_api_url?: string | null, unilogin_api_wellknown_url?: string | null } | null } | null };

export type GetPageByPathQueryVariables = Exact<{
  path: Scalars['String']['input'];
}>;


export type GetPageByPathQuery = { __typename?: 'Query', route?: { __typename: 'RouteExternal' } | { __typename: 'RouteInternal', url: string, entity?: { __typename?: 'NodeGoArticle' } | { __typename?: 'NodeGoCategory' } | { __typename?: 'NodeGoPage', paragraphs?: Array<{ __typename?: 'ParagraphAccordion' } | { __typename?: 'ParagraphBanner' } | { __typename?: 'ParagraphBreadcrumbChildren' } | { __typename?: 'ParagraphCampaignRule' } | { __typename?: 'ParagraphCardGridAutomatic' } | { __typename?: 'ParagraphCardGridManual' } | { __typename?: 'ParagraphContentSlider' } | { __typename?: 'ParagraphContentSliderAutomatic' } | { __typename?: 'ParagraphEventTicketCategory' } | { __typename?: 'ParagraphFiles' } | { __typename?: 'ParagraphFilteredEventList' } | { __typename?: 'ParagraphGoLink' } | { __typename?: 'ParagraphGoLinkbox' } | { __typename: 'ParagraphGoMaterialSliderAutomatic', sliderAmountOfMaterials: number, titleOptional?: string | null, cqlSearch: { __typename?: 'CQLSearch', value?: string | null } } | { __typename: 'ParagraphGoMaterialSliderManual', titleOptional?: string | null, materialSliderWorkIds: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> } | { __typename: 'ParagraphGoVideo', id: string, title: string, created: { __typename?: 'DateTime', timestamp: unknown }, embedVideo: { __typename?: 'MediaAudio' } | { __typename?: 'MediaDocument' } | { __typename?: 'MediaImage' } | { __typename?: 'MediaVideo' } | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string } } | { __typename: 'ParagraphGoVideoBundleAutomatic', goVideoTitle: string, videoAmountOfMaterials: number, id: string, cqlSearch: { __typename?: 'CQLSearch', value?: string | null }, embedVideo: { __typename?: 'MediaAudio' } | { __typename?: 'MediaDocument' } | { __typename?: 'MediaImage' } | { __typename?: 'MediaVideo' } | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string } } | { __typename: 'ParagraphGoVideoBundleManual', id: string, goVideoTitle: string, embedVideo: { __typename?: 'MediaAudio' } | { __typename?: 'MediaDocument' } | { __typename?: 'MediaImage' } | { __typename?: 'MediaVideo' } | { __typename?: 'MediaVideotool', id: string, name: string, mediaVideotool: string }, videoBundleWorkIds?: Array<{ __typename?: 'WorkId', material_type?: string | null, work_id?: string | null }> | null } | { __typename?: 'ParagraphHero' } | { __typename?: 'ParagraphLanguageSelector' } | { __typename?: 'ParagraphLinks' } | { __typename?: 'ParagraphManualEventList' } | { __typename?: 'ParagraphMaterialGridAutomatic' } | { __typename?: 'ParagraphMaterialGridManual' } | { __typename?: 'ParagraphMedias' } | { __typename?: 'ParagraphNavGridManual' } | { __typename?: 'ParagraphNavSpotsManual' } | { __typename?: 'ParagraphOpeningHours' } | { __typename?: 'ParagraphRecommendation' } | { __typename?: 'ParagraphSimpleLinks' } | { __typename?: 'ParagraphTextBody' } | { __typename?: 'ParagraphUserRegistrationItem' } | { __typename?: 'ParagraphUserRegistrationLinklist' } | { __typename?: 'ParagraphUserRegistrationSection' } | { __typename?: 'ParagraphVideo' } | { __typename?: 'ParagraphWebform' }> | null } | null } | { __typename: 'RouteRedirect' } | null };

export type GetAdgangsplatformenTokensQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdgangsplatformenTokensQuery = { __typename?: 'Query', dplTokens?: { __typename?: 'DplTokens', adgangsplatformen?: { __typename?: 'AdgangsplatformenTokens', library?: { __typename?: 'AdgangsplatformenLibraryToken', token?: string | null } | null, user?: { __typename?: 'AdgangsplatformenUserToken', expire?: number | null, token?: string | null } | null } | null } | null };

export type GetAdgangsplatformenUserTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdgangsplatformenUserTokenQuery = { __typename?: 'Query', dplTokens?: { __typename?: 'DplTokens', adgangsplatformen?: { __typename?: 'AdgangsplatformenTokens', user?: { __typename?: 'AdgangsplatformenUserToken', expire?: number | null, token?: string | null } | null } | null } | null };

export type GetLoginUrlsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLoginUrlsQuery = { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', loginUrls?: { __typename?: 'GoLoginUrls', adgangsplatformen?: string | null } | null } | null };

export type GetLogoutUrlsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLogoutUrlsQuery = { __typename?: 'Query', goConfiguration?: { __typename?: 'GoConfiguration', logoutUrls?: { __typename?: 'GoLogoutUrls', adgangsplatformen?: string | null } | null } | null };



export const GetDplCmsConfigurationDocument = `
    query getDplCmsConfiguration {
  goConfiguration {
    unilogin {
      unilogin_api_client_id
      unilogin_api_client_secret
      unilogin_api_url
      unilogin_api_wellknown_url
    }
  }
}
    `;

export const useGetDplCmsConfigurationQuery = <
      TData = GetDplCmsConfigurationQuery,
      TError = unknown
    >(
      variables?: GetDplCmsConfigurationQueryVariables,
      options?: Omit<UseQueryOptions<GetDplCmsConfigurationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetDplCmsConfigurationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetDplCmsConfigurationQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getDplCmsConfiguration'] : ['getDplCmsConfiguration', variables],
    queryFn: fetcher<GetDplCmsConfigurationQuery, GetDplCmsConfigurationQueryVariables>(GetDplCmsConfigurationDocument, variables),
    ...options
  }
    )};

useGetDplCmsConfigurationQuery.getKey = (variables?: GetDplCmsConfigurationQueryVariables) => variables === undefined ? ['getDplCmsConfiguration'] : ['getDplCmsConfiguration', variables];

export const useSuspenseGetDplCmsConfigurationQuery = <
      TData = GetDplCmsConfigurationQuery,
      TError = unknown
    >(
      variables?: GetDplCmsConfigurationQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetDplCmsConfigurationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetDplCmsConfigurationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetDplCmsConfigurationQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getDplCmsConfigurationSuspense'] : ['getDplCmsConfigurationSuspense', variables],
    queryFn: fetcher<GetDplCmsConfigurationQuery, GetDplCmsConfigurationQueryVariables>(GetDplCmsConfigurationDocument, variables),
    ...options
  }
    )};

useSuspenseGetDplCmsConfigurationQuery.getKey = (variables?: GetDplCmsConfigurationQueryVariables) => variables === undefined ? ['getDplCmsConfigurationSuspense'] : ['getDplCmsConfigurationSuspense', variables];


useGetDplCmsConfigurationQuery.fetcher = (variables?: GetDplCmsConfigurationQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetDplCmsConfigurationQuery, GetDplCmsConfigurationQueryVariables>(GetDplCmsConfigurationDocument, variables, options);

export const GetPageByPathDocument = `
    query getPageByPath($path: String!) {
  route(path: $path) {
    __typename
    ... on RouteInternal {
      url
      entity {
        ... on NodeGoPage {
          paragraphs {
            ... on ParagraphGoVideo {
              __typename
              id
              created {
                timestamp
              }
              title
              embedVideo {
                ... on MediaVideotool {
                  id
                  name
                  mediaVideotool
                }
              }
            }
            ... on ParagraphGoVideoBundleAutomatic {
              __typename
              cqlSearch {
                value
              }
              goVideoTitle
              embedVideo {
                ... on MediaVideotool {
                  id
                  name
                  mediaVideotool
                }
              }
              videoAmountOfMaterials
              id
            }
            ... on ParagraphGoVideoBundleManual {
              __typename
              id
              goVideoTitle
              embedVideo {
                ... on MediaVideotool {
                  id
                  name
                  mediaVideotool
                }
              }
              videoBundleWorkIds {
                material_type
                work_id
              }
            }
            ... on ParagraphGoMaterialSliderAutomatic {
              __typename
              cqlSearch {
                value
              }
              titleOptional: title
              sliderAmountOfMaterials
            }
            ... on ParagraphGoMaterialSliderManual {
              __typename
              titleOptional: title
              materialSliderWorkIds {
                material_type
                work_id
              }
            }
          }
        }
      }
    }
  }
}
    `;

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

export const GetAdgangsplatformenTokensDocument = `
    query getAdgangsplatformenTokens {
  dplTokens {
    adgangsplatformen {
      library {
        token
      }
      user {
        expire
        token
      }
    }
  }
}
    `;

export const useGetAdgangsplatformenTokensQuery = <
      TData = GetAdgangsplatformenTokensQuery,
      TError = unknown
    >(
      variables?: GetAdgangsplatformenTokensQueryVariables,
      options?: Omit<UseQueryOptions<GetAdgangsplatformenTokensQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetAdgangsplatformenTokensQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetAdgangsplatformenTokensQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getAdgangsplatformenTokens'] : ['getAdgangsplatformenTokens', variables],
    queryFn: fetcher<GetAdgangsplatformenTokensQuery, GetAdgangsplatformenTokensQueryVariables>(GetAdgangsplatformenTokensDocument, variables),
    ...options
  }
    )};

useGetAdgangsplatformenTokensQuery.getKey = (variables?: GetAdgangsplatformenTokensQueryVariables) => variables === undefined ? ['getAdgangsplatformenTokens'] : ['getAdgangsplatformenTokens', variables];

export const useSuspenseGetAdgangsplatformenTokensQuery = <
      TData = GetAdgangsplatformenTokensQuery,
      TError = unknown
    >(
      variables?: GetAdgangsplatformenTokensQueryVariables,
      options?: Omit<UseSuspenseQueryOptions<GetAdgangsplatformenTokensQuery, TError, TData>, 'queryKey'> & { queryKey?: UseSuspenseQueryOptions<GetAdgangsplatformenTokensQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useSuspenseQuery<GetAdgangsplatformenTokensQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['getAdgangsplatformenTokensSuspense'] : ['getAdgangsplatformenTokensSuspense', variables],
    queryFn: fetcher<GetAdgangsplatformenTokensQuery, GetAdgangsplatformenTokensQueryVariables>(GetAdgangsplatformenTokensDocument, variables),
    ...options
  }
    )};

useSuspenseGetAdgangsplatformenTokensQuery.getKey = (variables?: GetAdgangsplatformenTokensQueryVariables) => variables === undefined ? ['getAdgangsplatformenTokensSuspense'] : ['getAdgangsplatformenTokensSuspense', variables];


useGetAdgangsplatformenTokensQuery.fetcher = (variables?: GetAdgangsplatformenTokensQueryVariables, options?: RequestInit & { next?: NextFetchRequestConfig }) => fetcher<GetAdgangsplatformenTokensQuery, GetAdgangsplatformenTokensQueryVariables>(GetAdgangsplatformenTokensDocument, variables, options);

export const GetAdgangsplatformenUserTokenDocument = `
    query getAdgangsplatformenUserToken {
  dplTokens {
    adgangsplatformen {
      user {
        expire
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
    loginUrls {
      adgangsplatformen
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
    logoutUrls {
      adgangsplatformen
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
