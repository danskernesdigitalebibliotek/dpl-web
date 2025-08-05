<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property array<int>|null $difficulty
 * @property array<int>|null $illustrationsLevel
 * @property array<int>|null $length
 * @property array<int>|null $realisticVsFictional
 * @property string|null $fictionNonfiction
 */
class MoodKidsRecommendFiltersInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param array<int>|null $difficulty
     * @param array<int>|null $illustrationsLevel
     * @param array<int>|null $length
     * @param array<int>|null $realisticVsFictional
     * @param string|null $fictionNonfiction
     */
    public static function make(
        $difficulty = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $illustrationsLevel = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $length = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $realisticVsFictional = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $fictionNonfiction = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($difficulty !== self::UNDEFINED) {
            $instance->difficulty = $difficulty;
        }
        if ($illustrationsLevel !== self::UNDEFINED) {
            $instance->illustrationsLevel = $illustrationsLevel;
        }
        if ($length !== self::UNDEFINED) {
            $instance->length = $length;
        }
        if ($realisticVsFictional !== self::UNDEFINED) {
            $instance->realisticVsFictional = $realisticVsFictional;
        }
        if ($fictionNonfiction !== self::UNDEFINED) {
            $instance->fictionNonfiction = $fictionNonfiction;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'difficulty' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter))),
            'illustrationsLevel' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter))),
            'length' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter))),
            'realisticVsFictional' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter))),
            'fictionNonfiction' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\EnumConverter),
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
