<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $__typename
 * @property string|null $titleOptional
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MoreLink\Link|null $moreLink
 * @property array<int, string|null>|null $gridContentUuids
 */
class ParagraphCardGridManual extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string|null $titleOptional
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MoreLink\Link|null $moreLink
     * @param array<int, string|null>|null $gridContentUuids
     */
    public static function make(
        $id,
        $titleOptional = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $moreLink = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $gridContentUuids = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'ParagraphCardGridManual';
        if ($titleOptional !== self::UNDEFINED) {
            $instance->titleOptional = $titleOptional;
        }
        if ($moreLink !== self::UNDEFINED) {
            $instance->moreLink = $moreLink;
        }
        if ($gridContentUuids !== self::UNDEFINED) {
            $instance->gridContentUuids = $gridContentUuids;
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
            'moreLink' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MoreLink\Link),
            'gridContentUuids' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
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
