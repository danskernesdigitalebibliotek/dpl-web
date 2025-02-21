<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $goDescription
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphWebform $goLink
 * @property string $titleRequired
 * @property string $__typename
 * @property string|null $goColor
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaVideotool|null $goImage
 */
class ParagraphGoLinkbox extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $goDescription
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\ParagraphWebform $goLink
     * @param string $titleRequired
     * @param string|null $goColor
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaVideotool|null $goImage
     */
    public static function make(
        $id,
        $goDescription,
        $goLink,
        $titleRequired,
        $goColor = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $goImage = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($goDescription !== self::UNDEFINED) {
            $instance->goDescription = $goDescription;
        }
        if ($goLink !== self::UNDEFINED) {
            $instance->goLink = $goLink;
        }
        if ($titleRequired !== self::UNDEFINED) {
            $instance->titleRequired = $titleRequired;
        }
        $instance->__typename = 'ParagraphGoLinkbox';
        if ($goColor !== self::UNDEFINED) {
            $instance->goColor = $goColor;
        }
        if ($goImage !== self::UNDEFINED) {
            $instance->goImage = $goImage;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'goDescription' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'goLink' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'ParagraphAccordion' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphAccordion',
            'ParagraphBanner' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphBanner',
            'ParagraphBreadcrumbChildren' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphBreadcrumbChildren',
            'ParagraphCampaignRule' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphCampaignRule',
            'ParagraphCardGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphCardGridAutomatic',
            'ParagraphCardGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphCardGridManual',
            'ParagraphContentSlider' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphContentSlider',
            'ParagraphContentSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphContentSliderAutomatic',
            'ParagraphEventTicketCategory' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphEventTicketCategory',
            'ParagraphFiles' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphFiles',
            'ParagraphFilteredEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphFilteredEventList',
            'ParagraphGoLink' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphGoLink',
            'ParagraphGoLinkbox' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphGoLinkbox',
            'ParagraphGoMaterialSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphGoMaterialSliderAutomatic',
            'ParagraphGoMaterialSliderManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphGoMaterialSliderManual',
            'ParagraphGoVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphGoVideo',
            'ParagraphGoVideoBundleAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphGoVideoBundleAutomatic',
            'ParagraphGoVideoBundleManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphGoVideoBundleManual',
            'ParagraphHero' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphHero',
            'ParagraphLanguageSelector' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphLanguageSelector',
            'ParagraphLinks' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphLinks',
            'ParagraphManualEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphManualEventList',
            'ParagraphMaterialGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphMaterialGridAutomatic',
            'ParagraphMaterialGridLinkAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphMaterialGridLinkAutomatic',
            'ParagraphMaterialGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphMaterialGridManual',
            'ParagraphMedias' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphMedias',
            'ParagraphNavGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphNavGridManual',
            'ParagraphNavSpotsManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphNavSpotsManual',
            'ParagraphOpeningHours' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphOpeningHours',
            'ParagraphRecommendation' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphRecommendation',
            'ParagraphSimpleLinks' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphSimpleLinks',
            'ParagraphTextBody' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphTextBody',
            'ParagraphUserRegistrationItem' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphUserRegistrationItem',
            'ParagraphUserRegistrationLinklist' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphUserRegistrationLinklist',
            'ParagraphUserRegistrationSection' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphUserRegistrationSection',
            'ParagraphVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphVideo',
            'ParagraphWebform' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLink\\ParagraphWebform',
        ])),
            'titleRequired' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'goColor' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'goImage' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImage\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImage\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImage\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImage\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImage\\MediaVideotool',
        ])),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../sailor.php');
    }
}
