<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ComplexSearchFacetsEnum
{
    public const ACCESSTYPE = 'ACCESSTYPE';
    public const AGES = 'AGES';
    public const CATALOGUECODE = 'CATALOGUECODE';
    public const CHAMBERMUSICTYPE = 'CHAMBERMUSICTYPE';
    public const CHOIRTYPE = 'CHOIRTYPE';
    public const CONTRIBUTOR = 'CONTRIBUTOR';
    public const CONTRIBUTORFUNCTION = 'CONTRIBUTORFUNCTION';
    public const CREATOR = 'CREATOR';
    public const CREATORCONTRIBUTOR = 'CREATORCONTRIBUTOR';
    public const CREATORCONTRIBUTORFUNCTION = 'CREATORCONTRIBUTORFUNCTION';
    public const CREATORFUNCTION = 'CREATORFUNCTION';
    public const DATEFIRSTEDITION = 'DATEFIRSTEDITION';
    public const FICTIONALCHARACTER = 'FICTIONALCHARACTER';
    public const FILMNATIONALITY = 'FILMNATIONALITY';
    public const GAMEPLATFORM = 'GAMEPLATFORM';
    public const GENERALAUDIENCE = 'GENERALAUDIENCE';
    public const GENERALMATERIALTYPE = 'GENERALMATERIALTYPE';
    public const GENREANDFORM = 'GENREANDFORM';
    public const HOSTPUBLICATION = 'HOSTPUBLICATION';
    public const HOSTPUBLICATIONTYPE = 'HOSTPUBLICATIONTYPE';
    public const INSTRUMENT = 'INSTRUMENT';
    public const ISSUE = 'ISSUE';
    public const LANGUAGE = 'LANGUAGE';
    public const LET = 'LET';
    public const LIBRARYRECOMMENDATION = 'LIBRARYRECOMMENDATION';
    public const LIX = 'LIX';
    public const MAINLANGUAGE = 'MAINLANGUAGE';
    public const MEDIACOUNCILAGERESTRICTION = 'MEDIACOUNCILAGERESTRICTION';
    public const MOOD = 'MOOD';
    public const MUSICALENSEMBLEORCAST = 'MUSICALENSEMBLEORCAST';
    public const NARRATIVETECHNIQUE = 'NARRATIVETECHNIQUE';
    public const PEGI = 'PEGI';
    public const PLAYERS = 'PLAYERS';
    public const PRIMARYTARGET = 'PRIMARYTARGET';
    public const PUBLICATIONYEAR = 'PUBLICATIONYEAR';
    public const SERIES = 'SERIES';
    public const SETTING = 'SETTING';
    public const SOURCE = 'SOURCE';
    public const SPECIFICMATERIALTYPE = 'SPECIFICMATERIALTYPE';
    public const SPOKENLANGUAGE = 'SPOKENLANGUAGE';
    public const SUBJECT = 'SUBJECT';
    public const SUBTITLELANGUAGE = 'SUBTITLELANGUAGE';
    public const TYPEOFSCORE = 'TYPEOFSCORE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
