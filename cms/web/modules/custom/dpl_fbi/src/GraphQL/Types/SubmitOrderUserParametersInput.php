<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string|null $cpr
 * @property string|null $userId
 * @property string|null $barcode
 * @property string|null $cardno
 * @property string|null $customId
 * @property string|null $pincode
 * @property string|null $userDateOfBirth
 * @property string|null $userName
 * @property string|null $userAddress
 * @property string|null $userMail
 * @property string|null $userTelephone
 */
class SubmitOrderUserParametersInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $cpr
     * @param string|null $userId
     * @param string|null $barcode
     * @param string|null $cardno
     * @param string|null $customId
     * @param string|null $pincode
     * @param string|null $userDateOfBirth
     * @param string|null $userName
     * @param string|null $userAddress
     * @param string|null $userMail
     * @param string|null $userTelephone
     */
    public static function make(
        $cpr = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $barcode = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $cardno = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $customId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $pincode = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userDateOfBirth = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userName = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userAddress = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userMail = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $userTelephone = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($cpr !== self::UNDEFINED) {
            $instance->cpr = $cpr;
        }
        if ($userId !== self::UNDEFINED) {
            $instance->userId = $userId;
        }
        if ($barcode !== self::UNDEFINED) {
            $instance->barcode = $barcode;
        }
        if ($cardno !== self::UNDEFINED) {
            $instance->cardno = $cardno;
        }
        if ($customId !== self::UNDEFINED) {
            $instance->customId = $customId;
        }
        if ($pincode !== self::UNDEFINED) {
            $instance->pincode = $pincode;
        }
        if ($userDateOfBirth !== self::UNDEFINED) {
            $instance->userDateOfBirth = $userDateOfBirth;
        }
        if ($userName !== self::UNDEFINED) {
            $instance->userName = $userName;
        }
        if ($userAddress !== self::UNDEFINED) {
            $instance->userAddress = $userAddress;
        }
        if ($userMail !== self::UNDEFINED) {
            $instance->userMail = $userMail;
        }
        if ($userTelephone !== self::UNDEFINED) {
            $instance->userTelephone = $userTelephone;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'cpr' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'barcode' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'cardno' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'customId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'pincode' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userDateOfBirth' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userName' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userAddress' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userMail' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'userTelephone' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
