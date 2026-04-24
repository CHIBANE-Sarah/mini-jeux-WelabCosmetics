<?php

namespace App\Controller;

use App\Entity\Ingredient;
use App\Repository\IngredientRepository;
use App\Repository\SessionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class FormulationController extends AbstractController
{
    /**
     * GET /api/formulation/{sessionCode}
     *
     * CORRECTION BUG #2 :
     * Même problème que CrosswordController — les Ingredient sont liés à une Session
     * fixture spécifique (session_3 / SESS03). Fallback sur la banque globale si la
     * session du joueur n'a pas d'ingrédients.
     */
    #[Route('/api/formulation/{sessionCode}', name: 'formulation_get', methods: ['GET'])]
    public function getIngredients(
        string $sessionCode,
        SessionRepository $sessionRepository,
        IngredientRepository $ingredientRepository
    ): JsonResponse {
        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($sessionCode)]);

        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        $ingredients = $ingredientRepository->findBy(['session' => $session]);

        // FALLBACK : si cette session n'a pas d'ingrédients,
        // on utilise la banque de la première session qui en possède.
        if (count($ingredients) === 0) {
            $firstIngredient = $ingredientRepository->findOneBy([]);
            if ($firstIngredient) {
                $ingredients = $ingredientRepository->findBy(['session' => $firstIngredient->getSession()]);
            }
        }

        $data = array_map(fn(Ingredient $i) => [
            'id'        => $i->getId(),
            'nom'       => $i->getNom(),
            'categorie' => $i->getCategorie(),
        ], $ingredients);

        return $this->json($data);
    }

    /**
     * POST /api/formulation/validate
     */
    #[Route('/api/formulation/validate', name: 'formulation_validate', methods: ['POST'])]
    public function validate(
        Request $request,
        IngredientRepository $ingredientRepository,
        SessionRepository $sessionRepository
    ): JsonResponse {
        $body        = json_decode($request->getContent(), true);
        $sessionCode = $body['sessionCode'] ?? null;
        $selectionIds = $body['ingredients'] ?? [];

        $session = $sessionRepository->findOneBy(['codeSession' => strtoupper($sessionCode)]);

        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        $tousIngredients = $ingredientRepository->findBy(['session' => $session]);

        // FALLBACK : même logique que le GET
        if (count($tousIngredients) === 0) {
            $firstIngredient = $ingredientRepository->findOneBy([]);
            if ($firstIngredient) {
                $tousIngredients = $ingredientRepository->findBy(['session' => $firstIngredient->getSession()]);
            }
        }

        $score       = 0;
        $total       = count(array_filter($tousIngredients, fn(Ingredient $i) => $i->getEstCorrect()));
        $corrections = [];

        foreach ($tousIngredients as $ingredient) {
            $selectionne = in_array($ingredient->getId(), $selectionIds);
            $correct     = $ingredient->getEstCorrect();

            if ($selectionne && $correct) {
                $score++;
            }

            $corrections[] = [
                'id'          => $ingredient->getId(),
                'nom'         => $ingredient->getNom(),
                'categorie'   => $ingredient->getCategorie(),
                'selectionne' => $selectionne,
                'correct'     => $correct,
            ];
        }

        return $this->json([
            'score'       => $score,
            'total'       => $total,
            'corrections' => $corrections,
        ]);
    }
}