<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property int $materialAmount
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch|null $cqlSearch
 * @property string|null $materialGridDescription
 * @property string|null $materialGridTitle
 */
class ParagraphMaterialGridAutomatic extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param int $materialAmount
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch|null $cqlSearch
     * @param string|null $materialGridDescription
     * @param string|null $materialGridTitle
     */
    public static function make(
        $id,
        $materialAmount,
        $cqlSearch = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialGridDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialGridTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($materialAmount !== self::UNDEFINED) {
            $instance->materialAmount = $materialAmount;
        }
        $instance->__typename = 'ParagraphMaterialGridAutomatic';
        if ($cqlSearch !== self::UNDEFINED) {
            $instance->cqlSearch = $cqlSearch;
        }
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
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'materialAmount' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'cqlSearch' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch),
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
        return \Safe\realpath(__DIR__ . '/../../../../../../sailor.php');
    }
}
