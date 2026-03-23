<?php

namespace App\Controller;

use App\Entity\AssociationQuestion;
use App\Entity\Game;
use App\Repository\AssociationQuestionRepository;
use App\Repository\GameRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/association', name: 'api_association_')]
class AssociationController extends AbstractController
{
    // ------------------------------------------------------------------
    // GET /api/association/{gameId}/questions
    // Retourne toutes les questions d'un jeu d'association
    // Le frontend récupère les termes + définitions mélangées
    // ------------------------------------------------------------------
    #[Route('/{gameId}/questions', name: 'questions', methods: ['GET'])]
    public function getQuestions(
        int $gameId,
        GameRepository $gameRepository,
        AssociationQuestionRepository $questionRepository
    ): JsonResponse {
        // Vérifier que le jeu existe
        $game = $gameRepository->find($gameId);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        // Vérifier que c'est bien un jeu d'association
        if ($game->getType() !== Game::TYPE_ASSOCIATION) {
            return $this->json(['error' => 'Ce jeu n\'est pas un jeu d\'association'], 400);
        }

        // Récupérer toutes les questions liées à ce jeu
        $questions = $questionRepository->findBy(['game' => $game]);

        // Construire la réponse JSON
        // On ne renvoie PAS la bonne réponse au frontend pour éviter la triche
        $data = array_map(function (AssociationQuestion $q) {
            $definitions = $q->getDefinitions();
            // Mélanger les définitions pour chaque question
            shuffle($definitions);

            return [
                'id'          => $q->getId(),
                'terme'       => $q->getTerme(),
                'definitions' => $definitions,
            ];
        }, $questions);

        return $this->json([
            'gameId'    => $gameId,
            'questions' => $data,
        ]);
    }

    // ------------------------------------------------------------------
    // POST /api/association/{gameId}/verify
    // Vérifie les réponses du joueur et retourne le score
    // Body JSON attendu :
    // {
    //   "reponses": [
    //     { "questionId": 1, "reponse": "Retient l'eau dans la formule" },
    //     { "questionId": 2, "reponse": "Protège le produit des microorganismes" }
    //   ]
    // }
    // ------------------------------------------------------------------
    #[Route('/{gameId}/verify', name: 'verify', methods: ['POST'])]
    public function verifyReponses(
        int $gameId,
        Request $request,
        GameRepository $gameRepository,
        AssociationQuestionRepository $questionRepository
    ): JsonResponse {
        // Vérifier que le jeu existe
        $game = $gameRepository->find($gameId);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        // Décoder le body JSON
        $body = json_decode($request->getContent(), true);
        if (!isset($body['reponses']) || !is_array($body['reponses'])) {
            return $this->json(['error' => 'Format invalide, clé "reponses" manquante'], 400);
        }

        $score       = 0;
        $total       = count($body['reponses']);
        $corrections = [];

        foreach ($body['reponses'] as $rep) {
            // Vérifier que les clés nécessaires sont présentes
            if (!isset($rep['questionId'], $rep['reponse'])) {
                continue;
            }

            $question = $questionRepository->find($rep['questionId']);
            if (!$question) {
                continue;
            }

            $estCorrect = ($question->getBonneReponse() === $rep['reponse']);
            if ($estCorrect) {
                $score++;
            }

            // Détail de la correction pour affichage côté frontend
            $corrections[] = [
                'questionId'   => $rep['questionId'],
                'terme'        => $question->getTerme(),
                'reponse'      => $rep['reponse'],
                'bonneReponse' => $question->getBonneReponse(),
                'estCorrect'   => $estCorrect,
            ];
        }

        return $this->json([
            'score'       => $score,
            'total'       => $total,
            'pourcentage' => $total > 0 ? round(($score / $total) * 100) : 0,
            'corrections' => $corrections,
        ]);
    }

    // ------------------------------------------------------------------
    // POST /api/association/{gameId}/questions
    // Ajouter une nouvelle question à un jeu (ROLE_ADMIN uniquement)
    // Body JSON attendu :
    // {
    //   "terme": "Tensioactif",
    //   "definitions": ["Def1", "Def2", "Def3"],
    //   "bonneReponse": "Def1"
    // }
    // ------------------------------------------------------------------
    #[Route('/{gameId}/questions', name: 'add_question', methods: ['POST'])]
    public function addQuestion(
        int $gameId,
        Request $request,
        GameRepository $gameRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $game = $gameRepository->find($gameId);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        $body = json_decode($request->getContent(), true);

        // Validation des champs obligatoires
        if (
            empty($body['terme']) ||
            empty($body['definitions']) ||
            empty($body['bonneReponse'])
        ) {
            return $this->json(['error' => 'Champs terme, definitions et bonneReponse obligatoires'], 400);
        }

        // Vérifier que la bonne réponse est bien dans la liste des définitions
        if (!in_array($body['bonneReponse'], $body['definitions'])) {
            return $this->json(['error' => 'La bonne réponse doit faire partie des définitions'], 400);
        }

        $question = new AssociationQuestion();
        $question->setTerme($body['terme']);
        $question->setDefinitions($body['definitions']);
        $question->setBonneReponse($body['bonneReponse']);
        $question->setGame($game);

        $em->persist($question);
        $em->flush();

        return $this->json([
            'message' => 'Question ajoutée avec succès',
            'id'      => $question->getId(),
        ], 201);
    }
}