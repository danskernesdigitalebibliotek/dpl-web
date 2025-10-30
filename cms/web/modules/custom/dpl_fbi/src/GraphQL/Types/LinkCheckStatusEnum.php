<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class LinkCheckStatusEnum
{
    public const OK = 'OK';
    public const BROKEN = 'BROKEN';
    public const INVALID = 'INVALID';
    public const GONE = 'GONE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
