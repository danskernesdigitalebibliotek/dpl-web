<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class AccessUrlTypeEnum
{
    public const IMAGE = 'IMAGE';
    public const OTHER = 'OTHER';
    public const RESOURCE = 'RESOURCE';
    public const SAMPLE = 'SAMPLE';
    public const TABLE_OF_CONTENTS = 'TABLE_OF_CONTENTS';
    public const THUMBNAIL = 'THUMBNAIL';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
