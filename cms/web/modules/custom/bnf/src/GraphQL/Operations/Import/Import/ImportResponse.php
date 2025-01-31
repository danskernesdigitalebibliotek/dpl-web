<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\Import\Import;

/**
 * @property string $status
 * @property string $message
 * @property string $__typename
 */
class ImportResponse extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $status
     * @param string $message
     */
    public static function make($status, $message): self
    {
        $instance = new self;

        if ($status !== self::UNDEFINED) {
            $instance->status = $status;
        }
        if ($message !== self::UNDEFINED) {
            $instance->message = $message;
        }
        $instance->__typename = 'ImportResponse';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'status' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'message' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
