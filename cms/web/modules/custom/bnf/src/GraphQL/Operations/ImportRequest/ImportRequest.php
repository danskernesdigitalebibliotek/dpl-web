<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\ImportRequest;

/**
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequest\ImportRequestResponse|null $importRequest
 */
class ImportRequest extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequest\ImportRequestResponse|null $importRequest
     */
    public static function make(
        $importRequest = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        $instance->__typename = 'Mutation';
        if ($importRequest !== self::UNDEFINED) {
            $instance->importRequest = $importRequest;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'importRequest' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequest\ImportRequestResponse),
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
