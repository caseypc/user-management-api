<?php

namespace App\Entity;

use App\Enum\UserRole;
use App\Enum\UserStatus;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
#[ORM\UniqueConstraint(name: 'uniq_users_email', columns: ['email'])]
#[ORM\HasLifecycleCallbacks]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $firstName;

    #[ORM\Column(length: 100)]
    private string $lastName;

    #[ORM\Column(length: 180, unique: true)]
    private string $email;

    #[ORM\Column(enumType: UserRole::class)]
    private UserRole $role;

    #[ORM\Column(enumType: UserStatus::class)]
    private UserStatus $status;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct(
        string $firstName,
        string $lastName,
        string $email,
        UserRole $role,
        UserStatus $status
    ) {
        $now = new \DateTimeImmutable();

        $this->firstName = trim($firstName);
        $this->lastName = trim($lastName);
        $this->email = mb_strtolower(trim($email));
        $this->role = $role;
        $this->status = $status;
        $this->createdAt = $now;
        $this->updatedAt = $now;
    }

    #[ORM\PreUpdate]
    public function touchUpdatedAt(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function updateProfile(
        string $firstName,
        string $lastName,
        string $email,
        UserRole $role,
        UserStatus $status
    ): void {
        $this->firstName = trim($firstName);
        $this->lastName = trim($lastName);
        $this->email = mb_strtolower(trim($email));
        $this->role = $role;
        $this->status = $status;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getFirstName(): string { return $this->firstName; }
    public function getLastName(): string { return $this->lastName; }
    public function getEmail(): string { return $this->email; }
    public function getRole(): UserRole { return $this->role; }
    public function getStatus(): UserStatus { return $this->status; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}