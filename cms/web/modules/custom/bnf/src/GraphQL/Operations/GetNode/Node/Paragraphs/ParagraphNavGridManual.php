<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $__typename
 * @property string|null $titleOptional
 * @property bool|null $showSubtitles
 * @property array<int, string|null>|null $contentReferenceUuids
 */
class ParagraphNavGridManual extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string|null $titleOptional
     * @param bool|null $showSubtitles
     * @param array<int, string|null>|null $contentReferenceUuids
     */
    public static function make(
        $id,
        $titleOptional = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $showSubtitles = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $contentReferenceUuids = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'ParagraphNavGridManual';
        if ($titleOptional !== self::UNDEFINED) {
            $instance->titleOptional = $titleOptional;
        }
        if ($showSubtitles !== self::UNDEFINED) {
            $instance->showSubtitles = $showSubtitles;
        }
        if ($contentReferenceUuids !== self::UNDEFINED) {
            $instance->contentReferenceUuids = $contentReferenceUuids;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'titleOptional' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'showSubtitles' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            'contentReferenceUuids' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
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
