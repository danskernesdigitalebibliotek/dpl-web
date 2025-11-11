<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ReviewElementTypeEnum
{
    public const ABSTRACT = 'ABSTRACT';
    public const ACQUISITION_RECOMMENDATIONS = 'ACQUISITION_RECOMMENDATIONS';
    public const AUDIENCE = 'AUDIENCE';
    public const CONCLUSION = 'CONCLUSION';
    public const DESCRIPTION = 'DESCRIPTION';
    public const EVALUATION = 'EVALUATION';
    public const SIMILAR_MATERIALS = 'SIMILAR_MATERIALS';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
