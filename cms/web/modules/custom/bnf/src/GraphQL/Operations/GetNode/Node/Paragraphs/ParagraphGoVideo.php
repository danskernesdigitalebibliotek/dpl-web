<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $__typename
 */
class ParagraphGoVideo extends \Spawnia\Sailor\ObjectLike
{
    public static function make(): self
    {
        $instance = new self;

        $instance->__typename = 'ParagraphGoVideo';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../sailor.php');
    }
}
