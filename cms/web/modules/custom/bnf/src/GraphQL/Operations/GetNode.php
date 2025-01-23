<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\bnf\GraphQL\Operations\GetNode\GetNodeResult>
 */
class GetNode extends \Spawnia\Sailor\Operation
{
    /**
     * @param int|string $id
     */
    public static function execute($id): GetNode\GetNodeResult
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
        return /* @lang GraphQL */ 'query GetNode($id: ID!) {
          __typename
          node(id: $id) {
            __typename
            ... on NodeInterface {
              id
              title
            }
            ... on NodeArticle {
              paragraphs {
                __typename
                ... on ParagraphTextBody {
                  body {
                    __typename
                    value
                    format
                  }
                }
              }
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
