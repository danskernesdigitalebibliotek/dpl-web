<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class MaterialSelectionLibrarianAssessmentEnum
{
    public const LITERATURE = 'LITERATURE';
    public const MOVIE = 'MOVIE';
    public const MULTIMEDIA = 'MULTIMEDIA';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
