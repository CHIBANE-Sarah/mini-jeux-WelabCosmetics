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

        if (empty($data['titre'])) {
            return $this->json(
                ['message' => 'Le champ "titre" est requis.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $session = new Session();
        $session->setTitreSession($data['titre']);
        $session->setDuree(0);
        $session->setCreateur($admin);

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
        $gameTypes = array_values(array_unique(array_filter(
            $gameTypes,
            fn($t) => in_array($t, $validTypes, true)
        )));

        if (empty($gameTypes)) {
            return $this->json(['message' => 'Sélectionnez au moins un jeu.'], Response::HTTP_BAD_REQUEST);
        }

        $defaultDurations = [
            Game::TYPE_ASSOCIATION => 10,
            Game::TYPE_CROSSWORD => 15,
            Game::TYPE_FORMULATION => 20,
        ];

        $gameDurations = $data['gameDurations'] ?? [];
        $totalDurationSeconds = 0;

        foreach ($gameTypes as $type) {
            $game = new Game();
            $game->setType($type);

            $durationMinutes = (int) ($gameDurations[$type] ?? $defaultDurations[$type] ?? 10);
            $durationSeconds = max(1, $durationMinutes) * 60;
            $game->setDuree($durationSeconds);
            $totalDurationSeconds += $durationSeconds;

            $session->addGame($game);
            $entityManager->persist($game);

            if ($type === Game::TYPE_ASSOCIATION) {
                $firstQuestion = $entityManager
                    ->getRepository(\App\Entity\AssociationQuestion::class)
                    ->findOneBy([]);

                if ($firstQuestion && $firstQuestion->getGame()) {
                    $defaultQuestions = $entityManager
                        ->getRepository(\App\Entity\AssociationQuestion::class)
                        ->findBy(['game' => $firstQuestion->getGame()]);

                    foreach ($defaultQuestions as $q) {
                        $newQ = new \App\Entity\AssociationQuestion();
                        $newQ->setTerme($q->getTerme());
                        $newQ->setDefinitions($q->getDefinitions());
                        $newQ->setBonneReponse($q->getBonneReponse());
                        $newQ->setGame($game);
                        $entityManager->persist($newQ);
                    }
                }
            }

            if ($type === Game::TYPE_CROSSWORD) {
                $firstQuestion = $entityManager
                    ->getRepository(\App\Entity\CrosswordQuestion::class)
                    ->findOneBy([]);

                if ($firstQuestion && $firstQuestion->getSession()) {
                    $defaultQuestions = $entityManager
                        ->getRepository(\App\Entity\CrosswordQuestion::class)
                        ->findBy(['session' => $firstQuestion->getSession()]);

                    foreach ($defaultQuestions as $q) {
                        $newQ = new \App\Entity\CrosswordQuestion();
                        $newQ->setDefinition($q->getDefinition());
                        $newQ->setMotCorrect($q->getMotCorrect());
                        $newQ->setSession($session);
                        $entityManager->persist($newQ);
                    }
                }
            }

            if ($type === Game::TYPE_FORMULATION) {
                $firstIngredient = $entityManager
                    ->getRepository(\App\Entity\Ingredient::class)
                    ->findOneBy([]);

                if ($firstIngredient && $firstIngredient->getSession()) {
                    $defaultIngredients = $entityManager
                        ->getRepository(\App\Entity\Ingredient::class)
                        ->findBy(['session' => $firstIngredient->getSession()]);

                    foreach ($defaultIngredients as $i) {
                        $newI = new \App\Entity\Ingredient();
                        $newI->setNom($i->getNom());
                        $newI->setCategorie($i->getCategorie());
                        $newI->setEstCorrect($i->getEstCorrect());
                        $newI->setSession($session);
                        $entityManager->persist($newI);
                    }
                }
            }
        }

        $session->setDuree($totalDurationSeconds);

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
                'id' => $game->getId(),
                'type' => $game->getType(),
                'sessionId' => $game->getSession()->getId(),
                'duree' => $game->getDuree(),
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
            'message' => 'Session rejointe',
            'code' => $session->getCodeSession(),
            'sessionId' => $session->getId(),
        ]);
    }

    #[Route('/session/{code}', name: 'app_session_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteSession(
        string $code,
        SessionRepository $sessionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);

        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($session->getCreateur() !== $this->getUser()) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $entityManager->remove($session);
        $entityManager->flush();

        return $this->json(['message' => 'Session supprimée'], Response::HTTP_OK);
    }

    #[Route('/stats/dashboard', name: 'app_dashboard_stats', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function dashboardStats(
        SessionRepository $sessionRepository,
        ParticipationRepository $participationRepository
    ): JsonResponse {
        $averageScore = $participationRepository->getAverageScore();
        $averageDuration = $participationRepository->getAverageDuration();

        return $this->json([
            'totalSessions' => $sessionRepository->count([]),
            'totalParticipants' => $participationRepository->count([]),
            'averageScore' => $averageScore !== null ? round($averageScore) : 0,
            'averageTime' => $averageDuration !== null ? round($averageDuration / 60) : 0,
        ]);
    }

    private function serializeSession(Session $session): array
    {
        return [
            'id' => $session->getId(),
            'titre' => $session->getTitreSession(),
            'code' => $session->getCodeSession(),
            'duree' => $session->getDuree(),
            'createur' => $session->getCreateur()?->getLogin(),
            'nbParticipants' => $session->getParticipations()->count(),
        ];
    }
}