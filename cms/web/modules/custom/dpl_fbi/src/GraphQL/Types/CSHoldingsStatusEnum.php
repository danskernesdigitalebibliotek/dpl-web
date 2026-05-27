<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class CSHoldingsStatusEnum
{
    public const ONSHELF = 'ONSHELF';
    public const ONLOAN = 'ONLOAN';
    public const DISCARDED = 'DISCARDED';
    public const LOST = 'LOST';
    public const NOTFORLOAN = 'NOTFORLOAN';
    public const ONORDER = 'ONORDER';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
