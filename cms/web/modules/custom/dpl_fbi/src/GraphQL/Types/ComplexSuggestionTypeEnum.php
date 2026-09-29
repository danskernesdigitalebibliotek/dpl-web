<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ComplexSuggestionTypeEnum
{
    public const CONTRIBUTORFUNCTION = 'CONTRIBUTORFUNCTION';
    public const CREATOR = 'CREATOR';
    public const CREATORCONTRIBUTOR = 'CREATORCONTRIBUTOR';
    public const CREATORCONTRIBUTORFUNCTION = 'CREATORCONTRIBUTORFUNCTION';
    public const CREATORFUNCTION = 'CREATORFUNCTION';
    public const DEFAULT = 'DEFAULT';
    public const FICTIONALCHARACTER = 'FICTIONALCHARACTER';
    public const HOSTPUBLICATION = 'HOSTPUBLICATION';
    public const PUBLISHER = 'PUBLISHER';
    public const SERIES = 'SERIES';
    public const SUBJECT = 'SUBJECT';
    public const TITLE = 'TITLE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
