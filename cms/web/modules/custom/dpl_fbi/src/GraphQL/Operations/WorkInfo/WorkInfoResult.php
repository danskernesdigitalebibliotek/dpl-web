<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo;

class WorkInfoResult extends \Spawnia\Sailor\Result
{
    public ?WorkInfo $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = WorkInfo::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(WorkInfo $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): WorkInfoErrorFreeResult
    {
        return WorkInfoErrorFreeResult::fromResult($this);
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
