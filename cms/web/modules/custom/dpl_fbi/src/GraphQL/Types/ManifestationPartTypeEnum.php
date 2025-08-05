<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ManifestationPartTypeEnum
{
    public const MUSIC_TRACKS = 'MUSIC_TRACKS';
    public const SHEET_MUSIC_CONTENT = 'SHEET_MUSIC_CONTENT';
    public const PARTS_OF_BOOK = 'PARTS_OF_BOOK';
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
