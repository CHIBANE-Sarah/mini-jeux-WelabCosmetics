<?php

// Namespace du contrôleur dans l'application Symfony.
namespace App\Controller;

// Entités utilisées dans ce contrôleur.
use App\Entity\Session;
use App\Entity\Game;

// Repositories utilisés pour récupérer les données depuis la base.
use App\Repository\SessionRepository;
use App\Repository\ParticipationRepository;

// EntityManager permet de sauvegarder, modifier ou supprimer des entités.
use Doctrine\ORM\EntityManagerInterface;

// Classe de base des contrôleurs Symfony.
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Classes Symfony pour gérer les réponses JSON, les requêtes et les codes HTTP.
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

// Attribut Route pour définir les URLs des méthodes du contrôleur.
use Symfony\Component\Routing\Attribute\Route;

// Attribut permettant de protéger certaines routes selon le rôle utilisateur.
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Toutes les routes de ce contrôleur commencent par /api.
#[Route('/api')]
final class SessionController extends AbstractController
{
    // Route POST /api/session utilisée pour créer une session.
    #[Route('/session', name: 'app_session_create', methods: ['POST'])]

    // Seuls les administrateurs peuvent créer une session.
    #[IsGranted('ROLE_ADMIN')]
    public function create(
        Request $request,
        SessionRepository $sessionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Récupère l’utilisateur connecté.
        $admin = $this->getUser();

        // Sécurité supplémentaire : si aucun utilisateur n’est connecté, on refuse.
        if (!$admin) {
            return $this->json(['message' => 'Non autorisé.'], Response::HTTP_UNAUTHORIZED);
        }

        // Décode le JSON envoyé par Angular dans le corps de la requête.
        $data = json_decode($request->getContent(), true);

        // Vérifie que le titre de session est bien fourni.
        if (empty($data['titre'])) {
            return $this->json(
                ['message' => 'Le champ "titre" est requis.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Création d'un nouvel objet Session.
        $session = new Session();
        $session->setTitreSession($data['titre']);
        $session->setDuree(0);
        $session->setCreateur($admin);

        // Génère un code aléatoire unique pour la session.
        do {
            $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
        } while ($sessionRepository->findOneBy(['codeSession' => $code]) !== null);

        // Affecte le code généré à la session.
        $session->setCodeSession($code);

        // Récupère les types de jeux demandés ou utilise les trois jeux par défaut.
        $gameTypes = $data['gameTypes'] ?? [
            Game::TYPE_ASSOCIATION,
            Game::TYPE_CROSSWORD,
            Game::TYPE_FORMULATION,
        ];

        // Liste des types de jeux autorisés.
        $validTypes = [Game::TYPE_ASSOCIATION, Game::TYPE_CROSSWORD, Game::TYPE_FORMULATION];

        // Filtre les types reçus pour ne garder que les types valides et éviter les doublons.
        $gameTypes = array_values(array_unique(array_filter(
            $gameTypes,
            fn($t) => in_array($t, $validTypes, true)
        )));

        // Si aucun jeu valide n'est sélectionné, on renvoie une erreur.
        if (empty($gameTypes)) {
            return $this->json(['message' => 'Sélectionnez au moins un jeu.'], Response::HTTP_BAD_REQUEST);
        }

        // Durées par défaut des jeux, exprimées ici en minutes.
        $defaultDurations = [
            Game::TYPE_ASSOCIATION => 10,
            Game::TYPE_CROSSWORD => 15,
            Game::TYPE_FORMULATION => 20,
        ];

        // Récupère les durées personnalisées envoyées par Angular si elles existent.
        $gameDurations = $data['gameDurations'] ?? [];

        // Total de la durée de la session en secondes.
        $totalDurationSeconds = 0;

        // Création des jeux associés à la session.
        foreach ($gameTypes as $type) {
            $game = new Game();
            $game->setType($type);

            // Récupère la durée du jeu ou utilise une durée par défaut.
            $durationMinutes = (int) ($gameDurations[$type] ?? $defaultDurations[$type] ?? 10);

            // Convertit les minutes en secondes et garantit au moins 1 minute.
            $durationSeconds = max(1, $durationMinutes) * 60;

            // Affecte la durée au jeu.
            $game->setDuree($durationSeconds);

            // Ajoute cette durée au total de la session.
            $totalDurationSeconds += $durationSeconds;

            // Lie le jeu à la session.
            $session->addGame($game);

            // Prépare l'enregistrement du jeu en base.
            $entityManager->persist($game);

            // Si le jeu est de type association, on copie les questions d'association par défaut.
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

            // Si le jeu est de type crossword, on copie les questions de mots croisés par défaut.
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

            // Si le jeu est de type formulation, on copie les ingrédients par défaut.
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

        // Met à jour la durée totale de la session.
        $session->setDuree($totalDurationSeconds);

        // Prépare l'enregistrement de la session.
        $entityManager->persist($session);

        // Exécute toutes les requêtes SQL préparées avec persist().
        $entityManager->flush();

        // Retourne une réponse JSON avec la session créée.
        return $this->json([
            'message' => 'Session créée avec succès !',
            'session' => $this->serializeSession($session),
        ], Response::HTTP_CREATED);
    }

    // Route GET /api/sessions utilisée pour lister les sessions de l'admin connecté.
    #[Route('/sessions', name: 'app_session_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function list(SessionRepository $sessionRepository): JsonResponse
    {
        // Récupère uniquement les sessions créées par l'utilisateur connecté.
        $sessions = $sessionRepository->findBy(
            ['createur' => $this->getUser()],
            ['id' => 'DESC']
        );

        // Transforme chaque session en tableau avant de l’envoyer en JSON.
        return $this->json(array_map([$this, 'serializeSession'], $sessions));
    }

    // Route GET /api/session/{code} utilisée pour récupérer une session par son code.
    #[Route('/session/{code}', name: 'app_session_get', methods: ['GET'])]
    public function getSession(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        // Recherche la session avec un code normalisé en majuscules.
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);

        // Si aucune session n'est trouvée, on retourne une erreur 404.
        if (!$session) {
            return $this->json(
                ['message' => 'Session introuvable avec ce code.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Retourne les informations de la session en JSON.
        return $this->json($this->serializeSession($session));
    }

    // Route GET /api/session/{code}/games utilisée pour récupérer les jeux d'une session.
    #[Route('/session/{code}/games', name: 'app_session_games', methods: ['GET'])]
    public function getSessionGames(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        // Recherche la session concernée.
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);

        // Si la session n'existe pas, on retourne une erreur 404.
        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Récupère les jeux liés à cette session.
        $games = $session->getGames()->toArray();

        // Transforme les objets Game en tableaux simples pour la réponse JSON.
        return $this->json(array_map(function (Game $game) {
            return [
                'id' => $game->getId(),
                'type' => $game->getType(),
                'sessionId' => $game->getSession()->getId(),
                'duree' => $game->getDuree(),
            ];
        }, $games));
    }

    // Route POST /api/session/{code}/join utilisée lorsqu'un joueur rejoint une session.
    #[Route('/session/{code}/join', name: 'app_session_join', methods: ['POST'])]
    public function joinSession(string $code, SessionRepository $sessionRepository): JsonResponse
    {
        // Vérifie que la session existe.
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);

        // Si la session n'existe pas, on retourne une erreur 404.
        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Ici, le backend confirme simplement que la session existe.
        // Les informations du joueur sont surtout stockées côté frontend pour le parcours de jeu.
        return $this->json([
            'message' => 'Session rejointe',
            'code' => $session->getCodeSession(),
            'sessionId' => $session->getId(),
        ]);
    }

    // Route DELETE /api/session/{code} utilisée pour supprimer une session.
    #[Route('/session/{code}', name: 'app_session_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteSession(
        string $code,
        SessionRepository $sessionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Recherche la session à supprimer.
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($code)]);

        // Si elle n'existe pas, on retourne une erreur 404.
        if (!$session) {
            return $this->json(['message' => 'Session introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Vérifie que l'utilisateur connecté est bien le créateur de cette session.
        if ($session->getCreateur() !== $this->getUser()) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_FORBIDDEN);
        }

        // Supprime la session.
        $entityManager->remove($session);

        // Applique la suppression en base.
        $entityManager->flush();

        // Confirme la suppression.
        return $this->json(['message' => 'Session supprimée'], Response::HTTP_OK);
    }

    // Route GET /api/stats/dashboard utilisée pour afficher les statistiques admin.
    #[Route('/stats/dashboard', name: 'app_dashboard_stats', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function dashboardStats(
        SessionRepository $sessionRepository,
        ParticipationRepository $participationRepository
    ): JsonResponse {
        // Calcule le score moyen et la durée moyenne via le repository des participations.
        $averageScore = $participationRepository->getAverageScore();
        $averageDuration = $participationRepository->getAverageDuration();

        // Retourne les statistiques principales du dashboard.
        return $this->json([
            'totalSessions' => $sessionRepository->count([]),
            'totalParticipants' => $participationRepository->count([]),
            'averageScore' => $averageScore !== null ? round($averageScore) : 0,
            'averageTime' => $averageDuration !== null ? round($averageDuration / 60) : 0,
        ]);
    }

    // Méthode privée utilisée pour transformer une entité Session en tableau JSON.
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