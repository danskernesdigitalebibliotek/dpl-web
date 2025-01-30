<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequest;

/**
 * @property string $__typename
 * @property string|null $status
 * @property string|null $message
 */
class ImportRequestResponse extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $status
     * @param string|null $message
     */
    public static function make(
        $status = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $message = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        $instance->__typename = 'ImportRequestResponse';
        if ($status !== self::UNDEFINED) {
            $instance->status = $status;
        }
        if ($message !== self::UNDEFINED) {
            $instance->message = $message;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'status' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'message' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
