<?php

namespace App\ValueObject;

final class UserListQuery
{
    public function __construct(
        public readonly int $page = 1,
        public readonly int $perPage = 10,
        public readonly ?string $search = null,
        public readonly string $sortBy = 'createdAt',
        public readonly string $sortDir = 'DESC',
    ) {
    }
}