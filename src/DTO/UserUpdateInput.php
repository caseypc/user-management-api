<?php

namespace App\DTO;

use App\Enum\UserRole;
use App\Enum\UserStatus;
use Symfony\Component\Validator\Constraints as Assert;

class UserUpdateInput
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    public string $firstName = '';

    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    public string $lastName = '';

    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Length(max: 180)]
    public string $email = '';

    #[Assert\NotBlank]
    #[Assert\Choice(callback: [UserRole::class, 'values'])]
    public string $role = '';

    #[Assert\NotBlank]
    #[Assert\Choice(callback: [UserStatus::class, 'values'])]
    public string $status = '';
}