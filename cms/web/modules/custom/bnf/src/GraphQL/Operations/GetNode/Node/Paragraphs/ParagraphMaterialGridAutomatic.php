<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property int $amountOfMaterials
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch $cqlSearch
 * @property string $__typename
 * @property string|null $materialGridDescription
 * @property string|null $materialGridTitle
 */
class ParagraphMaterialGridAutomatic extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param int $amountOfMaterials
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch $cqlSearch
     * @param string|null $materialGridDescription
     * @param string|null $materialGridTitle
     */
    public static function make(
        $id,
        $amountOfMaterials,
        $cqlSearch,
        $materialGridDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialGridTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($amountOfMaterials !== self::UNDEFINED) {
            $instance->amountOfMaterials = $amountOfMaterials;
        }
        if ($cqlSearch !== self::UNDEFINED) {
            $instance->cqlSearch = $cqlSearch;
        }
        $instance->__typename = 'ParagraphMaterialGridAutomatic';
        if ($materialGridDescription !== self::UNDEFINED) {
            $instance->materialGridDescription = $materialGridDescription;
        }
        if ($materialGridTitle !== self::UNDEFINED) {
            $instance->materialGridTitle = $materialGridTitle;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'amountOfMaterials' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            'cqlSearch' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'materialGridDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'materialGridTitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
