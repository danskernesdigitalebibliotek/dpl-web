<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaFile;

/**
 * @property string $url
 * @property string $__typename
 * @property string|null $description
 * @property string|null $name
 */
class File extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $url
     * @param string|null $description
     * @param string|null $name
     */
    public static function make(
        $url,
        $description = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $name = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($url !== self::UNDEFINED) {
            $instance->url = $url;
        }
        $instance->__typename = 'File';
        if ($description !== self::UNDEFINED) {
            $instance->description = $description;
        }
        if ($name !== self::UNDEFINED) {
            $instance->name = $name;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'url' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'description' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'name' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../../../sailor.php');
    }
}
