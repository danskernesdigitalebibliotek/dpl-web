<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class FacetFieldEnum
{
    public const WORKTYPES = 'WORKTYPES';
    public const MAINLANGUAGES = 'MAINLANGUAGES';
    public const MATERIALTYPESGENERAL = 'MATERIALTYPESGENERAL';
    public const MATERIALTYPESSPECIFIC = 'MATERIALTYPESSPECIFIC';
    public const FICTIONALCHARACTERS = 'FICTIONALCHARACTERS';
    public const GENREANDFORM = 'GENREANDFORM';
    public const CHILDRENORADULTS = 'CHILDRENORADULTS';
    public const ACCESSTYPES = 'ACCESSTYPES';
    public const FICTIONNONFICTION = 'FICTIONNONFICTION';
    public const SUBJECTS = 'SUBJECTS';
    public const CREATORS = 'CREATORS';
    public const CANALWAYSBELOANED = 'CANALWAYSBELOANED';
    public const YEAR = 'YEAR';
    public const DK5 = 'DK5';
    public const AGE = 'AGE';
    public const LIX = 'LIX';
    public const LET = 'LET';
    public const GENERALAUDIENCE = 'GENERALAUDIENCE';
    public const LIBRARYRECOMMENDATION = 'LIBRARYRECOMMENDATION';
    public const GAMEPLATFORM = 'GAMEPLATFORM';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
