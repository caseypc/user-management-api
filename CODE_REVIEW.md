# CODE REVIEW

## SAMPLE A
### What is the performance problem with this code?
The code has an N+1 query problem. It loads all users, then foreach user it runs three additional queries. More users, more queries, more problems.
Using SQL COUNT may help as well.
date format is incorrect, should be 'Y-m-d H:i'
### How many database queries will this execute for 100 users?
1 + (3 * 100) = 301 queries 
### Provide a refactored solution.
```php
<?php

class UserController extends AbstractController
{
    #[Route('/api/users/with-activity', methods: ['GET'])]
    public function getUsersWithActivity(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();
        $result = [];

        if ($users === []) {
            return $this->json($result);
        }

        // Build id map
        $userIds = [];
        foreach ($users as $user) {
            $userIds[] = $user->getId();
        }

        // Active study counts
        $studyRows = $em->createQueryBuilder()
            ->select('IDENTITY(sa.user) AS userId, COUNT(sa.id) AS total')
            ->from(StudyAssignment::class, 'sa')
            ->where('sa.user IN (:userIds)')
            ->andWhere('sa.active = :active')
            ->groupBy('sa.user')
            ->setParameter('userIds', $userIds)
            ->setParameter('active', true)
            ->getQuery()
            ->getArrayResult();

        $studyCounts = [];
        foreach ($studyRows as $row) {
            $studyCounts[(int) $row['userId']] = (int) $row['total'];
        }

        // Pending task counts
        $taskRows = $em->createQueryBuilder()
            ->select('IDENTITY(t.assignedTo) AS userId, COUNT(t.id) AS total')
            ->from(Task::class, 't')
            ->where('t.assignedTo IN (:userIds)')
            ->andWhere('t.status = :status')
            ->groupBy('t.assignedTo')
            ->setParameter('userIds', $userIds)
            ->setParameter('status', 'PENDING')
            ->getQuery()
            ->getArrayResult();

        $taskCounts = [];
        foreach ($taskRows as $row) {
            $taskCounts[(int) $row['userId']] = (int) $row['total'];
        }

        // Recent logins
        $loginRows = $em->createQueryBuilder()
            ->select('IDENTITY(l.user) AS userId, l.loginAt AS loginAt')
            ->from(LoginHistory::class, 'l')
            ->where('l.user IN (:userIds)')
            ->orderBy('l.user', 'ASC')
            ->addOrderBy('l.loginAt', 'DESC')
            ->setParameter('userIds', $userIds)
            ->getQuery()
            ->getArrayResult();

        $recentLoginsByUser = [];
        foreach ($loginRows as $row) {
            $userId = (int) $row['userId'];

            if (!isset($recentLoginsByUser[$userId])) {
                $recentLoginsByUser[$userId] = [];
            }

            // Keep 5 latest
            if (count($recentLoginsByUser[$userId]) < 5) {
                $recentLoginsByUser[$userId][] = $row['loginAt']->format('Y-m-d H:i');
            }
        }

        // Build response
        foreach ($users as $user) {
            $userId = $user->getId();

            $result[] = [
                'id' => $userId,
                'name' => $user->getFullName(),
                'email' => $user->getEmail(),
                'recentLogins' => $recentLoginsByUser[$userId] ?? [],
                'activeStudies' => $studyCounts[$userId] ?? 0,
                'pendingTasks' => $taskCounts[$userId] ?? 0,
            ];
        }

        return $this->json($result);
    }
}
```



## SAMPLE B
## List all the issues you can identify (there are at least 6)
1. It crashes on first render - USER starts as null
2. No typing for state data
3. Loading state exists but is never used correctly - initialized, but never set to true/false around requests
4. No error handling - no try/catch, no response.ok checks
5. updateTaskStatus does not await the PUT request - UI is mutated immediately before the server confirms success
6. Direct DOM manipulation is used

