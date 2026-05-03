<?php

// Namespace du contrôleur dans le projet Symfony.
namespace App\Controller;

// Entités utilisées par ce contrôleur.
use App\Entity\AssociationQuestion;
use App\Entity\Game;

// Repositories permettant d'accéder aux données en base.
use App\Repository\AssociationQuestionRepository;
use App\Repository\GameRepository;

// EntityManager permet d'enregistrer des modifications en base.
use Doctrine\ORM\EntityManagerInterface;

// Classe de base des contrôleurs Symfony.
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Classes Symfony pour les réponses JSON et les requêtes HTTP.
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

// Attribut Route pour définir les URLs.
use Symfony\Component\Routing\Attribute\Route;

// Préfixe commun à toutes les routes de ce contrôleur.
#[Route('/api/association', name: 'api_association_')]
class AssociationController extends AbstractController
{
    // Route GET /api/association/{gameId}/questions
    // Elle retourne les questions du jeu d’association.
    #[Route('/{gameId}/questions', name: 'questions', methods: ['GET'])]
    public function getQuestions(
        int $gameId,
        GameRepository $gameRepository,
        AssociationQuestionRepository $questionRepository
    ): JsonResponse {
        // Recherche le jeu demandé.
        $game = $gameRepository->find($gameId);

        // Si le jeu n’existe pas, on retourne une erreur 404.
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        // Récupère toutes les questions liées à ce jeu.
        $questions = $questionRepository->findBy(['game' => $game]);

        // Transforme les objets AssociationQuestion en tableaux simples pour le JSON.
        $data = array_map(function (AssociationQuestion $q) {
            $definitions = $q->getDefinitions();

            // Mélange les définitions pour éviter que l'ordre soit toujours identique.
            shuffle($definitions);

            return [
                'id' => $q->getId(),
                'terme' => $q->getTerme(),
                'definitions' => $definitions,
            ];
        }, $questions);

        // Retourne les questions au frontend.
        return $this->json([
            'gameId' => $gameId,
            'questions' => $data,
        ]);
    }

    // Route POST /api/association/{gameId}/verify
    // Elle vérifie les réponses envoyées par le frontend.
    #[Route('/{gameId}/verify', name: 'verify', methods: ['POST'])]
    public function verifyReponses(
        int $gameId,
        Request $request,
        GameRepository $gameRepository,
        AssociationQuestionRepository $questionRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // Recherche le jeu demandé.
        $game = $gameRepository->find($gameId);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        // Décode le JSON reçu dans la requête.
        $body = json_decode($request->getContent(), true);

        // Vérifie que la clé "reponses" existe et qu’elle contient un tableau.
        if (!isset($body['reponses']) || !is_array($body['reponses'])) {
            return $this->json(['error' => 'Format invalide, clé "reponses" manquante'], 400);
        }

        // Récupère les questions du jeu.
        $questions = $questionRepository->findBy(['game' => $game]);

        // Crée un tableau associatif questionId -> question pour retrouver rapidement chaque question.
        $questionMap = [];
        foreach ($questions as $question) {
            $questionMap[$question->getId()] = $question;
        }

        // Variables de calcul du score.
        $score = 0;
        $totalQuestions = count($questions);
        $corrections = [];
        $answeredQuestionIds = [];

        // Parcourt toutes les réponses envoyées par le frontend.
        foreach ($body['reponses'] as $rep) {
            if (!isset($rep['questionId'], $rep['reponse'])) {
                continue;
            }

            // Retrouve la question correspondant à l'identifiant envoyé.
            $question = $questionMap[$rep['questionId']] ?? null;

            if (!$question) {
                continue;
            }

            $answeredQuestionIds[] = $question->getId();

            // Vérifie si la réponse envoyée correspond à la bonne réponse.
            $estCorrect = ($question->getBonneReponse() === $rep['reponse']);

            if ($estCorrect) {
                $score++;
            }

            // Ajoute une correction détaillée.
            $corrections[] = [
                'questionId' => $question->getId(),
                'terme' => $question->getTerme(),
                'reponse' => $rep['reponse'],
                'bonneReponse' => $question->getBonneReponse(),
                'estCorrect' => $estCorrect,
            ];
        }

        // Ajoute aussi les questions non répondues dans les corrections.
        foreach ($questions as $question) {
            if (!in_array($question->getId(), $answeredQuestionIds, true)) {
                $corrections[] = [
                    'questionId' => $question->getId(),
                    'terme' => $question->getTerme(),
                    'reponse' => 'Non répondu',
                    'bonneReponse' => $question->getBonneReponse(),
                    'estCorrect' => false,
                ];
            }
        }

        // Retourne le score final au frontend.
        return $this->json([
            'score' => $score,
            'total' => $totalQuestions,
            'pourcentage' => $totalQuestions > 0 ? round(($score / $totalQuestions) * 100) : 0,
            'corrections' => $corrections,
        ]);
    }

    // Route POST /api/association/{gameId}/questions
    // Elle permet à un admin d'ajouter une question d’association.
    #[Route('/{gameId}/questions', name: 'add_question', methods: ['POST'])]
    public function addQuestion(
        int $gameId,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // Vérifie que l'utilisateur possède le rôle admin.
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        // Recherche le jeu concerné.
        $game = $gameRepository->find($gameId);

        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        // Récupère le JSON envoyé par Angular.
        $body = json_decode($request->getContent(), true);

        // Vérifie que les champs obligatoires existent.
        if (empty($body['terme']) || empty($body['definitions']) || empty($body['bonneReponse'])) {
            return $this->json(['error' => 'Champs obligatoires manquants'], 400);
        }

        // Crée une nouvelle question d'association.
        $question = new AssociationQuestion();
        $question->setTerme($body['terme']);
        $question->setDefinitions($body['definitions']);
        $question->setBonneReponse($body['bonneReponse']);
        $question->setGame($game);

        // Enregistre la question en base.
        $em->persist($question);
        $em->flush();

        // Retourne l'identifiant de la nouvelle question.
        return $this->json(['message' => 'OK', 'id' => $question->getId()], 201);
    }
}