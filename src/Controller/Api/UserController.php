<?php

namespace App\Controller\Api;

use App\DTO\UserCreateInput;
use App\DTO\UserUpdateInput;
use App\Entity\User;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
class UserController extends AbstractController
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = max(1, min((int) $request->query->get('perPage', 10), 100));
        $search = $request->query->get('search');
        $sortBy = (string) $request->query->get('sortBy', 'createdAt');
        $sortDir = (string) $request->query->get('sortDir', 'DESC');

        $result = $this->userService->listPaginated(
            page: $page,
            perPage: $perPage,
            search: is_string($search) ? $search : null,
            sortBy: $sortBy,
            sortDir: $sortDir
        );

        return $this->json([
            'data' => array_map([$this, 'normalizeUser'], $result['items']),
            'meta' => [
                'page' => $result['page'],
                'perPage' => $result['perPage'],
                'total' => $result['total'],
                'totalPages' => (int) ceil($result['total'] / $result['perPage']),
                'search' => $search,
                'sortBy' => $sortBy,
                'sortDir' => strtoupper($sortDir) === 'ASC' ? 'ASC' : 'DESC',
            ],
        ]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getById($id);

        return $this->json([
            'data' => $this->normalizeUser($user),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function store(Request $request): JsonResponse
    {
        $payload = $this->decodeJson($request);

        $input = new UserCreateInput();
        $input->firstName = (string) ($payload['firstName'] ?? '');
        $input->lastName = (string) ($payload['lastName'] ?? '');
        $input->email = (string) ($payload['email'] ?? '');
        $input->role = (string) ($payload['role'] ?? '');
        $input->status = (string) ($payload['status'] ?? '');

        $user = $this->userService->create($input);

        return $this->json([
            'message' => 'User created successfully.',
            'data' => $this->normalizeUser($user),
        ], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $payload = $this->decodeJson($request);

        $input = new UserUpdateInput();
        $input->firstName = (string) ($payload['firstName'] ?? '');
        $input->lastName = (string) ($payload['lastName'] ?? '');
        $input->email = (string) ($payload['email'] ?? '');
        $input->role = (string) ($payload['role'] ?? '');
        $input->status = (string) ($payload['status'] ?? '');

        $user = $this->userService->update($id, $input);

        return $this->json([
            'message' => 'User updated successfully.',
            'data' => $this->normalizeUser($user),
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function destroy(int $id): JsonResponse
    {
        $this->userService->delete($id);

        return $this->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    private function decodeJson(Request $request): array
    {
        $content = trim((string) $request->getContent());

        if ($content === '') {
            throw new \InvalidArgumentException('Request body must not be empty.');
        }

        $data = json_decode($content, true);

        if (!is_array($data)) {
            throw new \InvalidArgumentException('Invalid JSON body.');
        }

        return $data;
    }

    private function normalizeUser(User $user): array
    {
        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'role' => $user->getRole()->value,
            'status' => $user->getStatus()->value,
            'createdAt' => $user->getCreatedAt()->format(DATE_ATOM),
            'updatedAt' => $user->getUpdatedAt()->format(DATE_ATOM),
        ];
    }
}