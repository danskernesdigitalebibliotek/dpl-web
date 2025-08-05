<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class FictionNonfictionCodeEnum
{
    public const FICTION = 'FICTION';
    public const NONFICTION = 'NONFICTION';
    public const NOT_SPECIFIED = 'NOT_SPECIFIED';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
