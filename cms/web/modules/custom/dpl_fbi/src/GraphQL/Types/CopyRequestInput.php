<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string $pid
 * @property string|null $userName
 * @property string|null $userMail
 * @property string|null $publicationTitle
 * @property string|null $publicationDateOfComponent
 * @property string|null $publicationYearOfComponent
 * @property string|null $volumeOfComponent
 * @property string|null $authorOfComponent
 * @property string|null $titleOfComponent
 * @property string|null $pagesOfComponent
 * @property string|null $userInterestDate
 * @property string|null $pickUpAgencySubdivision
 * @property string|null $issueOfComponent
 * @property string|null $openURL
 */
class CopyRequestInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $pid
     * @param string|null $userName
     * @param string|null $userMail
     * @param string|null $publicationTitle
     * @param string|null $publicationDateOfComponent
     * @param string|null $publicationYearOfComponent
     * @param string|null $volumeOfComponent
     * @param string|null $authorOfComponent
     * @param string|null $titleOfComponent
     * @param string|null $pagesOfComponent
     * @param string|null $userInterestDate
     * @param string|null $pickUpAgencySubdivision
     * @param string|null $issueOfComponent
     * @param string|null $openURL
     */
    public static function make(
        $pid,
        $userName = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userMail = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $publicationTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $publicationDateOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $publicationYearOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $volumeOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $authorOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $titleOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $pagesOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userInterestDate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $pickUpAgencySubdivision = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $issueOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $openURL = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($pid !== self::UNDEFINED) {
            $instance->pid = $pid;
        }
        if ($userName !== self::UNDEFINED) {
            $instance->userName = $userName;
        }
        if ($userMail !== self::UNDEFINED) {
            $instance->userMail = $userMail;
        }
        if ($publicationTitle !== self::UNDEFINED) {
            $instance->publicationTitle = $publicationTitle;
        }
        if ($publicationDateOfComponent !== self::UNDEFINED) {
            $instance->publicationDateOfComponent = $publicationDateOfComponent;
        }
        if ($publicationYearOfComponent !== self::UNDEFINED) {
            $instance->publicationYearOfComponent = $publicationYearOfComponent;
        }
        if ($volumeOfComponent !== self::UNDEFINED) {
            $instance->volumeOfComponent = $volumeOfComponent;
        }
        if ($authorOfComponent !== self::UNDEFINED) {
            $instance->authorOfComponent = $authorOfComponent;
        }
        if ($titleOfComponent !== self::UNDEFINED) {
            $instance->titleOfComponent = $titleOfComponent;
        }
        if ($pagesOfComponent !== self::UNDEFINED) {
            $instance->pagesOfComponent = $pagesOfComponent;
        }
        if ($userInterestDate !== self::UNDEFINED) {
            $instance->userInterestDate = $userInterestDate;
        }
        if ($pickUpAgencySubdivision !== self::UNDEFINED) {
            $instance->pickUpAgencySubdivision = $pickUpAgencySubdivision;
        }
        if ($issueOfComponent !== self::UNDEFINED) {
            $instance->issueOfComponent = $issueOfComponent;
        }
        if ($openURL !== self::UNDEFINED) {
            $instance->openURL = $openURL;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'pid' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userName' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userMail' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'publicationTitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'publicationDateOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'publicationYearOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'volumeOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'authorOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'titleOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'pagesOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userInterestDate' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'pickUpAgencySubdivision' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'issueOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'openURL' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
