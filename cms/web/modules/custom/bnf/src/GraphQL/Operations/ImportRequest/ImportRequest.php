<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\ImportRequest;

/**
 * @property \Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequest\ImportRequestResponse $importRequest
 * @property string $__typename
 */
class ImportRequest extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequest\ImportRequestResponse $importRequest
     */
    public static function make($importRequest): self
    {
        $instance = new self;

        if ($importRequest !== self::UNDEFINED) {
            $instance->importRequest = $importRequest;
        }
        $instance->__typename = 'Mutation';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'importRequest' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequest\ImportRequestResponse),
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
