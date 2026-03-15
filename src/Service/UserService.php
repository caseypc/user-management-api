<?php

namespace App\Service;

use App\DTO\UserCreateInput;
use App\DTO\UserUpdateInput;
use App\Entity\User;
use App\Enum\UserRole;
use App\Enum\UserStatus;
use App\Exception\ApiValidationException;
use App\Exception\NotFoundException;
use App\Repository\UserRepositoryInterface;
use App\ValueObject\UserListQuery;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly ValidatorInterface $validator
    ) {
    }

    public function listPaginated(
        int $page,
        int $perPage,
        ?string $search,
        string $sortBy,
        string $sortDir
    ): array {
        return $this->users->paginate(
            new UserListQuery(
                page: $page,
                perPage: $perPage,
                search: $search,
                sortBy: $sortBy,
                sortDir: $sortDir
            )
        );
    }

    public function getById(int $id): User
    {
        $user = $this->users->findById($id);

        if (!$user) {
            throw new NotFoundException('User not found.');
        }

        return $user;
    }

    public function create(UserCreateInput $input): User
    {
        $this->validateDto($input);

        if ($this->users->findByEmail($input->email)) {
            throw new ApiValidationException([
                'email' => ['Email already exists.'],
            ]);
        }

        $user = new User(
            $input->firstName,
            $input->lastName,
            $input->email,
            UserRole::from($input->role),
            UserStatus::from($input->status)
        );

        $this->users->save($user);

        return $user;
    }

    public function update(int $id, UserUpdateInput $input): User
    {
        $this->validateDto($input);

        $user = $this->getById($id);
        $existing = $this->users->findByEmail($input->email);

        if ($existing && $existing->getId() !== $user->getId()) {
            throw new ApiValidationException([
                'email' => ['Email already exists.'],
            ]);
        }

        $user->updateProfile(
            $input->firstName,
            $input->lastName,
            $input->email,
            UserRole::from($input->role),
            UserStatus::from($input->status)
        );

        $this->users->save($user);

        return $user;
    }

    public function delete(int $id): void
    {
        $user = $this->getById($id);
        $this->users->remove($user);
    }

    private function validateDto(object $dto): void
    {
        $violations = $this->validator->validate($dto);

        if (count($violations) > 0) {
            throw new ApiValidationException($this->formatViolations($violations));
        }
    }

    private function formatViolations(ConstraintViolationListInterface $violations): array
    {
        $errors = [];

        foreach ($violations as $violation) {
            $field = (string) $violation->getPropertyPath();
            $errors[$field][] = $violation->getMessage();
        }

        return $errors;
    }
}