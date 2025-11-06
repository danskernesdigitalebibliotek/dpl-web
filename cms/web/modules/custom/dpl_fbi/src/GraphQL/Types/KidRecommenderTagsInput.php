<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string|null $tag
 * @property int|null $weight
 */
class KidRecommenderTagsInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $tag
     * @param int|null $weight
     */
    public static function make(
        $tag = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $weight = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($tag !== self::UNDEFINED) {
            $instance->tag = $tag;
        }
        if ($weight !== self::UNDEFINED) {
            $instance->weight = $weight;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'tag' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'weight' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\IntConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
