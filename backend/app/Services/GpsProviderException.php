<?php

namespace App\Services;

use RuntimeException;
use Throwable;

class GpsProviderException extends RuntimeException
{
    public function __construct(
        public readonly int $providerStatus,
        string $message,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}