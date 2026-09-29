<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string $pickUpBranch
 * @property array<string> $pids
 * @property \Drupal\dpl_fbi\GraphQL\Types\SubmitOrderUserParametersInput $userParameters
 * @property string|null $author
 * @property string|null $authorOfComponent
 * @property bool|null $exactEdition
 * @property string|null $expires
 * @property string|null $key
 * @property string|null $orderType
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
     * @param string $pickUpBranch
     * @param array<string> $pids
     * @param \Drupal\dpl_fbi\GraphQL\Types\SubmitOrderUserParametersInput $userParameters
     * @param string|null $author
     * @param string|null $authorOfComponent
     * @param bool|null $exactEdition
     * @param string|null $expires
     * @param string|null $key
     * @param string|null $orderType
     * @param string|null $pagination
     * @param string|null $publicationDate
     * @param string|null $publicationDateOfComponent
     * @param string|null $title
     * @param string|null $titleOfComponent
     * @param string|null $volume
     */
    public static function make(
        $pickUpBranch,
        $pids,
        $userParameters,
        $author = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $authorOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $exactEdition = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $expires = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $key = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $orderType = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $pagination = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $publicationDate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $publicationDateOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $titleOfComponent = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $volume = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($pickUpBranch !== self::UNDEFINED) {
            $instance->__set('pickUpBranch', $pickUpBranch);
        }
        if ($pids !== self::UNDEFINED) {
            $instance->__set('pids', $pids);
        }
        if ($userParameters !== self::UNDEFINED) {
            $instance->__set('userParameters', $userParameters);
        }
        if ($author !== self::UNDEFINED) {
            $instance->__set('author', $author);
        }
        if ($authorOfComponent !== self::UNDEFINED) {
            $instance->__set('authorOfComponent', $authorOfComponent);
        }
        if ($exactEdition !== self::UNDEFINED) {
            $instance->__set('exactEdition', $exactEdition);
        }
        if ($expires !== self::UNDEFINED) {
            $instance->__set('expires', $expires);
        }
        if ($key !== self::UNDEFINED) {
            $instance->__set('key', $key);
        }
        if ($orderType !== self::UNDEFINED) {
            $instance->__set('orderType', $orderType);
        }
        if ($pagination !== self::UNDEFINED) {
            $instance->__set('pagination', $pagination);
        }
        if ($publicationDate !== self::UNDEFINED) {
            $instance->__set('publicationDate', $publicationDate);
        }
        if ($publicationDateOfComponent !== self::UNDEFINED) {
            $instance->__set('publicationDateOfComponent', $publicationDateOfComponent);
        }
        if ($title !== self::UNDEFINED) {
            $instance->__set('title', $title);
        }
        if ($titleOfComponent !== self::UNDEFINED) {
            $instance->__set('titleOfComponent', $titleOfComponent);
        }
        if ($volume !== self::UNDEFINED) {
            $instance->__set('volume', $volume);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'pickUpBranch' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'pids' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'userParameters' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Types\SubmitOrderUserParametersInput),
            'author' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'authorOfComponent' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'exactEdition' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            'expires' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'key' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'orderType' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\EnumConverter),
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
