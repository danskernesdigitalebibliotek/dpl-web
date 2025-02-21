<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate;

/**
 * @property mixed $timestamp
 * @property mixed $timezone
 * @property mixed $time
 * @property string $__typename
 */
class DateTime extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param mixed $timestamp
     * @param mixed $timezone
     * @param mixed $time
     */
    public static function make($timestamp, $timezone, $time): self
    {
        $instance = new self;

        if ($timestamp !== self::UNDEFINED) {
            $instance->timestamp = $timestamp;
        }
        if ($timezone !== self::UNDEFINED) {
            $instance->timezone = $timezone;
        }
        if ($time !== self::UNDEFINED) {
            $instance->time = $time;
        }
        $instance->__typename = 'DateTime';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'timestamp' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ScalarConverter),
            'timezone' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ScalarConverter),
            'time' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ScalarConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../../sailor.php');
    }
}
