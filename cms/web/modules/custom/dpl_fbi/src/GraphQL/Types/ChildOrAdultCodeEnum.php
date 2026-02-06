<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ChildOrAdultCodeEnum
{
    public const FOR_CHILDREN = 'FOR_CHILDREN';
    public const FOR_ADULTS = 'FOR_ADULTS';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
