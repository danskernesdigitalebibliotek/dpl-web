<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\bnf\GraphQL\Operations\GetNodeTitle\GetNodeTitleResult>
 */
class GetNodeTitle extends \Spawnia\Sailor\Operation
{
    /**
     * @param int|string $id
     */
    public static function execute($id): GetNodeTitle\GetNodeTitleResult
    {
        return self::executeOperation(
            $id,
        );
    }

    protected static function converters(): array
    {
        static $converters;

        return $converters ??= [
            ['id', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter)],
        ];
    }

    public static function document(): string
    {
        return /* @lang GraphQL */ 'query GetNodeTitle($id: ID!) {
          __typename
          node(id: $id) {
            __typename
            ... on NodeInterface {
              id
              title
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
