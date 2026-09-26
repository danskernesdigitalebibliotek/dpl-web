<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class FacetFieldEnum
{
    public const ACCESSTYPES = 'ACCESSTYPES';
    public const AGE = 'AGE';
    public const CANALWAYSBELOANED = 'CANALWAYSBELOANED';
    public const CHILDRENORADULTS = 'CHILDRENORADULTS';
    public const CREATORS = 'CREATORS';
    public const DK5 = 'DK5';
    public const FICTIONALCHARACTERS = 'FICTIONALCHARACTERS';
    public const FICTIONNONFICTION = 'FICTIONNONFICTION';
    public const GAMEPLATFORM = 'GAMEPLATFORM';
    public const GENERALAUDIENCE = 'GENERALAUDIENCE';
    public const GENREANDFORM = 'GENREANDFORM';
    public const LET = 'LET';
    public const LIBRARYRECOMMENDATION = 'LIBRARYRECOMMENDATION';
    public const LIX = 'LIX';
    public const MAINLANGUAGES = 'MAINLANGUAGES';
    public const MATERIALTYPESGENERAL = 'MATERIALTYPESGENERAL';
    public const MATERIALTYPESSPECIFIC = 'MATERIALTYPESSPECIFIC';
    public const SUBJECTS = 'SUBJECTS';
    public const WORKTYPES = 'WORKTYPES';
    public const YEAR = 'YEAR';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
