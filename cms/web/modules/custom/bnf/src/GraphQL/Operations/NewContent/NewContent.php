<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\NewContent;

/**
 * @property \Drupal\bnf\GraphQL\Operations\NewContent\NewContent\NewContentResponse $newContent
 * @property string $__typename
 */
class NewContent extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\bnf\GraphQL\Operations\NewContent\NewContent\NewContentResponse $newContent
     */
    public static function make($newContent): self
    {
        $instance = new self;

        if ($newContent !== self::UNDEFINED) {
            $instance->newContent = $newContent;
        }
        $instance->__typename = 'Query';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'newContent' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\NewContent\NewContent\NewContentResponse),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../sailor.php');
    }
}
