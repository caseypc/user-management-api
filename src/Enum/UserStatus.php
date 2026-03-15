<?php

namespace App\Enum;

enum UserStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case PENDING = 'pending';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}