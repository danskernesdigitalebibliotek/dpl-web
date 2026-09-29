<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string $materialId
 * @property string|null $agencyId
 * @property mixed|null $loanedAt
 * @property mixed|null $returnedAt
 */
class PatronHistoricalLoanInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $materialId
     * @param string|null $agencyId
     * @param mixed|null $loanedAt
     * @param mixed|null $returnedAt
     */
    public static function make(
        $materialId,
        $agencyId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $loanedAt = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $returnedAt = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($materialId !== self::UNDEFINED) {
            $instance->__set('materialId', $materialId);
        }
        if ($agencyId !== self::UNDEFINED) {
            $instance->__set('agencyId', $agencyId);
        }
        if ($loanedAt !== self::UNDEFINED) {
            $instance->__set('loanedAt', $loanedAt);
        }
        if ($returnedAt !== self::UNDEFINED) {
            $instance->__set('returnedAt', $returnedAt);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'materialId' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'agencyId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'loanedAt' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ScalarConverter),
            'returnedAt' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ScalarConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