## Provide a refactored version addressing these issues
```typescript
import React, { useEffect, useState } from 'react';

// Types keep the component predictable and easier to maintain.
type User = {
    id: number;
    name: string;
};

type Study = {
    id: number;
    name: string;
};

type Task = {
    id: number;
    title: string;
    status: string;
};

type UserDashboardProps = {
    userId: number | string;
};

export default function UserDashboard({ userId }: UserDashboardProps) {
    const [user, setUser] = useState<User | null>(null);
    const [studies, setStudies] = useState<Study[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingTaskIds, setUpdatingTaskIds] = useState<number[]>([]);

    useEffect(() => {
        let isCancelled = false;

        // Load all data together
        async function loadDashboard(): Promise<void> {
            setLoading(true);
            setError(null);

            try {
                const [userRes, studiesRes, tasksRes] = await Promise.all([
                    fetch(`/api/users/${userId}`),
                    fetch(`/api/users/${userId}/studies`),
                    fetch(`/api/users/${userId}/tasks`),
                ]);

                if (!userRes.ok || !studiesRes.ok || !tasksRes.ok) {
                    throw new Error('Failed to load dashboard data.');
                }

                const [userData, studiesData, tasksData] = await Promise.all([
                    userRes.json(),
                    studiesRes.json(),
                    tasksRes.json(),
                ]);

                if (isCancelled) {
                    return;
                }

                setUser(userData);
                setStudies(studiesData);
                setTasks(tasksData);
            } catch (err) {
                if (!isCancelled) {
                    setError(err instanceof Error ? err.message : 'Unexpected error occurred.');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            isCancelled = true;
        };
    }, [userId]);

    // Update state / No direct DOM manipulation.
    async function updateTaskStatus(taskId: number, status: string): Promise<void> {
        setUpdatingTaskIds((prev) => [...prev, taskId]);
        setError(null);

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                throw new Error('Failed to update task status.');
            }

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId
                        ? { ...task, status }
                        : task
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error occurred.');
        } finally {
            setUpdatingTaskIds((prev) => prev.filter((id) => id !== taskId));
        }
    }

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (error !== null) {
        return <div role="alert">{error}</div>;
    }

    return (
        <div>
            {/* safe null access */}
            <h1>{user?.name ?? 'User Dashboard'}</h1>

            <div>
                {studies.map((study) => (
                    <div key={study.id}>{study.name}</div>
                ))}
            </div>

            <div>
                {tasks.map((task) => {
                    const isUpdating = updatingTaskIds.includes(task.id);
                    const isDone = task.status === 'DONE';

                    return (
                        <div
                            key={task.id}
                            className={isDone ? 'completed' : ''}
                        >
                            <span>{task.title}</span>

                            <button
                                type="button"
                                onClick={() => updateTaskStatus(task.id, 'DONE')}
                                disabled={isUpdating || isDone}
                            >
                                {isUpdating ? 'Saving...' : isDone ? 'Completed' : 'Complete'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
```



## SAMPLE C: Service Layer Anti-patterns
### What SOLID principles does this violate?
1. Single Responsibility Principle (SRP)
2. Dependency Inversion Principle (DIP)
3. Open/Closed Principle (OCP)
### What will happen if the CRM API is slow or down?
 - user creation request may timeout
 - system is may be inconsistent - user may be created in DB but not in CRM, email may be sent but CRM fails, etc.
### How would you refactor this for better maintainability and reliability?
```php
<?php

class UserService
{
    public function __construct(
        private EntityManagerInterface $em,
        private WelcomeMailerInterface $welcomeMailer,
        private CrmClientInterface $crmClient,
        private LoggerInterface $logger
    ) {
    }

    public function createUser(array $data): User
    {
        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setRole($data['role']);
        $user->setStatus('PENDING');
        $user->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($user);
        $this->em->flush();

        try {
            // Use lib over curl
            $this->welcomeMailer->sendWelcomeEmail($user->getEmail(), $user->getFirstName());
        } catch (\Throwable $e) {
            $this->logger->error('Welcome email failed.', ['userId' => $user->getId(), 'exception' => $e]);
        }

        try {
            $this->crmClient->createContact(
                $user->getEmail(),
                $user->getFullName()
            );
        } catch (\Throwable $e) {
            $this->logger->error('CRM sync failed.', ['userId' => $user->getId(), 'exception' => $e]);
        }

        $this->logger->info('User created.', ['userId' => $user->getId(), 'email' => $user->getEmail()  ]);

        return $user;
    }
}
```

