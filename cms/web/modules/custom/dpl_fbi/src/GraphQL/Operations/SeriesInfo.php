<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\SeriesInfoResult>
 */
class SeriesInfo extends \Spawnia\Sailor\Operation
{
    /**
     * @param string $seriesId
     */
    public static function execute($seriesId): SeriesInfo\SeriesInfoResult
    {
        return self::executeOperation(
            $seriesId,
        );
    }

    protected static function converters(): array
    {
        /** @var array<int, array{string, \Spawnia\Sailor\Convert\TypeConverter}>|null $converters */
        static $converters;

        return $converters ??= [
            ['seriesId', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
        ];
    }

    public static function document(): string
    {
        return /* @lang GraphQL */ 'query SeriesInfo($seriesId: String!) {
          __typename
          series(seriesId: $seriesId) {
            __typename
            title
            description
            members(limit: 5) {
              __typename
              readThisFirst
              work {
                __typename
                manifestations {
                  __typename
                  bestRepresentation {
                    __typename
                    cover {
                      __typename
                      large {
                        __typename
                        url
                        height
                        width
                      }
                    }
                  }
                }
              }
            }
          }
        }';
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
