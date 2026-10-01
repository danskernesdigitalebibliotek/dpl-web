<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class MaterialSelectionPublicationStatusEnum
{
    public const NEW_EDITION = 'NEW_EDITION';
    public const NEW_PRINT = 'NEW_PRINT';
    public const NEW_TITLE = 'NEW_TITLE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
