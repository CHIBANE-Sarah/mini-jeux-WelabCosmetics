<?php

// Namespace du contrôleur dans le projet Symfony.
namespace App\Controller;

// Entité représentant une question de mots croisés.
use App\Entity\CrosswordQuestion;

// Repositories utilisés pour accéder aux questions et aux sessions.
use App\Repository\CrosswordQuestionRepository;
use App\Repository\SessionRepository;

// EntityManager importé mais non utilisé ici.
use Doctrine\ORM\EntityManagerInterface;

// Classe de base des contrôleurs Symfony.
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Classes Symfony pour les réponses JSON et les requêtes HTTP.
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

// Attribut Route pour déclarer les routes.
use Symfony\Component\Routing\Attribute\Route;

class CrosswordController extends AbstractController
{
    /**
     * Route GET /api/crossword/{sessionCode}
     * Retourne les questions de mots croisés liées à une session.
     */
    #[Route('/api/crossword/{sessionCode}', name: 'crossword_get', methods: ['GET'])]
    public function getQuestions(
        string $sessionCode,
        SessionRepository $sessionRepository,
        CrosswordQuestionRepository $crosswordRepository
    ): JsonResponse {
        // Recherche la session à partir du code fourni dans l'URL.
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($sessionCode)]);

        // Si la session n'existe pas, on retourne une erreur 404.
        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        // Récupère les questions de mots croisés liées à cette session.
        $questions = $crosswordRepository->findBy(['session' => $session]);

        // Transforme les objets CrosswordQuestion en tableaux simples pour le JSON.
        $data = array_map(fn(CrosswordQuestion $q) => [
            'id'         => $q->getId(),
            'definition' => $q->getDefinition(),
            'motCorrect' => $q->getMotCorrect(),
        ], $questions);

        // Retourne les questions au frontend.
        return $this->json($data);
    }

    /**
     * Route POST /api/crossword/validate
     * Vérifie les réponses envoyées par le frontend.
     */
    #[Route('/api/crossword/validate', name: 'crossword_validate', methods: ['POST'])]
    public function validate(
        Request $request,
        CrosswordQuestionRepository $crosswordRepository
    ): JsonResponse {
        // Décode le JSON reçu.
        $body = json_decode($request->getContent(), true);

        // Récupère le tableau des réponses, ou un tableau vide si absent.
        $reponses = $body['reponses'] ?? [];

        // Initialise les variables de score.
        $score = 0;
        $total = count($reponses);
        $corrections = [];

        // Parcourt chaque réponse envoyée.
        foreach ($reponses as $rep) {
            if (!isset($rep['id'], $rep['reponse'])) {
                continue;
            }

            // Retrouve la question en base grâce à son id.
            $question = $crosswordRepository->find($rep['id']);

            if (!$question) {
                continue;
            }

            // Compare la réponse utilisateur et le mot correct sans tenir compte des majuscules/minuscules.
            $correct = strtolower(trim($rep['reponse'])) === strtolower(trim($question->getMotCorrect()));

            if ($correct) {
                $score++;
            }

            // Ajoute une correction pour le frontend.
            $corrections[] = [
                'id'         => $rep['id'],
                'correct'    => $correct,
                'motCorrect' => $question->getMotCorrect(),
            ];
        }

        // Retourne le score et les corrections.
        return $this->json([
            'score'       => $score,
            'total'       => $total,
            'corrections' => $corrections,
        ]);
    }
}