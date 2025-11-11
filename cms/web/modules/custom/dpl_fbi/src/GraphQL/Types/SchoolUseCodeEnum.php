<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class SchoolUseCodeEnum
{
    public const FOR_SCHOOL_USE = 'FOR_SCHOOL_USE';
    public const FOR_TEACHER = 'FOR_TEACHER';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
