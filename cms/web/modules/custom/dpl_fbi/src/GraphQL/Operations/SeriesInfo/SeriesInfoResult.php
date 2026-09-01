<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo;

class SeriesInfoResult extends \Spawnia\Sailor\Result
{
    public ?SeriesInfo $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = SeriesInfo::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(SeriesInfo $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): SeriesInfoErrorFreeResult
    {
        return SeriesInfoErrorFreeResult::fromResult($this);
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../sailor.php');
    }
}
