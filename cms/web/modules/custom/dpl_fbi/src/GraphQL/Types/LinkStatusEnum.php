<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class LinkStatusEnum
{
    public const BROKEN = 'BROKEN';
    public const GONE = 'GONE';
    public const INVALID = 'INVALID';
    public const OK = 'OK';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
