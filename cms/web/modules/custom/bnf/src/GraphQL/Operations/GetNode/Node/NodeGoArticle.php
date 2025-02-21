<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node;

/**
 * @property string $id
 * @property string $title
 * @property string $__typename
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphWebform>|null $paragraphs
 */
class NodeGoArticle extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $title
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCampaignRule|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphEventTicketCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFiles|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLink|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphHero|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLanguageSelector|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridLinkAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavSpotsManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphOpeningHours|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphRecommendation|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationItem|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationLinklist|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphUserRegistrationSection|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphWebform>|null $paragraphs
     */
    public static function make(
        $id,
        $title,
        $paragraphs = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        $instance->__typename = 'NodeGoArticle';
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
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
            'ParagraphGoLink' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoLink',
            'ParagraphGoLinkbox' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoLinkbox',
            'ParagraphGoMaterialSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoMaterialSliderAutomatic',
            'ParagraphGoMaterialSliderManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoMaterialSliderManual',
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
