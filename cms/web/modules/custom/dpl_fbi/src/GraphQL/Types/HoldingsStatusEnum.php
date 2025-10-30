<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class HoldingsStatusEnum
{
    public const ONSHELF = 'ONSHELF';
    public const ONLOAN = 'ONLOAN';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
