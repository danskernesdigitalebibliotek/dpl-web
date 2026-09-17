<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class MaterialSelectionGroupEnum
{
    public const ADULT = 'ADULT';
    public const CHILDREN = 'CHILDREN';
    public const SCHOOL = 'SCHOOL';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
