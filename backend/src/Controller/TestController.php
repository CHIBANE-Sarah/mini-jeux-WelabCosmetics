<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
final class TestController extends AbstractController
{
    #[Route('/test', name: 'app_test', methods: ['GET'])]
    public function index(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $usersData = [];

        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId(),
                'login' => $user->getLogin(),
                'roles' => $user->getRoles(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
            ];
        }

        return $this->json([
            'message' => 'Liste des utilisateurs créés par les fixtures',
            'users' => $usersData,
        ]);
    }
}
