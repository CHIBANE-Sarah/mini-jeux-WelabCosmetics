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
    /**
     * GET /api/crossword/{sessionCode}
     *
     * CORRECTION BUG #1 :
     * Les CrosswordQuestion sont liées à une Session spécifique (fixture session_1 / SESS01).
     * Quand un admin crée une nouvelle session via le dashboard, cette session n'a aucune
     * CrosswordQuestion. On applique donc le même fallback que AssociationController :
     * si la session du joueur n'a pas de questions, on prend la banque de la 1ère session
     * qui en possède.
     */
    #[Route('/api/crossword/{sessionCode}', name: 'crossword_get', methods: ['GET'])]
    public function getQuestions(
        string $sessionCode,
        SessionRepository $sessionRepository,
        CrosswordQuestionRepository $crosswordRepository
    ): JsonResponse {
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($sessionCode)]);

        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        $questions = $crosswordRepository->findBy(['session' => $session]);

        // FALLBACK : si cette session n'a pas de questions crossword,
        // on utilise la banque de la première session qui en possède.
        if (count($questions) === 0) {
            $firstQuestion = $crosswordRepository->findOneBy([]);
            if ($firstQuestion) {
                $questions = $crosswordRepository->findBy(['session' => $firstQuestion->getSession()]);
            }
        }

        $data = array_map(fn(CrosswordQuestion $q) => [
            'id'         => $q->getId(),
            'definition' => $q->getDefinition(),
            'motCorrect' => $q->getMotCorrect(),
        ], $questions);

        return $this->json($data);
    }

    /**
     * POST /api/crossword/validate
     * Méthode POST → pas de conflit de route avec GET /{sessionCode}.
     */
    #[Route('/api/crossword/validate', name: 'crossword_validate', methods: ['POST'])]
    public function validate(
        Request $request,
        CrosswordQuestionRepository $crosswordRepository
    ): JsonResponse {
        $body     = json_decode($request->getContent(), true);
        $reponses = $body['reponses'] ?? [];

        $score       = 0;
        $total       = count($reponses);
        $corrections = [];

        foreach ($reponses as $rep) {
            if (!isset($rep['id'], $rep['reponse'])) {
                continue;
            }

            $question = $crosswordRepository->find($rep['id']);
            if (!$question) {
                continue;
            }

            $correct = strtolower(trim($rep['reponse'])) === strtolower(trim($question->getMotCorrect()));
            if ($correct) {
                $score++;
            }

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