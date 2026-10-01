<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class SubjectTypeEnum
{
    public const CORPORATION = 'CORPORATION';
    public const ENVIRONMENT = 'ENVIRONMENT';
    public const FICTIONAL_CHARACTER = 'FICTIONAL_CHARACTER';
    public const FICTIONAL_LOCATION = 'FICTIONAL_LOCATION';
    public const FILM_NATIONALITY = 'FILM_NATIONALITY';
    public const LAESEKOMPASSET = 'LAESEKOMPASSET';
    public const LIBRARY_OF_CONGRESS_SUBJECT_HEADING = 'LIBRARY_OF_CONGRESS_SUBJECT_HEADING';
    public const LOCATION = 'LOCATION';
    public const MEDICAL_SUBJECT_HEADING = 'MEDICAL_SUBJECT_HEADING';
    public const MOOD = 'MOOD';
    public const MOOD_CHILDREN = 'MOOD_CHILDREN';
    public const MUSICAL_INSTRUMENTATION = 'MUSICAL_INSTRUMENTATION';
    public const MUSIC_COUNTRY_OF_ORIGIN = 'MUSIC_COUNTRY_OF_ORIGIN';
    public const MUSIC_TIME_PERIOD = 'MUSIC_TIME_PERIOD';
    public const NATIONAL_AGRICULTURAL_LIBRARY = 'NATIONAL_AGRICULTURAL_LIBRARY';
    public const PERSON = 'PERSON';
    public const PERSPECTIVE = 'PERSPECTIVE';
    public const REALITY = 'REALITY';
    public const STYLE = 'STYLE';
    public const TEMPO = 'TEMPO';
    public const TIME_PERIOD = 'TIME_PERIOD';
    public const TITLE = 'TITLE';
    public const TOPIC = 'TOPIC';
    public const TOPIC_CHILDREN = 'TOPIC_CHILDREN';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
