<?php

namespace App\Repository;

use App\Entity\User;
use App\ValueObject\UserListQuery;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class DoctrineUserRepository extends ServiceEntityRepository implements UserRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function paginate(UserListQuery $query): array
    {
        $page = max(1, $query->page);
        $perPage = max(1, min($query->perPage, 100));
        $offset = ($page - 1) * $perPage;

        $allowedSorts = [
            'id' => 'u.id',
            'firstName' => 'u.firstName',
            'lastName' => 'u.lastName',
            'email' => 'u.email',
            'role' => 'u.role',
            'status' => 'u.status',
            'createdAt' => 'u.createdAt',
            'updatedAt' => 'u.updatedAt',
        ];

        $sortField = $allowedSorts[$query->sortBy] ?? 'u.createdAt';
        $sortDir = strtoupper($query->sortDir) === 'ASC' ? 'ASC' : 'DESC';
        $search = trim((string) $query->search);

        $qb = $this->createQueryBuilder('u');

        if ($search !== '') {
            $qb
                ->andWhere('LOWER(u.firstName) LIKE :search
                    OR LOWER(u.lastName) LIKE :search
                    OR LOWER(u.email) LIKE :search
                    OR LOWER(u.role) LIKE :search
                    OR LOWER(u.status) LIKE :search')
                ->setParameter('search', '%' . mb_strtolower($search) . '%');
        }

        $items = (clone $qb)
            ->orderBy($sortField, $sortDir)
            ->setFirstResult($offset)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $total = (int) (clone $qb)
            ->select('COUNT(u.id)')
            ->getQuery()
            ->getSingleScalarResult();

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
        ];
    }

    public function findById(int $id): ?User
    {
        return $this->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->findOneBy(['email' => mb_strtolower(trim($email))]);
    }

    public function save(User $user): void
    {
        $em = $this->getEntityManager();
        $em->persist($user);
        $em->flush();
    }

    public function remove(User $user): void
    {
        $em = $this->getEntityManager();
        $em->remove($user);
        $em->flush();
    }
}