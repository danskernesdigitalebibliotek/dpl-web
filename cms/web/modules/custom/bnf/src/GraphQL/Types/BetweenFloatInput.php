<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Types;

/**
 * @property float|int|null $min
 * @property float|int|null $max
 */
class BetweenFloatInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param float|int|null $min
     * @param float|int|null $max
     */
    public static function make(
        $min = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $max = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($min !== self::UNDEFINED) {
            $instance->min = $min;
        }
        if ($max !== self::UNDEFINED) {
            $instance->max = $max;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'min' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\FloatConverter),
            'max' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\FloatConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../sailor.php');
    }
}
