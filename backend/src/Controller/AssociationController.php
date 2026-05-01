<?php

namespace App\Controller;

use App\Entity\AssociationQuestion;
use App\Entity\Game;
use App\Entity\Participation;
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
    #[Route('/{gameId}/questions', name: 'questions', methods: ['GET'])]
    public function getQuestions(
        int $gameId,
        GameRepository $gameRepository,
        AssociationQuestionRepository $questionRepository
    ): JsonResponse {
        $game = $gameRepository->find($gameId);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        $questions = $questionRepository->findBy(['game' => $game]);

     

        $data = array_map(function (AssociationQuestion $q) {
            $definitions = $q->getDefinitions();
            shuffle($definitions);
            return [
                'id' => $q->getId(),
                'terme' => $q->getTerme(),
                'definitions' => $definitions,
            ];
        }, $questions);

        return $this->json([
            'gameId' => $gameId,
            'questions' => $data,
        ]);
    }

    #[Route('/{gameId}/verify', name: 'verify', methods: ['POST'])]
    public function verifyReponses(
        int $gameId,
        Request $request,
        GameRepository $gameRepository,
        AssociationQuestionRepository $questionRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $game = $gameRepository->find($gameId);
        if (!$game) {
            return $this->json(['error' => 'Jeu introuvable'], 404);
        }

        $body = json_decode($request->getContent(), true);
        if (!isset($body['reponses']) || !is_array($body['reponses'])) {
            return $this->json(['error' => 'Format invalide, clé "reponses" manquante'], 400);
        }

        $questions = $questionRepository->findBy(['game' => $game]);
        


        $questionMap = [];
        foreach ($questions as $question) {
            $questionMap[$question->getId()] = $question;
        }

        $score = 0;
        $totalQuestions = count($questions);
        $corrections = [];
        $answeredQuestionIds = [];

        foreach ($body['reponses'] as $rep) {
            if (!isset($rep['questionId'], $rep['reponse'])) {
                continue;
            }

            $question = $questionMap[$rep['questionId']] ?? null;
            if (!$question) {
                continue;
            }

            $answeredQuestionIds[] = $question->getId();
            $estCorrect = ($question->getBonneReponse() === $rep['reponse']);
            if ($estCorrect) {
                $score++;
            }

            $corrections[] = [
                'questionId' => $question->getId(),
                'terme' => $question->getTerme(),
                'reponse' => $rep['reponse'],
                'bonneReponse' => $question->getBonneReponse(),
                'estCorrect' => $estCorrect,
            ];
        }

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

        $participantData = $body['participant'] ?? null;
        if ($participantData && isset($participantData['nom'], $participantData['prenom'])) {
            $participation = new Participation();
            $participation->setJoueurNom($participantData['nom']);
            $participation->setJoueurPrenom($participantData['prenom']);
            $participation->setScore($score);
            $participation->setDureeSeconds(max(0, (int)($body['duree'] ?? 0)));
            $participation->setSession($game->getSession());

            $em->persist($participation);
            $em->flush();
        }

        return $this->json([
            'score' => $score,
            'total' => $totalQuestions,
            'pourcentage' => $totalQuestions > 0 ? round(($score / $totalQuestions) * 100) : 0,
            'corrections' => $corrections,
        ]);
    }

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
        if (empty($body['terme']) || empty($body['definitions']) || empty($body['bonneReponse'])) {
            return $this->json(['error' => 'Champs obligatoires manquants'], 400);
        }

        $question = new AssociationQuestion();
        $question->setTerme($body['terme']);
        $question->setDefinitions($body['definitions']);
        $question->setBonneReponse($body['bonneReponse']);
        $question->setGame($game);

        $em->persist($question);
        $em->flush();

        return $this->json(['message' => 'OK', 'id' => $question->getId()], 201);
    }
}