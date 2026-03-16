<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
final class LoginController extends AbstractController
{
    // Connexion de l'Admin
    #[Route('/login', name: 'app_login', methods: ['POST'])]
    public function index(Request $request, UserRepository $userRepository, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['login']) || !isset($data['password'])) {
            return $this->json(['message' => 'Login et mot de passe requis.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['login' => $data['login']]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['message' => 'Identifiants invalides.'], Response::HTTP_UNAUTHORIZED);
        }

        
        return $this->json([
            'message' => 'Connexion réussie !',
            'user' => [
                'id' => $user->getId(),
                'login' => $user->getLogin(),
                'roles' => $user->getRoles(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
            ]
        ]);
    }
}
