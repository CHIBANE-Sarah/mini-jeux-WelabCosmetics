<?php

namespace App\Controller;

use App\Entity\CrosswordQuestion;
use App\Repository\CrosswordQuestionRepository;
use App\Repository\SessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class CrosswordController extends AbstractController
{
    #[Route('/api/crossword/{sessionCode}', name: 'crossword_get', methods: ['GET'])]
    public function getQuestions(
        string $sessionCode,
        SessionRepository $sessionRepository,
        CrosswordQuestionRepository $crosswordRepository
    ): JsonResponse {
        $session = $sessionRepository->findOneBy(['codeSession' => $sessionCode]);

        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        $questions = $crosswordRepository->findBy(['session' => $session]);

        $data = array_map(fn(CrosswordQuestion $q) => [
            'id'         => $q->getId(),
            'definition' => $q->getDefinition(),
            'motCorrect' => $q->getMotCorrect(),
        ], $questions);

        return $this->json($data);
    }

    #[Route('/api/crossword/validate', name: 'crossword_validate', methods: ['POST'])]
    public function validate(
        Request $request,
        CrosswordQuestionRepository $crosswordRepository
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);
        $reponses = $body['reponses'] ?? [];

        $score = 0;
        $total = count($reponses);
        $corrections = [];

        foreach ($reponses as $rep) {
            $question = $crosswordRepository->find($rep['id']);
            if (!$question) continue;

            $correct = strtolower(trim($rep['reponse'])) === strtolower(trim($question->getMotCorrect()));
            if ($correct) $score++;

            $corrections[] = [
                'id'         => $rep['id'],
                'correct'    => $correct,
                'motCorrect' => $question->getMotCorrect(),
            ];
        }

        return $this->json([
            'score'       => $score,
            'total'       => $total,
            'corrections' => $corrections,
        ]);
    }
}