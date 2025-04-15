<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\NewContent\NewContent;

/**
 * @property array<int, string> $uuids
 * @property mixed $youngest
 * @property array<int, \Drupal\bnf\GraphQL\Operations\NewContent\NewContent\Errors\Error> $errors
 * @property string $__typename
 */
class NewContentResponse extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param array<int, string> $uuids
     * @param mixed $youngest
     * @param array<int, \Drupal\bnf\GraphQL\Operations\NewContent\NewContent\Errors\Error> $errors
     */
    public static function make($uuids, $youngest, $errors): self
    {
        $instance = new self;

        if ($uuids !== self::UNDEFINED) {
            $instance->uuids = $uuids;
        }
        if ($youngest !== self::UNDEFINED) {
            $instance->youngest = $youngest;
        }
        if ($errors !== self::UNDEFINED) {
            $instance->errors = $errors;
        }
        $instance->__typename = 'NewContentResponse';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'uuids' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'youngest' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ScalarConverter),
            'errors' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\NewContent\NewContent\Errors\Error))),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../sailor.php');
    }
}
