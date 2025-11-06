<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string|null $all
 * @property string|null $creator
 * @property string|null $subject
 * @property string|null $title
 */
class SearchQueryInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $all
     * @param string|null $creator
     * @param string|null $subject
     * @param string|null $title
     */
    public static function make(
        $all = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $creator = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $subject = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($all !== self::UNDEFINED) {
            $instance->all = $all;
        }
        if ($creator !== self::UNDEFINED) {
            $instance->creator = $creator;
        }
        if ($subject !== self::UNDEFINED) {
            $instance->subject = $subject;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'all' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'creator' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'subject' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'title' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
