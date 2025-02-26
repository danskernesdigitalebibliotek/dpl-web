<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\bnf\GraphQL\Operations\NewContent\NewContentResult>
 */
class NewContent extends \Spawnia\Sailor\Operation
{
    /**
     * @param string $uuid
     * @param mixed $since
     */
    public static function execute($uuid, $since): NewContent\NewContentResult
    {
        return self::executeOperation(
            $uuid,
            $since,
        );
    }

    protected static function converters(): array
    {
        static $converters;

        return $converters ??= [
            ['uuid', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
            ['since', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ScalarConverter)],
        ];
    }

    public static function document(): string
    {
        return /* @lang GraphQL */ 'query NewContent($uuid: String!, $since: Time!) {
          __typename
          newContent(uuid: $uuid, since: $since) {
            __typename
            uuids
            youngest
            errors {
              __typename
              message
            }
          }
        }';
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../sailor.php');
    }
}
