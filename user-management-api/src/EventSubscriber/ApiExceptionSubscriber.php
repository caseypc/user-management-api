<?php

namespace App\EventSubscriber;

use App\Exception\ApiValidationException;
use App\Exception\NotFoundException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\KernelInterface;

final class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly KernelInterface $kernel
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => 'onException',
        ];
    }

    public function onException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();

        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $exception = $event->getThrowable();

        if ($exception instanceof ApiValidationException) {
            $event->setResponse(new JsonResponse([
                'message' => $exception->getMessage(),
                'errors' => $exception->getErrors(),
            ], 422));
            return;
        }

        if ($exception instanceof NotFoundException) {
            $event->setResponse(new JsonResponse([
                'message' => $exception->getMessage(),
            ], 404));
            return;
        }

        if ($exception instanceof \InvalidArgumentException) {
            $event->setResponse(new JsonResponse([
                'message' => $exception->getMessage(),
            ], 400));
            return;
        }

        if ($this->kernel->getEnvironment() === 'dev') {
            $event->setResponse(new JsonResponse([
                'message' => $exception->getMessage(),
                'exception' => $exception::class,
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ], 500));
            return;
        }

        $event->setResponse(new JsonResponse([
            'message' => 'Internal server error.',
        ], 500));
    }
}