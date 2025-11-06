<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo;

class WorkInfoErrorFreeResult extends \Spawnia\Sailor\ErrorFreeResult
{
    public WorkInfo $data;

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../sailor.php');
    }
}
