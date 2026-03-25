<?php

namespace App\Controller;

use App\Entity\Session;
use App\Entity\Game;
use App\Repository\SessionRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class SessionController extends AbstractController
{   
    // Création de la session par l'Admin
    #[Route('/session', name: 'app_session_create', methods: ['POST'])]
    #[IsGranted(['ROLE_ADMIN'])]
    public function create(Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse {
       
        $admin = $this->getUser();
        
        if (!$admin) {
            return $this->json(['message' => 'Non autorisé.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['titre']) || !isset($data['duree'])) {
            return $this->json(['message' => 'Les champs "titre" et "duree" sont requis.'], Response::HTTP_BAD_REQUEST);
        }

        $session = new Session();
        $session->setTitreSession($data['titre']);
        $session->setDuree($data['duree']);
        $session->setCreateur($admin);
        $session->setCodeSession(strtoupper(substr(bin2hex(random_bytes(4)), 0, 6)));

        $game = new Game();
        $game->setType(Game::TYPE_ASSOCIATION);
        $session->addGame($game);
        $entityManager->persist($game);

        $entityManager->persist($session);
        $entityManager->flush();

        return $this->json([
            'message' => 'Session créée avec succès !',
            'session' => $this->serializeSession($session)
        ], Response::HTTP_CREATED);
    }

    // Avoir la liste des sessions crées par l'Admin
    #[Route('/sessions', name: 'app_session_list', methods: ['GET'])]
    public function list(SessionRepository $sessionRepository): JsonResponse
    {
        return $this->json(array_map([$this, 'serializeSession'], $sessionRepository->findAll()));
    }

    // Récupérer une session par son code
    #[Route('/session/{code}', name: 'app_session_get', methods: ['GET'])]
    public function getSession(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        $session = $sessionRepository->findOneBy(['codeSession' => $code]);

        if (!$session) {
            return $this->json(['message' => 'Session introuvable avec ce code.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializeSession($session));
    }

    private function serializeSession(Session $session): array
    {
        return [
            'id' => $session->getId(),
            'titre' => $session->getTitreSession(),
            'code' => $session->getCodeSession(),
            'duree' => $session->getDuree(),
            'createur' => $session->getCreateur()?->getLogin(),
        ];
    }

    #[Route('/session/{code}/games', name: 'app_session_games', methods: ['GET'])]
    public function getSessionGames(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        $session = $sessionRepository->findOneBy(['codeSession' => $code]);

        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], Response::HTTP_NOT_FOUND);
        }

        $games = $session->getGames()->toArray();
        
        return $this->json(array_map(function($game) {
            return [
                'id' => $game->getId(),
                'type' => $game->getType(),
                'sessionId' => $game->getSession()->getId()
            ];
        }, $games));
    }

    #[Route('/session/{code}/join', name: 'app_session_join', methods: ['POST'])]
    public function joinSession(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        $session = $sessionRepository->findOneBy(['codeSession' => $code]);

        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], 404);
        }

        return $this->json([
            'message' => 'Session rejointe',
            'code' => $session->getCodeSession(),
            'sessionId' => $session->getId()
        ]);
    }

}