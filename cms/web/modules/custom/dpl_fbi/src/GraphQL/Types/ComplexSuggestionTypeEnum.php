<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ComplexSuggestionTypeEnum
{
    public const HOSTPUBLICATION = 'HOSTPUBLICATION';
    public const CONTRIBUTORFUNCTION = 'CONTRIBUTORFUNCTION';
    public const CREATOR = 'CREATOR';
    public const DEFAULT = 'DEFAULT';
    public const CREATORCONTRIBUTORFUNCTION = 'CREATORCONTRIBUTORFUNCTION';
    public const CREATORFUNCTION = 'CREATORFUNCTION';
    public const SUBJECT = 'SUBJECT';
    public const FICTIONALCHARACTER = 'FICTIONALCHARACTER';
    public const TITLE = 'TITLE';
    public const CREATORCONTRIBUTOR = 'CREATORCONTRIBUTOR';
    public const SERIES = 'SERIES';
    public const PUBLISHER = 'PUBLISHER';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
