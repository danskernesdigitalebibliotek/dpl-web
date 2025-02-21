<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $goDescription
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphWebform $goLinkParagraph
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
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphWebform $goLinkParagraph
     * @param string $titleRequired
     * @param string|null $goColor
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaVideotool|null $goImage
     */
    public static function make(
        $id,
        $goDescription,
        $goLinkParagraph,
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
        if ($goLinkParagraph !== self::UNDEFINED) {
            $instance->goLinkParagraph = $goLinkParagraph;
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
            'goLinkParagraph' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'ParagraphAccordion' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphAccordion',
            'ParagraphBanner' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphBanner',
            'ParagraphBreadcrumbChildren' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphBreadcrumbChildren',
            'ParagraphCampaignRule' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphCampaignRule',
            'ParagraphCardGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphCardGridAutomatic',
            'ParagraphCardGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphCardGridManual',
            'ParagraphContentSlider' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphContentSlider',
            'ParagraphContentSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphContentSliderAutomatic',
            'ParagraphEventTicketCategory' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphEventTicketCategory',
            'ParagraphFiles' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphFiles',
            'ParagraphFilteredEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphFilteredEventList',
            'ParagraphGoLink' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphGoLink',
            'ParagraphGoLinkbox' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphGoLinkbox',
            'ParagraphGoMaterialSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphGoMaterialSliderAutomatic',
            'ParagraphGoMaterialSliderManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphGoMaterialSliderManual',
            'ParagraphGoVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphGoVideo',
            'ParagraphGoVideoBundleAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphGoVideoBundleAutomatic',
            'ParagraphGoVideoBundleManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphGoVideoBundleManual',
            'ParagraphHero' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphHero',
            'ParagraphLanguageSelector' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphLanguageSelector',
            'ParagraphLinks' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphLinks',
            'ParagraphManualEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphManualEventList',
            'ParagraphMaterialGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphMaterialGridAutomatic',
            'ParagraphMaterialGridLinkAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphMaterialGridLinkAutomatic',
            'ParagraphMaterialGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphMaterialGridManual',
            'ParagraphMedias' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphMedias',
            'ParagraphNavGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphNavGridManual',
            'ParagraphNavSpotsManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphNavSpotsManual',
            'ParagraphOpeningHours' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphOpeningHours',
            'ParagraphRecommendation' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphRecommendation',
            'ParagraphSimpleLinks' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphSimpleLinks',
            'ParagraphTextBody' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphTextBody',
            'ParagraphUserRegistrationItem' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphUserRegistrationItem',
            'ParagraphUserRegistrationLinklist' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphUserRegistrationLinklist',
            'ParagraphUserRegistrationSection' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphUserRegistrationSection',
            'ParagraphVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphVideo',
            'ParagraphWebform' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoLinkParagraph\\ParagraphWebform',
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
