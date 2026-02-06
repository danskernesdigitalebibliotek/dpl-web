<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class NoteTypeEnum
{
    public const CONNECTION_TO_OTHER_WORKS = 'CONNECTION_TO_OTHER_WORKS';
    public const DESCRIPTION_OF_MATERIAL = 'DESCRIPTION_OF_MATERIAL';
    public const DISSERTATION = 'DISSERTATION';
    public const MUSICAL_ENSEMBLE_OR_CAST = 'MUSICAL_ENSEMBLE_OR_CAST';
    public const NOT_SPECIFIED = 'NOT_SPECIFIED';
    public const OCCASION_FOR_PUBLICATION = 'OCCASION_FOR_PUBLICATION';
    public const ORIGINAL_TITLE = 'ORIGINAL_TITLE';
    public const ORIGINAL_VERSION = 'ORIGINAL_VERSION';
    public const REFERENCES = 'REFERENCES';
    public const RESTRICTIONS_ON_USE = 'RESTRICTIONS_ON_USE';
    public const TYPE_OF_SCORE = 'TYPE_OF_SCORE';
    public const FREQUENCY = 'FREQUENCY';
    public const EDITION = 'EDITION';
    public const TECHNICAL_REQUIREMENTS = 'TECHNICAL_REQUIREMENTS';
    public const ESTIMATED_PLAYING_TIME_FOR_GAMES = 'ESTIMATED_PLAYING_TIME_FOR_GAMES';
    public const EXPECTED_PUBLICATION_DATE = 'EXPECTED_PUBLICATION_DATE';
    public const WITHDRAWN_PUBLICATION = 'WITHDRAWN_PUBLICATION';
    public const CONTAINS_AI_GENERATED_CONTENT = 'CONTAINS_AI_GENERATED_CONTENT';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
