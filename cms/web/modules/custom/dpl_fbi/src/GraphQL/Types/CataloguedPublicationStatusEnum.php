<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class CataloguedPublicationStatusEnum
{
    public const NT = 'NT';
    public const NU = 'NU';
    public const OP = 'OP';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
