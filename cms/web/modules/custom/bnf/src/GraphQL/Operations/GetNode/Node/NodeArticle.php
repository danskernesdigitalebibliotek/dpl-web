<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node;

/**
 * @property string $id
 * @property string $title
 * @property string $url
 * @property bool $status
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Changed\DateTime $changed
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Created\DateTime $created
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime $publicationDate
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\CanonicalUrl\Link|null $canonicalUrl
 * @property string|null $overrideAuthor
 * @property bool|null $showOverrideAuthor
 * @property string|null $subtitle
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaVideotool|null $teaserImage
 * @property string|null $teaserText
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoImages|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphWebform>|null $paragraphs
 */
class NodeArticle extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $title
     * @param string $url
     * @param bool $status
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Changed\DateTime $changed
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Created\DateTime $created
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime $publicationDate
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\CanonicalUrl\Link|null $canonicalUrl
     * @param string|null $overrideAuthor
     * @param bool|null $showOverrideAuthor
     * @param string|null $subtitle
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\TeaserImage\MediaVideotool|null $teaserImage
     * @param string|null $teaserText
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoImages|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphWebform>|null $paragraphs
     */
    public static function make(
        $id,
        $title,
        $url,
        $status,
        $changed,
        $created,
        $publicationDate,
        $canonicalUrl = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $overrideAuthor = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $showOverrideAuthor = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $subtitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $teaserImage = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $teaserText = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $paragraphs = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        if ($url !== self::UNDEFINED) {
            $instance->url = $url;
        }
        if ($status !== self::UNDEFINED) {
            $instance->status = $status;
        }
        if ($changed !== self::UNDEFINED) {
            $instance->changed = $changed;
        }
        if ($created !== self::UNDEFINED) {
            $instance->created = $created;
        }
        if ($publicationDate !== self::UNDEFINED) {
            $instance->publicationDate = $publicationDate;
        }
        $instance->__typename = 'NodeArticle';
        if ($canonicalUrl !== self::UNDEFINED) {
            $instance->canonicalUrl = $canonicalUrl;
        }
        if ($overrideAuthor !== self::UNDEFINED) {
            $instance->overrideAuthor = $overrideAuthor;
        }
        if ($showOverrideAuthor !== self::UNDEFINED) {
            $instance->showOverrideAuthor = $showOverrideAuthor;
        }
        if ($subtitle !== self::UNDEFINED) {
            $instance->subtitle = $subtitle;
        }
        if ($teaserImage !== self::UNDEFINED) {
            $instance->teaserImage = $teaserImage;
        }
        if ($teaserText !== self::UNDEFINED) {
            $instance->teaserText = $teaserText;
        }
        if ($paragraphs !== self::UNDEFINED) {
            $instance->paragraphs = $paragraphs;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'title' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'url' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'status' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            'changed' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Changed\DateTime),
            'created' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Created\DateTime),
            'publicationDate' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'canonicalUrl' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\CanonicalUrl\Link),
            'overrideAuthor' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'showOverrideAuthor' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            'subtitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'teaserImage' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\TeaserImage\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\TeaserImage\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\TeaserImage\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\TeaserImage\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\TeaserImage\\MediaVideotool',
        ])),
            'teaserText' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'paragraphs' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'ParagraphAccordion' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphAccordion',
            'ParagraphBanner' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphBanner',
            'ParagraphBreadcrumbChildren' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphBreadcrumbChildren',
            'ParagraphCampaignRule' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphCampaignRule',
            'ParagraphCardGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphCardGridAutomatic',
            'ParagraphCardGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphCardGridManual',
            'ParagraphContentSlider' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphContentSlider',
            'ParagraphContentSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphContentSliderAutomatic',
            'ParagraphEventTicketCategory' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphEventTicketCategory',
            'ParagraphFiles' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphFiles',
            'ParagraphFilteredEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphFilteredEventList',
            'ParagraphGoImages' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoImages',
            'ParagraphGoLink' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoLink',
            'ParagraphGoLinkbox' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoLinkbox',
            'ParagraphGoMaterialSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoMaterialSliderAutomatic',
            'ParagraphGoMaterialSliderManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoMaterialSliderManual',
            'ParagraphGoTextBody' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoTextBody',
            'ParagraphGoVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoVideo',
            'ParagraphGoVideoBundleAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoVideoBundleAutomatic',
            'ParagraphGoVideoBundleManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoVideoBundleManual',
            'ParagraphHero' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphHero',
            'ParagraphLanguageSelector' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphLanguageSelector',
            'ParagraphLinks' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphLinks',
            'ParagraphManualEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphManualEventList',
            'ParagraphMaterialGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphMaterialGridAutomatic',
            'ParagraphMaterialGridLinkAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphMaterialGridLinkAutomatic',
            'ParagraphMaterialGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphMaterialGridManual',
            'ParagraphMedias' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphMedias',
            'ParagraphNavGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphNavGridManual',
            'ParagraphNavSpotsManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphNavSpotsManual',
            'ParagraphOpeningHours' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphOpeningHours',
            'ParagraphRecommendation' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphRecommendation',
            'ParagraphSimpleLinks' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphSimpleLinks',
            'ParagraphTextBody' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphTextBody',
            'ParagraphUserRegistrationItem' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphUserRegistrationItem',
            'ParagraphUserRegistrationLinklist' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphUserRegistrationLinklist',
            'ParagraphUserRegistrationSection' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphUserRegistrationSection',
            'ParagraphVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphVideo',
            'ParagraphWebform' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphWebform',
        ])))),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../sailor.php');
    }
}
