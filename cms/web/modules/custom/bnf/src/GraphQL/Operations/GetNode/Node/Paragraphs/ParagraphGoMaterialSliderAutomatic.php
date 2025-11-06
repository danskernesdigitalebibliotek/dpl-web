<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property int $sliderAmountOfMaterials
 * @property string $title
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch|null $cqlSearch
 */
class ParagraphGoMaterialSliderAutomatic extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param int $sliderAmountOfMaterials
     * @param string $title
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch|null $cqlSearch
     */
    public static function make(
        $id,
        $sliderAmountOfMaterials,
        $title,
        $cqlSearch = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($sliderAmountOfMaterials !== self::UNDEFINED) {
            $instance->sliderAmountOfMaterials = $sliderAmountOfMaterials;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        $instance->__typename = 'ParagraphGoMaterialSliderAutomatic';
        if ($cqlSearch !== self::UNDEFINED) {
            $instance->cqlSearch = $cqlSearch;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'sliderAmountOfMaterials' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            'title' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'cqlSearch' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../sailor.php');
    }
}
