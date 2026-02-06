<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ComplexSearchFacetsEnum
{
    public const AGES = 'AGES';
    public const CATALOGUECODE = 'CATALOGUECODE';
    public const CONTRIBUTOR = 'CONTRIBUTOR';
    public const CONTRIBUTORFUNCTION = 'CONTRIBUTORFUNCTION';
    public const CREATOR = 'CREATOR';
    public const CREATORCONTRIBUTOR = 'CREATORCONTRIBUTOR';
    public const CREATORCONTRIBUTORFUNCTION = 'CREATORCONTRIBUTORFUNCTION';
    public const CREATORFUNCTION = 'CREATORFUNCTION';
    public const FICTIONALCHARACTER = 'FICTIONALCHARACTER';
    public const FILMNATIONALITY = 'FILMNATIONALITY';
    public const GAMEPLATFORM = 'GAMEPLATFORM';
    public const GENERALAUDIENCE = 'GENERALAUDIENCE';
    public const GENERALMATERIALTYPE = 'GENERALMATERIALTYPE';
    public const GENREANDFORM = 'GENREANDFORM';
    public const ISSUE = 'ISSUE';
    public const LANGUAGE = 'LANGUAGE';
    public const LIBRARYRECOMMENDATION = 'LIBRARYRECOMMENDATION';
    public const MAINLANGUAGE = 'MAINLANGUAGE';
    public const MUSICALENSEMBLEORCAST = 'MUSICALENSEMBLEORCAST';
    public const PLAYERS = 'PLAYERS';
    public const PRIMARYTARGET = 'PRIMARYTARGET';
    public const SPECIFICMATERIALTYPE = 'SPECIFICMATERIALTYPE';
    public const SPOKENLANGUAGE = 'SPOKENLANGUAGE';
    public const SUBTITLELANGUAGE = 'SUBTITLELANGUAGE';
    public const TYPEOFSCORE = 'TYPEOFSCORE';
    public const SUBJECT = 'SUBJECT';
    public const HOSTPUBLICATION = 'HOSTPUBLICATION';
    public const SERIES = 'SERIES';
    public const MEDIACOUNCILAGERESTRICTION = 'MEDIACOUNCILAGERESTRICTION';
    public const ACCESSTYPE = 'ACCESSTYPE';
    public const MOOD = 'MOOD';
    public const NARRATIVETECHNIQUE = 'NARRATIVETECHNIQUE';
    public const PEGI = 'PEGI';
    public const SETTING = 'SETTING';
    public const LIX = 'LIX';
    public const LET = 'LET';
    public const PUBLICATIONYEAR = 'PUBLICATIONYEAR';
    public const SOURCE = 'SOURCE';
    public const INSTRUMENT = 'INSTRUMENT';
    public const CHOIRTYPE = 'CHOIRTYPE';
    public const CHAMBERMUSICTYPE = 'CHAMBERMUSICTYPE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
