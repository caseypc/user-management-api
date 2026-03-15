<?php

namespace App\Enum;

enum UserRole: string
{
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case USER = 'user';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}