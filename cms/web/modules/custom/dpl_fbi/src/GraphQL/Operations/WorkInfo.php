<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\WorkInfoResult>
 */
class WorkInfo extends \Spawnia\Sailor\Operation
{
    /**
     * @param string|null $wid
     */
    public static function execute(
        $wid = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): WorkInfo\WorkInfoResult {
        return self::executeOperation(
            $wid,
        );
    }

    protected static function converters(): array
    {
        /** @var array<int, array{string, \Spawnia\Sailor\Convert\TypeConverter}>|null $converters */
        static $converters;

        return $converters ??= [
            ['wid', new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
        ];
    }

    public static function document(): string
    {
        return /* @lang GraphQL */ 'query WorkInfo($wid: String) {
          __typename
          work(id: $wid) {
            __typename
            titles {
              __typename
              full
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
