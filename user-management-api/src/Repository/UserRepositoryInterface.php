<?php

namespace App\Repository;

use App\Entity\User;
use App\ValueObject\UserListQuery;

interface UserRepositoryInterface
{
    /**
     * @return array{items: User[], total: int, page: int, perPage: int}
     */
    public function paginate(UserListQuery $query): array;

    public function findById(int $id): ?User;

    public function findByEmail(string $email): ?User;

    public function save(User $user): void;

    public function remove(User $user): void;
}