<?php

namespace App\Controller;

use App\Entity\Session;
use App\Entity\Game;
use App\Repository\SessionRepository;
use App\Repository\ParticipationRepository;
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
    /**
     * POST /api/session
     *
     * CORRECTION BUG #3 :
     * Le frontend envoie la durée en MINUTES (ex: 45 pour 45 minutes).
     * La BDD stocke en SECONDES (les fixtures ont 900 = 15 min, 600 = 10 min, etc.)
     * On multiplie par 60 à la réception pour uniformiser.
     */
    #[Route('/session', name: 'app_session_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(
        Request $request,
        SessionRepository $sessionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $admin = $this->getUser();
        if (!$admin) {
            return $this->json(['message' => 'Non autorisé.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['titre']) || !isset($data['duree'])) {
            return $this->json(
                ['message' => 'Les champs "titre" et "duree" sont requis.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $session = new Session();
        $session->setTitreSession($data['titre']);
        // CORRECTION : le frontend envoie des minutes, on stocke en secondes
        $session->setDuree((int) $data['duree'] * 60);
        $session->setCreateur($admin);

        // Génération du code unique à 6 caractères
        do {
            $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
        } while ($sessionRepository->findOneBy(['codeSession' => $code]) !== null);

        $session->setCodeSession($code);

        $gameTypes = $data['gameTypes'] ?? [
            Game::TYPE_ASSOCIATION,
            Game::TYPE_CROSSWORD,
            Game::TYPE_FORMULATION,
        ];

        $validTypes = [Game::TYPE_ASSOCIATION, Game::TYPE_CROSSWORD, Game::TYPE_FORMULATION];
        $gameTypes  = array_unique(array_filter($gameTypes, fn($t) => in_array($t, $validTypes)));

        if (empty($gameTypes)) {
            return $this->json(['message' => 'Sélectionnez au moins un jeu.'], Response::HTTP_BAD_REQUEST);
        }

        foreach ($gameTypes as $type) {
            $game = new Game();
            $game->setType($type);
            $session->addGame($game);
            $entityManager->persist($game);
        }

        $entityManager->persist($session);
        $entityManager->flush();

        return $this->json([
            'message' => 'Session créée avec succès !',
            'session' => $this->serializeSession($session),
        ], Response::HTTP_CREATED);
    }

    #[Route('/sessions', name: 'app_session_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function list(SessionRepository $sessionRepository): JsonResponse
    {
        $sessions = $sessionRepository->findBy(
            ['createur' => $this->getUser()],
            ['id' => 'DESC']
        );

        return $this->json(array_map([$this, 'serializeSession'], $sessions));
    }

    #[Route('/session/{code}', name: 'app_session_get', methods: ['GET'])]
    public function getSession(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);
        if (!$session) {
            return $this->json(
                ['message' => 'Session introuvable avec ce code.'],
                Response::HTTP_NOT_FOUND
            );
        }

        return $this->json($this->serializeSession($session));
    }

    #[Route('/session/{code}/games', name: 'app_session_games', methods: ['GET'])]
    public function getSessionGames(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);
        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], Response::HTTP_NOT_FOUND);
        }

        $games = $session->getGames()->toArray();

        return $this->json(array_map(function (Game $game) {
            return [
                'id'        => $game->getId(),
                'type'      => $game->getType(),
                'sessionId' => $game->getSession()->getId(),
            ];
        }, $games));
    }

    #[Route('/session/{code}/join', name: 'app_session_join', methods: ['POST'])]
    public function joinSession(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);
        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'message'   => 'Session rejointe',
            'code'      => $session->getCodeSession(),
            'sessionId' => $session->getId(),
        ]);
    }

    #[Route('/stats/dashboard', name: 'app_dashboard_stats', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function dashboardStats(
        SessionRepository $sessionRepository,
        ParticipationRepository $participationRepository
    ): JsonResponse {
        $averageScore    = $participationRepository->getAverageScore();
        $averageDuration = $participationRepository->getAverageDuration();

        return $this->json([
            'totalSessions'     => $sessionRepository->count([]),
            'totalParticipants' => $participationRepository->count([]),
            'averageScore'      => $averageScore !== null ? round($averageScore) : 0,
            'averageTime'       => $averageDuration !== null ? round($averageDuration / 60) : 0,
        ]);
    }

    private function serializeSession(Session $session): array
    {
        return [
            'id'             => $session->getId(),
            'titre'          => $session->getTitreSession(),
            'code'           => $session->getCodeSession(),
            'duree'          => $session->getDuree(), // en secondes
            'createur'       => $session->getCreateur()?->getLogin(),
            'nbParticipants' => $session->getParticipations()->count(),
        ];
    }
}