<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class EntryTypeEnum
{
    public const ADDITIONAL_ENTRY = 'ADDITIONAL_ENTRY';
    public const MAIN_ENTRY = 'MAIN_ENTRY';
    public const NATIONAL_BIBLIOGRAPHY_ENTRY = 'NATIONAL_BIBLIOGRAPHY_ENTRY';
    public const NATIONAL_BIBLIOGRAPHY_ADDITIONAL_ENTRY = 'NATIONAL_BIBLIOGRAPHY_ADDITIONAL_ENTRY';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
