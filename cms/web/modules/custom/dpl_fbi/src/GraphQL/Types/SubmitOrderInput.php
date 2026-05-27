<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property array<string> $pids
 * @property string $pickUpBranch
 * @property \Drupal\dpl_fbi\GraphQL\Types\SubmitOrderUserParametersInput $userParameters
 * @property string|null $orderType
 * @property string|null $key
 * @property bool|null $exactEdition
 * @property string|null $expires
 * @property string|null $author
 * @property string|null $authorOfComponent
 * @property string|null $pagination
 * @property string|null $publicationDate
 * @property string|null $publicationDateOfComponent
 * @property string|null $title
 * @property string|null $titleOfComponent
 * @property string|null $volume
 */
class SubmitOrderInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param array<string> $pids
     * @param string $pickUpBranch
     * @param \Drupal\dpl_fbi\GraphQL\Types\SubmitOrderUserParametersInput $userParameters
     * @param string|null $orderType
     * @param string|null $key
     * @param bool|null $exactEdition
     * @param string|null $expires
     * @param string|null $author
     * @param string|null $authorOfComponent
     * @param string|null $pagination
     * @param string|null $publicationDate
     * @param string|null $publicationDateOfComponent
     * @param string|null $title
     * @param string|null $titleOfComponent
     * @param string|null $volume
     */
    public static function make(
        $pids,
        $pickUpBranch,
        $userParameters,
        $orderType = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $key = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $exactEdition = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $expires = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $author = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $authorOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $pagination = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $publicationDate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $publicationDateOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $titleOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $volume = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($pids !== self::UNDEFINED) {
            $instance->pids = $pids;
        }
        if ($pickUpBranch !== self::UNDEFINED) {
            $instance->pickUpBranch = $pickUpBranch;
        }
        if ($userParameters !== self::UNDEFINED) {
            $instance->userParameters = $userParameters;
        }
        if ($orderType !== self::UNDEFINED) {
            $instance->orderType = $orderType;
        }
        if ($key !== self::UNDEFINED) {
            $instance->key = $key;
        }
        if ($exactEdition !== self::UNDEFINED) {
            $instance->exactEdition = $exactEdition;
        }
        if ($expires !== self::UNDEFINED) {
            $instance->expires = $expires;
        }
        if ($author !== self::UNDEFINED) {
            $instance->author = $author;
        }
        if ($authorOfComponent !== self::UNDEFINED) {
            $instance->authorOfComponent = $authorOfComponent;
        }
        if ($pagination !== self::UNDEFINED) {
            $instance->pagination = $pagination;
        }
        if ($publicationDate !== self::UNDEFINED) {
            $instance->publicationDate = $publicationDate;
        }
        if ($publicationDateOfComponent !== self::UNDEFINED) {
            $instance->publicationDateOfComponent = $publicationDateOfComponent;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        if ($titleOfComponent !== self::UNDEFINED) {
            $instance->titleOfComponent = $titleOfComponent;
        }
        if ($volume !== self::UNDEFINED) {
            $instance->volume = $volume;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'pids' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'pickUpBranch' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userParameters' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Types\SubmitOrderUserParametersInput),
            'orderType' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\EnumConverter),
            'key' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'exactEdition' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            'expires' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'author' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'authorOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'pagination' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'publicationDate' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'publicationDateOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'title' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'titleOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'volume' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
